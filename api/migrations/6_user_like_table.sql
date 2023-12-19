CREATE TABLE user_posts (
    username varchar(50),
    blog_key BIGSERIAL,
    CONSTRAINT fk_blog_key FOREIGN KEY(blog_key) REFERENCES posts(blog_key),
    action_type varchar(20),
    action_payload varchar(200)
);