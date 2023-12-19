import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

type Props = {
  title: string;
  author: string;
  description: string;
  added_at: string;
};

function BlogCard({ title, author, description, added_at }: Props) {
  const date = new Date(Date.parse(added_at))
    .toLocaleDateString("en", {
      dateStyle: "long",
    })
    .toString();
  return (
    <Card className="shadow-md mb-4">
      <CardHeader className="flex-row relative">
        <div className="h-full w-3/4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>by {author}</CardDescription>
        </div>
        <div className="absolute top-2 right-6 w-1/6 h-28 flex flex-col justify-between items-center">
          <Button variant={"secondary"}>
            <ArrowUp />
          </Button>
          <p>1</p>
          <Button variant={"secondary"}>
            <ArrowDown />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="w-3/4">
        <p>{description}</p>
      </CardContent>
      <CardFooter className="text-xs flex justify-end w-full">
        {date}
      </CardFooter>
    </Card>
  );
}

export default BlogCard;
