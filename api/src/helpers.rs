use std::cmp::Ordering;

use chrono::{DateTime, Utc};
use rocket::{
    serde::{json::Json, Deserialize, Serialize},
    State,
};
use sqlx::{postgres::PgRow, PgPool, Row};

pub struct MyState {
    pub pool: PgPool,
}

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
    pub action_payload: String,
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

pub async fn create_blog_sql(blog: Json<BlogIn>, state: &State<MyState>) {
    let query = "INSERT INTO posts (author, title, description, added_at) VALUES ($1, $2, $3, $4)";
    sqlx::query(query)
        .bind(&blog.author)
        .bind(&blog.title)
        .bind(&blog.description)
        .bind(Utc::now())
        .execute(&state.pool)
        .await
        .expect("Error creating blog");
}

pub async fn retrieve_blogs_sql(username: &str, state: &State<MyState>) -> Vec<BlogOut> {
    let query = "
        SELECT p.author, p.title, p.description, p.votes, p.blog_key, p.added_at,
            COALESCE(up.action_payload, 'reset') as action_payload
        FROM posts p
        LEFT JOIN (
            SELECT username, blog_key, action_payload, added_time
            FROM (
                SELECT username, blog_key, action_payload, added_time,
                    ROW_NUMBER() OVER (PARTITION BY blog_key ORDER BY added_time DESC) AS rn
                FROM user_posts
                WHERE action_type = 'vote'
                AND username = $1
            ) latest_user_posts
            WHERE latest_user_posts.rn = 1
        ) up ON p.blog_key = up.blog_key
    ";
    sqlx::query(query)
        .bind(username)
        .map(|row: PgRow| BlogOut {
            blog_key: row.get("blog_key"),
            added_at: row.get("added_at"),
            author: row.get("author"),
            title: row.get("title"),
            description: row.get("description"),
            votes: row.get("votes"),
            action_payload: row.get("action_payload"),
        })
        .fetch_all(&state.pool)
        .await
        .expect("Error retrieving blog")
}

pub async fn vote_on_blog_sql(
    user_post_action: Json<UserVoteAction>,
    state: &State<MyState>,
) -> &str {
    let mut status = "duplicate vote";
    let mut tx = state
        .pool
        .begin()
        .await
        .expect("Error during starting transaction");

    let query_select_user_action = "SELECT action_payload FROM user_posts WHERE username = $1 AND action_type = 'vote' AND blog_key = $2 ORDER BY added_time DESC";

    let query_user_action = "INSERT INTO user_posts (username, blog_key, action_type, action_payload, added_time) VALUES ($1, $2, $3, $4, $5)";

    let previous_user_action_row = sqlx::query(query_select_user_action)
        .bind(&user_post_action.username)
        .bind(user_post_action.blog_key)
        .fetch_one(&mut *tx)
        .await;

    let previous_user_action = match previous_user_action_row {
        Ok(row) => match row.try_get::<String, &str>("action_payload") {
            Ok(value) => match value.as_str() {
                "increment" => 1,
                "decrement" => -1,
                _ => 0,
            },
            Err(e) => {
                println!("Error {e} during getting action payload from row");
                0
            }
        },
        Err(e) => {
            println!("Error {e} during fetching previous user action");
            0
        }
    };

    let current_user_action = match user_post_action.action_payload.as_str() {
        "increment" => 1,
        "decrement" => -1,
        _ => 0,
    };

    let final_action: i32 = current_user_action - previous_user_action;

    let query_sign = match final_action.cmp(&0) {
        Ordering::Less => "-",
        Ordering::Greater => "+",
        Ordering::Equal => "+",
    };

    let query_vote = format!(
        "UPDATE posts SET votes = votes {} {} WHERE blog_key=$1",
        query_sign,
        final_action.abs()
    );

    println!("user action: {previous_user_action} -> {current_user_action} = {final_action}");

    if final_action != 0 {
        println!("doing db stuff");
        status = "vote added";
        sqlx::query(&query_vote)
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
