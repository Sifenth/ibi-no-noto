import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";
import { savePost } from "../../../../lib/posts-actions";
import PostEditor from "../../../../components/post-editor";

export default async function NewPostPage() {
  if (isSupabaseConfigured && !(await getAuthenticatedUser())) redirect("/admin/login");
  return <main className="admin-page page-width"><div className="admin-topbar"><Link href="/admin" className="back-link">← Editorial desk</Link><span className="admin-badge">NEW NOTE</span></div><div className="editor-shell"><p className="eyebrow">DRAFT</p><h1>Write something worth keeping.</h1><PostEditor action={savePost} /></div></main>;
}
