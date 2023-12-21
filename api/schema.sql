-- DROP TABLE IF EXISTS posts;
CREATE TABLE IF NOT EXISTS posts (
  author VARCHAR(50),
  title VARCHAR(100),
  description VARCHAR(500),
  added_at TIMESTAMPTZ,
  votes INTEGER DEFAULT 0,
  blog_key BIGSERIAL PRIMARY KEY
);
-- DROP TABLE IF EXISTS user_posts;
CREATE TABLE IF NOT EXISTS user_posts (
  username varchar(50),
  blog_key BIGSERIAL,
  CONSTRAINT fk_blog_key FOREIGN KEY(blog_key) REFERENCES posts(blog_key),
  action_type varchar(20),
  action_payload varchar(200),
  added_time TIMESTAMPTZ
);