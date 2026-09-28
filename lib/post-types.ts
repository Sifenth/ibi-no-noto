export type PostCategory = "journal" | "japanese";
export type PostStatus = "draft" | "published";
export type Post = {
  id: string; slug: string; title: string; excerpt: string; content: string;
  cover_image_url: string | null; category: PostCategory; status: PostStatus;
  featured: boolean; reading_time: number; seo_title: string | null;
  seo_description: string | null; published_at: string | null;
  created_at: string; updated_at: string; gallery?: string[];
};

export const fallbackPosts: Post[] = [
  { id: "fallback-1", slug: "quiet-magic", title: "The quiet magic of an ordinary Tuesday", excerpt: "A walk through campus, a warm cup of tea, and the small rituals that make a new place feel like home.", content: "A walk through campus, a warm cup of tea, and the small rituals that make a new place feel like home.", cover_image_url: null, category: "journal", status: "published", featured: true, reading_time: 4, seo_title: null, seo_description: null, published_at: "2026-09-14T00:00:00Z", created_at: "2026-09-14T00:00:00Z", updated_at: "2026-09-14T00:00:00Z" },
  { id: "fallback-2", slug: "kotoba-no-ma", title: "言葉の間 — learning to hear the spaces", excerpt: "Why my most useful Japanese lesson this month happened on a train, not in a textbook.", content: "Why my most useful Japanese lesson this month happened on a train, not in a textbook.", cover_image_url: null, category: "japanese", status: "published", featured: false, reading_time: 6, seo_title: null, seo_description: null, published_at: "2026-08-21T00:00:00Z", created_at: "2026-08-21T00:00:00Z", updated_at: "2026-08-21T00:00:00Z" },
];
