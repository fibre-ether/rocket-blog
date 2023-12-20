export type Blog = {
  // added_at?: number;
  author: string;
  title: string;
  description: string;
};

export type fetchedBlog = {
  blog_key: number,
  added_at: string;
  author: string;
  title: string;
  description: string;
  votes: number;
  action_payload: string;
};
