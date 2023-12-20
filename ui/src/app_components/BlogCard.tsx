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
import cx from "classnames";

type Props = {
  userName: string;
  title: string;
  author: string;
  description: string;
  added_at: string;
  votes: number;
  action_payload: string;
  blog_key: number;
  handleVote: (
    username: string,
    blog_key: number,
    action_payload: string
  ) => void;
};

function BlogCard({
  userName,
  title,
  author,
  description,
  added_at,
  votes,
  action_payload,
  blog_key,
  handleVote,
}: Props) {
  const date = new Date(Date.parse(added_at))
    .toLocaleDateString("en", {
      dateStyle: "long",
    })
    .toString();

  const onVote = (type: string) => {
    handleVote(userName, blog_key, type);
  };

  const upVoteClassName = cx({
    "bg-slate-600 border-[3px] border-white/25": action_payload === "increment",
  });
  const downVoteClassName = cx({
    "bg-slate-600 border-[3px] border-white/25": action_payload === "decrement",
  });

  return (
    <Card className="shadow-md mb-4">
      <CardHeader className="flex-row relative">
        <div className="h-full w-3/4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>by {author}</CardDescription>
        </div>
        <div className="absolute top-2 right-6 w-1/6 h-28 flex flex-col justify-between items-center">
          <Button
            variant={"secondary"}
            className={upVoteClassName}
            onClick={() =>
              onVote(action_payload == "increment" ? "reset" : "increment")
            }>
            <ArrowUp />
          </Button>
          <p>{votes}</p>
          <Button
            variant={"secondary"}
            className={downVoteClassName}
            onClick={() =>
              onVote(action_payload == "decrement" ? "reset" : "decrement")
            }>
            <ArrowDown />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="w-3/4">
        <p>{description}</p>
      </CardContent>
      <CardFooter className="text-xs flex justify-end w-full">
        {date} {action_payload}
      </CardFooter>
    </Card>
  );
}

export default BlogCard;
