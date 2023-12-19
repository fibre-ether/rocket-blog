import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>by {author}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
      <CardFooter className="text-xs flex justify-end w-full">
        {date}
      </CardFooter>
    </Card>
  );
}

export default BlogCard;
