import { fetchedBlog } from "@/types/Blog";
import axios from "axios";

export const fetchBlogs = async (): Promise<fetchedBlog[]> => {
  const data = await axios.get(import.meta.env.VITE_API_URL + "blog/retrieve");
  const sortedData = data.data;
//   sortedData.forEach((element: fetchedBlog) => {
//     console.log(
//       element.title,
//       element.added_at,
//       Date.parse(element.added_at.toString())
//     );
//     element.added_at = Date.parse(element.added_at.toString());
//   });
  sortedData.sort((a: fetchedBlog, b: fetchedBlog):boolean => a.added_at < b.added_at);
  console.log(sortedData);
  return sortedData;
};
