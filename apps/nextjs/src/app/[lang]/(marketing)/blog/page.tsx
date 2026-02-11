/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */

import { compareDesc } from "date-fns";

import { BlogPosts } from "~/components/blog/blog-posts";
import { allPosts } from ".contentlayer/generated";

export const metadata = {
  title: "Blog",
};

export default function BlogPage() {
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
