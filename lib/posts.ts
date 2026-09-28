import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

export type PostCategory = "journal" | "japanese";
export type PostStatus = "draft" | "published";
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: PostCategory;
  status: PostStatus;
  featured: boolean;
  reading_time: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  gallery?: string[];
};

export const fallbackPosts: Post[] = [
  { id: "fallback-1", slug: "quiet-magic", title: "The quiet magic of an ordinary Tuesday", excerpt: "A walk through campus, a warm cup of tea, and the small rituals that make a new place feel like home.", content: "A walk through campus, a warm cup of tea, and the small rituals that make a new place feel like home.", cover_image_url: null, category: "journal", status: "published", featured: true, reading_time: 4, seo_title: null, seo_description: null, published_at: "2026-09-14T00:00:00Z", created_at: "2026-09-14T00:00:00Z", updated_at: "2026-09-14T00:00:00Z" },
  { id: "fallback-3", slug: "kotoba-no-ma", title: "言葉の間 — learning to hear the spaces", excerpt: "Why my most useful Japanese lesson this month happened on a train, not in a textbook.", content: "Why my most useful Japanese lesson this month happened on a train, not in a textbook.", cover_image_url: null, category: "japanese", status: "published", featured: false, reading_time: 6, seo_title: null, seo_description: null, published_at: "2026-08-21T00:00:00Z", created_at: "2026-08-21T00:00:00Z", updated_at: "2026-08-21T00:00:00Z" },
];

export async function getPublishedPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await (await createClient()).from("posts").select("*").eq("status", "published").order("published_at", { ascending: false });
  return error || !data ? [] : (data as Post[]);
}

export async function getPostBySlug(slug: string) {
  if (!isSupabaseConfigured) return fallbackPosts.find((post) => post.slug === slug) ?? null;
  const client = await createClient();
  const { data } = await client.from("posts").select("*").eq("slug", decodeURIComponent(slug)).eq("status", "published").maybeSingle();
  if (!data) return null;
  const { data: images } = await client.from("post_images").select("image_url").eq("post_id", data.id).order("sort_order");
  return { ...data, gallery: (images ?? []).map((image) => image.image_url) } as Post & { gallery: string[] };
}

export async function getAdminPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await (await createClient()).from("posts").select("*").order("updated_at", { ascending: false });
  return error || !data ? [] : (data as Post[]);
}

export async function getSubscriberCount(): Promise<number | null> {
  if (!isSupabaseConfigured) return null;
  const { count, error } = await (await createClient())
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true });
  return error ? null : count ?? 0;
}
