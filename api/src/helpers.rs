use chrono::{DateTime, Utc};
use rocket::serde::{json::Json, Deserialize, Serialize};
use sqlx::{postgres::PgRow, PgPool, Row};

#[derive(Deserialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct BlogIn {
    pub author: String,
    pub title: String,
    pub description: String,
}
#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct BlogOut {
    pub blog_key: i64,
    pub added_at: DateTime<Utc>,
    pub author: String,
    pub title: String,
    pub description: String,
    pub votes: i32,
}

#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct UserVoteAction {
    username: String,
    blog_key: i64,
    action_payload: String,
}
// pub struct UserCommentAction {
//     username: String,
//     blog_key: i64,
//     action_payload: String,
// }

pub async fn create_blog_sql(blog: Json<BlogIn>, pool: &PgPool) {
    let query = "INSERT INTO posts (author, title, description, added_at) VALUES ($1, $2, $3, $4)";
    sqlx::query(query)
        .bind(&blog.author)
        .bind(&blog.title)
        .bind(&blog.description)
        .bind(Utc::now())
        .execute(pool)
        .await
        .expect("Error creating blog");
}

pub async fn retrieve_blogs_sql(pool: &PgPool) -> Vec<BlogOut> {
    let query = "SELECT * FROM posts";
    sqlx::query(query)
        .map(|row: PgRow| BlogOut {
            blog_key: row.get("blog_key"),
            added_at: row.get("added_at"),
            author: row.get("author"),
            title: row.get("title"),
            description: row.get("description"),
            votes: row.get("votes"),
        })
        .fetch_all(pool)
        .await
        .expect("Error retrieving blog")
}

pub async fn vote_on_blog_sql(user_post_action: Json<UserVoteAction>, pool: &PgPool) -> &str {
    let mut status = "duplicate vote";
    let mut tx = pool
        .begin()
        .await
        .expect("Error during starting transaction");

    let query_select = "SELECT action_payload FROM user_posts WHERE username = $1 AND action_type = 'vote' AND blog_key = $2 ORDER BY added_time DESC";

    let query_vote = match user_post_action.action_payload.as_str() {
        "increment" => "UPDATE posts SET votes = votes + $1 WHERE blog_key=$2",
        "decrement" => "UPDATE posts SET votes = votes - $1 WHERE blog_key=$2",
        _ => "",
    };

    let query_user_action = "INSERT INTO user_posts (username, blog_key, action_type, action_payload, added_time) VALUES ($1, $2, $3, $4, $5)";

    let previous_user_action_row = sqlx::query(query_select)
        .bind(&user_post_action.username)
        .bind(user_post_action.blog_key)
        .fetch_one(&mut *tx)
        .await;

    let previous_user_action = match previous_user_action_row {
        Ok(row) => match row.try_get::<String, &str>("action_payload") {
            Ok(value) => value,
            Err(_) => "empty".to_string(),
        },
        Err(_) => "empty".to_string(),
    };
    println!("prev user action: {previous_user_action}");
    if previous_user_action != user_post_action.action_payload {
        status = "vote added";
        sqlx::query(query_vote)
            .bind(if previous_user_action == *"empty".to_string() {
                1
            } else {
                2
            })
            .bind(user_post_action.blog_key)
            .execute(&mut *tx)
            .await
            .expect("Error during executing vote query");

        sqlx::query(query_user_action)
            .bind(&user_post_action.username)
            .bind(user_post_action.blog_key)
            .bind("vote")
            .bind(&user_post_action.action_payload)
            .bind(Utc::now())
            .execute(&mut *tx)
            .await
            .expect("Error during executing user vote action query");
    }

    tx.commit()
        .await
        .expect("Error during commitng transaction");
    status
}
