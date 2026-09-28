import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "../../lib/supabase/server";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { getAdminPosts, getSubscriberCount } from "../../lib/posts";
import { deletePost } from "../../lib/posts-actions";

export default async function AdminPage() {
  if (isSupabaseConfigured && !(await getAuthenticatedUser())) redirect("/admin/login");
  const posts = await getAdminPosts();
  const subscriberCount = await getSubscriberCount();

  return (
    <main className="admin-page page-width">
      <div className="admin-topbar"><Link href="/" className="brand"><span className="brand-mark">i</span><span>Ibi no Noto</span></Link><span className="admin-badge">EDITORIAL DESK</span></div>
      {!isSupabaseConfigured && <div className="setup-banner"><strong>Supabase setup required.</strong><span>Add your environment variables and run <code>supabase/schema.sql</code> to enable publishing.</span></div>}
      <div className="admin-heading"><div><p className="eyebrow">PRIVATE AREA</p><h1>Good morning, Tarik.</h1><p>Shape the next note from here.</p></div><Link className="button primary" href="/admin/posts/new">New post <span>↗</span></Link></div>
      <div className="admin-stats"><div><span>Published notes</span><strong>{posts.filter((post) => post.status === "published").length}</strong></div><div><span>Drafts in progress</span><strong>{posts.filter((post) => post.status === "draft").length}</strong></div><div><span>Subscribers</span><strong>{subscriberCount ?? "—"}</strong></div></div>
      <section className="admin-panel"><div className="panel-heading"><h2>Recent notes</h2><span>{posts.length ? "Updated recently" : "No notes yet"}</span></div>{posts.length ? <div className="admin-post-list">{posts.map((post) => <div className="admin-post-row" key={post.id}><div><span className="eyebrow">{post.category} · {post.status}</span><h3>{post.title}</h3><small>{post.updated_at.slice(0, 10)}</small></div><div className="admin-post-actions"><Link href={`/admin/posts/${post.id}`} className="text-link">Edit ↗</Link><form action={deletePost}><input type="hidden" name="id" value={post.id} /><button className="danger-button">Delete</button></form></div></div>)}</div> : <div className="empty-state"><span className="empty-symbol">✦</span><h3>Your editorial desk is ready.</h3><p>Connect Supabase to load your notes here, or start writing your first draft.</p><Link href="/admin/posts/new" className="text-link">Create a note <span>↗</span></Link></div>}</section>
    </main>
  );
}
