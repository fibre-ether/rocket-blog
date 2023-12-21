#[macro_use]
extern crate rocket;

mod helpers;
use helpers::{
    create_blog_sql, retrieve_blogs_sql, vote_on_blog_sql, BlogIn, BlogOut, MyState, UserVoteAction,
};
use rocket::http::Method;
use rocket::serde::json::Json;
use rocket::State;
use rocket_cors::{AllowedHeaders, AllowedOrigins};
use shuttle_runtime::CustomError;
use sqlx::{Executor, PgPool};

#[get("/")]
fn index() -> String {
    String::from("Hello world")
}

#[get("/retrieve?<username>")]
async fn retrieve_blogs(username: &str, state: &State<MyState>) -> Json<Vec<BlogOut>> {
    let blogs = retrieve_blogs_sql(username, state).await;
    Json(blogs)
}

#[post("/submit", data = "<blog>")]
async fn submit_blog(blog: Json<BlogIn>, state: &State<MyState>) -> String {
    create_blog_sql(blog, state).await;
    "post added".to_string()
}

#[post("/vote", data = "<user_post_action>")]
async fn vote_on_blog(user_post_action: Json<UserVoteAction>, state: &State<MyState>) -> &str {
    vote_on_blog_sql(user_post_action, state).await
}

#[shuttle_runtime::main]
async fn rocket(#[shuttle_shared_db::Postgres] pool: PgPool) -> shuttle_rocket::ShuttleRocket {
    let allowed_origins = AllowedOrigins::All;

    // You can also deserialize this
    let cors = rocket_cors::CorsOptions {
        allowed_origins,
        allowed_methods: vec![Method::Get, Method::Post]
            .into_iter()
            .map(From::from)
            .collect(),
        allowed_headers: AllowedHeaders::All,
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()
    .expect("Error while setting cors");

    pool.execute(include_str!("../schema.sql"))
        .await
        .map_err(CustomError::new)?;

    let state = MyState { pool };
    let rocket = rocket::build()
        .mount("/", routes![index])
        .mount("/blog", routes![submit_blog, retrieve_blogs, vote_on_blog])
        .manage(state)
        .attach(cors);

    Ok(rocket.into())
}
