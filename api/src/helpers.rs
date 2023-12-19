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
    pub added_at: DateTime<Utc>,
    pub author: String,
    pub title: String,
    pub description: String,
}

pub async fn create_blog_sql(blog: &Json<BlogIn>, pool: &PgPool) {
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
            added_at: row.get("added_at"),
            author: row.get("author"),
            title: row.get("title"),
            description: row.get("description"),
        })
        .fetch_all(pool)
        .await
        .expect("Error retrieving blog")
}
