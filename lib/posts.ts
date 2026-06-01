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
};

export function getAllPosts(): PostMeta[] {
  return (postsData as { slug: string; raw: string }[])
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
  const found = (postsData as { slug: string; raw: string }[]).find(
    (p) => p.slug === slug
  );
  if (!found) throw new Error(`Post not found: ${slug}`);
  const { data, content } = matter(found.raw);
  return {
    slug,
    title: data.title ?? "Untitled",
    date: data.date ?? "",
    tags: data.tags ?? [],
    content,
  };
}