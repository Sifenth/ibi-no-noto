import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser, createClient } from "../../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";
import { savePost } from "../../../../lib/posts-actions";
import PostEditor from "../../../../components/post-editor";
import type { Post } from "../../../../lib/post-types";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  if (isSupabaseConfigured && !(await getAuthenticatedUser())) redirect("/admin/login");
  if (!isSupabaseConfigured) notFound();
  const { id } = await params;
  const { data } = await (await createClient()).from("posts").select("*").eq("id", id).single();
  if (!data) notFound();
  const post = data as Post;
  return <main className="admin-page page-width"><div className="admin-topbar"><Link href="/admin" className="back-link">← Editorial desk</Link><span className="admin-badge">EDIT NOTE</span></div><div className="editor-shell"><p className="eyebrow">{post.status.toUpperCase()}</p><h1>Shape this note.</h1><PostEditor action={savePost} post={post} /></div></main>;
}
