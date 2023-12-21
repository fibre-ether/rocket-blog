import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogCard from "./app_components/BlogCard";
import { fetchBlogs } from "./helpers/fetch-blogs";
import { useQuery } from "@tanstack/react-query";
import SubmitBlogCard from "./app_components/SubmitBlogCard";
import UseUsername from "./helpers/use-username";
import { useState } from "react";
import { ScrollArea } from "./components/ui/scroll-area";
import axios from "axios";

function App() {
  const { userName } = UseUsername();
  console.log("username is app:", userName);

  const { data, error, status, refetch } = useQuery({
    queryKey: ["blogs"],
    queryFn: fetchBlogs(userName),
    staleTime: Infinity,
  });
  console.log(data);

  const defaultTabValue = "view";

  const [tabValue, setTabValue] = useState(defaultTabValue);

  const handleVote = (
    username: string,
    blog_key: number,
    action_payload: string
  ) => {
    axios
      .post(import.meta.env.VITE_API_URL + "blog/vote", {
        username,
        blog_key,
        action_payload,
      })
      .then(() => refetch());
  };

  return (
    <div className="w-screen h-screen flex justify-center items-start py-5 bg-slate-600">
      <Tabs
        defaultValue={defaultTabValue}
        value={tabValue}
        className="w-[400px] h-full flex flex-col items-center">
        <TabsList>
          <TabsTrigger value="view" onClick={() => setTabValue("view")}>
            View Blogs
          </TabsTrigger>
          <TabsTrigger value="create" onClick={() => setTabValue("create")}>
            Create Blogs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="view" className="max-h-[95%] w-full">
          <ScrollArea className="w-full h-full px-4">
            {status == "pending"
              ? "Loading..."
              : status == "error"
              ? `Error: ${error}`
              : data &&
                data.map((item, index) => {
                  console.log(item);
                  return (
                    <BlogCard
                      userName={userName}
                      handleVote={handleVote}
                      {...item}
                      key={index}
                    />
                  );
                })}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="create" className="w-full px-4">
          <SubmitBlogCard userName={userName} setTabValue={setTabValue} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
