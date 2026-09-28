import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "../../../lib/posts";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();
  const contentParts = post.content.split(/(\[(?:image|video|audio):https?:\/\/[^\]]+\])/g);
  return <main className="post-page page-width"><Link href="/" className="back-link">← Back to Ibi no Noto</Link><p className="eyebrow">{post.category.toUpperCase()} · {post.reading_time} MIN READ</p><h1>{post.title}</h1><p className="post-excerpt">{post.excerpt}</p>{post.cover_image_url && <img className="post-cover" src={post.cover_image_url} alt="" />}{(post.gallery?.length ?? 0) > 0 && <div className="post-gallery">{post.gallery?.map((image) => <img key={image} src={image} alt="" />)}</div>}<div className="post-body">{contentParts.map((part, index) => { const match = part.match(/^\[(image|video|audio):(https?:\/\/[^\]]+)\]$/); if (!match) return part.split(/\n{2,}/).filter(Boolean).map((paragraph, paragraphIndex) => <p key={`${index}-${paragraphIndex}`}>{paragraph}</p>); const [, kind, url] = match; if (kind === "video") return <video className="inline-note-video" key={`${url}-${index}`} src={url} controls preload="metadata" />; if (kind === "audio") return <audio className="inline-note-audio" key={`${url}-${index}`} src={url} controls preload="metadata" />; return <img className="inline-note-image" key={`${url}-${index}`} src={url} alt="" />; })}</div><Link href="/" className="text-link">← More notes</Link></main>;
}
