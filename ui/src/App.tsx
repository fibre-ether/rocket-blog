import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogCard from "./app_components/BlogCard";
import { fetchBlogs } from "./helpers/fetch-blogs";
import { useQuery } from "@tanstack/react-query";
import SubmitBlogCard from "./app_components/SubmitBlogCard";
import UseUsername from "./helpers/use-username";
import { useState } from "react";

function App() {
  const { data, error, status } = useQuery({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
  });

  const defaultTabValue = "view";

  const { userName } = UseUsername();
  const [tabValue, setTabValue] = useState(defaultTabValue);

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
        <TabsContent
          value="view"
          className="space-y-4 w-full h-full overflow-auto px-4">
          {status == "pending"
            ? "Loading..."
            : status == "error"
            ? `Error: ${error}`
            : data.map((item, index) => {
                return <BlogCard {...item} key={index} />;
              })}
        </TabsContent>
        <TabsContent value="create" className="w-full px-4">
          <SubmitBlogCard userName={userName} setTabValue={setTabValue} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
