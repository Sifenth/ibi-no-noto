"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import type { PostCategory, PostStatus } from "./posts";
import { publishedNoteEmail } from "./email";

const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const slugify = (title: string) => title.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "") || `note-${Date.now()}`;

async function notifySubscribers(client: Awaited<ReturnType<typeof createClient>>, post: { id: string; slug: string; title: string; excerpt: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Post saved, but email notifications are not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL.");

  const { data: subscribers, error: subscriberError } = await client
    .from("newsletter_subscribers")
    .select("id, email")
    .is("unsubscribed_at", null);
  if (subscriberError) throw new Error(`Post saved, but subscribers could not be loaded: ${subscriberError.message}`);

  for (const subscriber of subscribers ?? []) {
    const { data: alreadySent, error: sentCheckError } = await client
      .from("post_notifications")
      .select("id")
      .eq("post_id", post.id)
      .eq("subscriber_id", subscriber.id)
      .maybeSingle();
    if (sentCheckError) throw new Error(`Post saved, but notification history could not be checked: ${sentCheckError.message}`);
    if (alreadySent) continue;

    const email = publishedNoteEmail(post);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [subscriber.email],
        subject: `A new note from Ibi: ${post.title}`,
        html: email.html,
        text: email.text,
      }),
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Post saved, but Resend could not email ${subscriber.email}: ${details}`);
    }

    const { error: logError } = await client.from("post_notifications").insert({ post_id: post.id, subscriber_id: subscriber.id });
    if (logError) throw new Error(`Post saved and email sent, but notification history could not be saved: ${logError.message}`);
  }
}

async function requireEditor() {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
  const client = await createClient();
  if (!(await client.auth.getUser()).data.user) redirect("/admin/login");
  return client;
}

export async function savePost(form: FormData) {
  const client = await requireEditor();
  const id = value(form, "id");
  const title = value(form, "title");
  const content = value(form, "content");
  const status = (value(form, "status") || "draft") as PostStatus;
  const payload = { title, slug: slugify(value(form, "slug") || title), excerpt: value(form, "excerpt"), content, category: value(form, "category") as PostCategory, status, featured: form.get("featured") === "on", reading_time: Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)), cover_image_url: value(form, "cover_image_url") || null, seo_title: value(form, "seo_title") || null, seo_description: value(form, "seo_description") || null, published_at: status === "published" ? new Date().toISOString() : null, updated_at: new Date().toISOString() };
  const wasPublished = id
    ? (await client.from("posts").select("status").eq("id", id).single()).data?.status === "published"
    : false;
  const result = id
    ? await client.from("posts").update(payload).eq("id", id)
    : await client.from("posts").insert(payload).select("id").single();
  if (result.error) throw new Error(result.error.message);
  const postId = id || result.data?.id;
  const galleryUrls = form.getAll("gallery_urls").map(String).filter(Boolean);
  if (postId && galleryUrls.length) {
    const galleryResult = await client.from("post_images").insert(galleryUrls.map((url, index) => ({ post_id: postId, image_url: url, sort_order: index })));
    if (galleryResult.error) throw new Error(galleryResult.error.message);
  }
  if (postId && status === "published" && !wasPublished) {
    await notifySubscribers(client, { id: postId, slug: payload.slug, title, excerpt: payload.excerpt });
  }
  revalidatePath("/"); revalidatePath("/admin"); revalidatePath(`/posts/${payload.slug}`);
  redirect("/admin");
}

export async function deletePost(form: FormData) {
  const client = await requireEditor();
  const id = value(form, "id");
  const { error } = await client.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/"); revalidatePath("/admin");
}
