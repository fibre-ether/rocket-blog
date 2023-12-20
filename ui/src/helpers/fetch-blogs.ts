import { fetchedBlog } from "@/types/Blog";
import axios from "axios";

export const fetchBlogs = (
  userName: string
): (() => Promise<fetchedBlog[]>) => {
  return async function (): Promise<fetchedBlog[]> {
    console.log("username in fetch blogs:", userName)
    const data = await axios.get(
      import.meta.env.VITE_API_URL + `blog/retrieve?username=${userName}`
    );
    const sortedData = data.data;
    sortedData.sort(
      (a: fetchedBlog, b: fetchedBlog): boolean => a.added_at < b.added_at
    );
    console.log(sortedData);
    return sortedData;
  };
};
