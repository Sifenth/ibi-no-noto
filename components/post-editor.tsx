"use client";
import type { Post } from "../lib/post-types";
import { useRef, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { isSupabaseConfigured } from "../lib/supabase/config";

const MAX_UPLOAD_SIZE = 500 * 1024 * 1024;

export default function PostEditor({ action, post }: { action: (form: FormData) => void; post?: Post }) {
  const [coverImage, setCoverImage] = useState(post?.cover_image_url ?? "");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [content, setContent] = useState(post?.content ?? "");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  async function uploadFiles(files: FileList | null, type: "cover" | "gallery" | "media") {
    if (!files?.length) return;
    if (!isSupabaseConfigured) {
      setUploadError("Supabase is not configured. Add the project URL and publishable key, then restart the dev server.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const client = createClient();
      const uploaded = await Promise.all(Array.from(files).map(async (file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");
        if (type === "cover" && !isImage) throw new Error("Cover files must be images.");
        if (type === "media" && !isImage && !isVideo && !isAudio) throw new Error("Choose a GIF, image, video, or sound file.");
        if (file.size > MAX_UPLOAD_SIZE) throw new Error("Each media file must be smaller than 500 MB.");
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error } = await client.storage.from("post-images").upload(path, file, { upsert: false });
        if (error) {
          const message = error.message.toLowerCase();
          if (message.includes("exceeded") || message.includes("maximum") || message.includes("size")) {
            throw new Error("Supabase rejected this file because the post-images bucket limit is lower than 500 MB. Run supabase/storage-limit-patch.sql in the Supabase SQL Editor and check your project plan.");
          }
          throw error;
        }
        const { data } = client.storage.from("post-images").getPublicUrl(path);
        return { url: data.publicUrl, kind: isVideo ? "video" : isAudio ? "audio" : "image" };
      }));
      if (type === "cover") setCoverImage(uploaded[0].url);
      else {
        if (type === "gallery") setImages((current) => [...current, ...uploaded.map((item) => item.url)]);
        const textarea = contentRef.current;
        if (!textarea) return;
        const marker = `\n\n${uploaded.map((item) => `[${item.kind}:${item.url}]`).join("\n\n")}\n\n`;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const nextContent = `${content.slice(0, start)}${marker}${content.slice(end)}`;
        setContent(nextContent);
        requestAnimationFrame(() => {
          textarea.focus();
          const position = start + marker.length;
          textarea.setSelectionRange(position, position);
        });
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Media upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return <form action={action} className="post-editor">
    <input type="hidden" name="id" value={post?.id ?? ""} />
    {images.map((image) => <input key={image} type="hidden" name="gallery_urls" value={image} />)}
    <label>Title<input required name="title" defaultValue={post?.title} placeholder="A note worth keeping" /></label>
    <label>Slug<input name="slug" defaultValue={post?.slug} placeholder="generated-from-title" /></label>
    <label>Excerpt<textarea name="excerpt" rows={3} defaultValue={post?.excerpt} placeholder="A short introduction..." /></label>
    <label>Content<textarea required ref={contentRef} name="content" rows={14} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write your note here. Separate paragraphs with blank lines. Upload an image to insert it at the cursor." /></label>
    <div className="editor-fields"><label>Category<select name="category" defaultValue={post?.category ?? "journal"}><option value="journal">Journal</option><option value="japanese">Japanese</option></select></label><label>Status<select name="status" defaultValue={post?.status ?? "draft"}><option value="draft">Save draft</option><option value="published">Publish</option></select></label></div>
    <input type="hidden" name="cover_image_url" value={coverImage} />
    <label>Cover image from your device<input type="file" accept="image/*" disabled={uploading} onChange={(event) => uploadFiles(event.target.files, "cover")} /></label>
    {coverImage && <div className="cover-preview"><img src={coverImage} alt="Cover preview" /><button type="button" onClick={() => setCoverImage("")}>Remove cover</button></div>}
    <label>Insert media inside your note<input type="file" accept="image/*,video/*,audio/*" multiple disabled={uploading} onChange={(event) => uploadFiles(event.target.files, "media")} /></label>
    <p className="editor-hint">Place your cursor in the note, then choose a GIF, image, video, or sound. It will be inserted at that exact position.</p>
    {uploading && <p className="upload-status">Uploading media...</p>}
    {uploadError && <p className="form-error">{uploadError}</p>}
    {images.length > 0 && <div className="image-preview-grid">{images.map((image) => <div key={image}><img src={image} alt="" /><button type="button" onClick={() => setImages((current) => current.filter((item) => item !== image))}>Remove</button></div>)}</div>}
    <label>SEO title<input name="seo_title" defaultValue={post?.seo_title ?? ""} /></label>
    <label>SEO description<textarea name="seo_description" rows={2} defaultValue={post?.seo_description ?? ""} /></label>
    <label className="checkbox-label"><input type="checkbox" name="featured" defaultChecked={post?.featured} /> Feature this note</label>
    <button className="button primary" type="submit">{post ? "Save changes" : "Save note"} <span>↗</span></button>
  </form>;
}
