import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { fetchBlogs } from "@/helpers/fetch-blogs";
import { submitBlogs } from "@/helpers/submit-blogs";
import { Blog } from "@/types/Blog";
import { ResponseResult } from "@/types/ResponseStatus";
import { useQuery } from "@tanstack/react-query";
import { MutableRefObject, useRef } from "react";

type Props = {
  userName: string;
  setTabValue: (arg0: string) => void;
};

function SubmitBlogCard({ userName, setTabValue }: Props) {
  type elementsRefType = {
    title: HTMLInputElement | null;
    description: HTMLTextAreaElement | null;
  };
  const elementsRef: MutableRefObject<elementsRefType> = useRef({
    title: null,
    description: null,
  });

  const { toast } = useToast();
  const { refetch } = useQuery({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Create Blog</CardTitle>
        <CardDescription>Create a new blog for anyone to see</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="w-full flex flex-col space-y-4">
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="title">Blog Title</Label>
            <Input
              ref={(el) => (elementsRef.current.title = el)}
              id="title"
              placeholder="Title of your blog"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="description">Blog Description</Label>
            <Textarea
              ref={(el) => (elementsRef.current.description = el)}
              id="description"
              placeholder="Title of your blog"
              className="max-h-[300px]"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between">
          <Button variant={"outline"}>Reset</Button>
          <Button
            onClick={async () => {
              const title = elementsRef.current.title?.value;
              const description = elementsRef.current.description?.value;
              if (title && description) {
                const newBlog: Blog = {
                  author: userName,
                  title,
                  description,
                };
                toast({
                  title: "Adding Blog...",
                  description:
                    "Your blog is being added. Please wait for the success message.",
                });
                const responseStatus: ResponseResult = await submitBlogs(
                  newBlog
                );
                if (responseStatus.status == "success") {
                  toast({
                    title: "Blog added!",
                    description:
                      "Your blog was successfully added. \nRedirecting to View Blogs...",
                  });
                  refetch().then(() => setTabValue("view"));
                } else {
                  toast({
                    title: "Blog not added.",
                    description: `There was an error while uploading your blog. \n ${responseStatus.error}`,
                  });
                }
                /* redirect to view blogs */
              } else {
                console.log("empty form");
              }
            }}>
            Submit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default SubmitBlogCard;
