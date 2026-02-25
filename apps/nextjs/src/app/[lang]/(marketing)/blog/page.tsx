import { compareDesc } from "date-fns";

import { BlogPosts } from "~/components/blog/blog-posts";
import type { Post } from "~/types";
import { allPosts as rawPosts } from ".contentlayer/generated";

export const metadata = {
  title: "Blog",
};

export default function BlogPage() {
  const allPosts = rawPosts as Post[];
  const posts = allPosts
    .filter((post) => post.published)
    .sort((a, b) => {
      return compareDesc(new Date(a.date), new Date(b.date));
    });

  return (
    <main>
      <BlogPosts posts={posts} />
    </main>
  );
}
