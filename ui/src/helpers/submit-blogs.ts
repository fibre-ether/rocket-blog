import { Blog } from "@/types/Blog";
import { ResponseResult } from "@/types/ResponseStatus";
import axios from "axios";

export const submitBlogs = async (blog: Blog): Promise<ResponseResult> => {
  const result = axios
    .post(import.meta.env.VITE_API_URL + "blog/submit", blog)
    .then((e) => {
      console.log(e);
      const responseResult: ResponseResult = {status: 'success'}
      return responseResult;
    })
    .catch((e) => {
        console.log(e);
        const responseResult: ResponseResult = {status: 'failure', error:String(e)}
        return responseResult;
    });

    await result;
    return result;
};
