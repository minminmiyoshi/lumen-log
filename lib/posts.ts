import matter from "gray-matter";
import postsData from "../data/posts.json";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
};

export type Post = PostMeta & {
  content: string;
  html: string;
};

type PostRecord = { slug: string; raw: string; html: string };

export function getAllPosts(): PostMeta[] {
  return (postsData as PostRecord[])
    .map(({ slug, raw }) => {
      const { data } = matter(raw);
      return {
        slug,
        title: data.title ?? "Untitled",
        date: data.date ?? "",
        tags: data.tags ?? [],
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post {
  const found = (postsData as PostRecord[]).find((p) => p.slug === slug);
  if (!found) throw new Error(`Post not found: ${slug}`);
  const { data, content } = matter(found.raw);
  return {
    slug,
    title: data.title ?? "Untitled",
    date: data.date ?? "",
    tags: data.tags ?? [],
    content,
    html: found.html,
  };
}