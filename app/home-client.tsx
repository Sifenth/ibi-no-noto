"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fallbackPosts, type Post } from "../lib/post-types";
import { WaveBackground } from "../components/wave-background";

function Arrow({ small = false }: { small?: boolean }) {
  return <span aria-hidden="true" className={small ? "arrow small" : "arrow"}>↗</span>;
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <button className="theme-toggle" onClick={() => setDark((value) => !value)} aria-label="Toggle dark mode">
      <span className="sun">☼</span><span className="toggle-track"><span className="toggle-dot" /></span><span className="moon">☾</span>
    </button>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-english">Ibi no Noto</span><span className="brand-divider" /><span className="brand-japanese">イビのノート</span>
        </Link>
        <nav className={open ? "main-nav open" : "main-nav"} aria-label="Main navigation">
          <Link href="#journal" onClick={() => setOpen(false)}>Journal</Link>
          <Link href="#about" onClick={() => setOpen(false)}>About</Link>
        </nav>
        <div className="header-actions"><ThemeToggle /><button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? "×" : "☰"}</button></div>
      </div>
    </header>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const result = await response.json();
    setMessage(result.message);
    if (response.ok) setEmail("");
    setSubmitting(false);
  }
  return (
    <section className="newsletter">
      <div className="subscribe">
        {message && <div className="success-message">{message}</div>}
        <form onSubmit={subscribe}><input required type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} /><button type="submit" disabled={submitting}>{submitting ? "Joining..." : "Subscribe"} <Arrow /></button></form>
      </div>
    </section>
  );
}

function Archive({ posts }: { posts: Post[] }) {
  const [page, setPage] = useState(0);
  const pageSize = 3;
  const pageCount = Math.ceil(posts.length / pageSize);
  const visiblePosts = posts.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <section className="posts page-width" id="all-posts">
      <div className="section-heading">
        <div><p className="eyebrow">FROM THE ARCHIVE</p><h2>A few more notes</h2></div>
        <div className="archive-controls">
          <span className="muted">{String(page * pageSize + 1).padStart(2, "0")} — {String(Math.min((page + 1) * pageSize, posts.length)).padStart(2, "0")}</span>
          {pageCount > 1 && <div className="archive-arrows" aria-label="Browse notes">
            <button type="button" className="archive-arrow" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0} aria-label="Previous notes">←</button>
            <button type="button" className="archive-arrow" onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={page === pageCount - 1} aria-label="Next notes">→</button>
          </div>}
        </div>
      </div>
      <div className="post-grid">{visiblePosts.map((post) => <article className="post-card" key={post.id}><div className={`post-visual ${post.category === "journal" ? "sage" : "peach"}`}>{post.cover_image_url ? <img src={post.cover_image_url} alt="" /> : <span className="visual-number">✳</span>}</div><div className="post-card-body"><p className="eyebrow">{post.category.toUpperCase()} <span className="dot">•</span> {post.reading_time} MIN READ</p><h3>{post.title}</h3><p>{post.excerpt}</p><div className="post-meta"><span>{post.published_at ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}</span><Link href={`/posts/${post.slug}`} aria-label={`Read ${post.title}`}>Read <Arrow small /></Link></div></div></article>)}</div>
    </section>
  );
}

export default function Home({ posts = fallbackPosts }: { posts?: Post[] }) {
  return (
    <div className="site">
      <Header />
      <main>
        <WaveBackground />
        <section className="hero page-width">
          <div className="hero-copy">
            <p className="eyebrow">MY JOURNAL · EST. 2026</p>
            <h1>Notes from<br /><em>a passerby.</em></h1>
            <p className="hero-text">Documenting the rest of a century, and my Japanese learning journey</p>
            <div className="hero-actions"><Link className="button primary" href="#journal">Read the journal <Arrow /></Link></div>
          </div>
          <div className="hero-art image-slot"><img src="/hero-illustration.jpg" alt="Hero illustration" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div>
        </section>

        {posts[0] && <section className="feature page-width" id="journal">
          <div className="section-heading"><div><p className="eyebrow">LATEST NOTE</p></div><Link className="text-link" href="#all-posts">View all notes <Arrow small /></Link></div>
          <article className="feature-card">
            <div className="feature-image">{posts[0].cover_image_url ? <img className="feature-cover" src={posts[0].cover_image_url} alt="" /> : <div className="feature-placeholder">No cover image</div>}</div>
            <div className="feature-content"><p className="eyebrow">{(posts[0]?.category ?? "journal").toUpperCase()} <span className="dot">•</span> {posts[0]?.reading_time ?? 4} MIN READ</p><h3>{posts[0]?.title ?? "Learning to arrive"}<br /><em>without rushing.</em></h3><p>{posts[0]?.excerpt ?? "There is a particular kind of patience that living somewhere new asks of you."}</p><div className="post-meta"><span>By Ibi</span><span>{posts[0]?.published_at ? new Date(posts[0].published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "09 Sep 2026"}</span>{posts[0] && <Link href={`/posts/${posts[0].slug}`}>Read the full note <Arrow small /></Link>}</div></div>
          </article>
        </section>}

        {posts.length > 0 && <Archive posts={posts} />}

        <section className="about-strip page-width" id="about"><div className="about-photo"><img src="/about.jpg" alt="Ibi" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div><div><p className="eyebrow">A LITTLE ABOUT ME</p><p>I&apos;m Ibi or whatever you call me, i didn&apos;t hear from you in a while, i&apos;m supposed to introduce myself here, but you know that i know that you know me innit?</p></div></section>
        <Newsletter />
      </main>
      <footer className="footer page-width"><span>© 2026 Ibi no Noto</span><span>Made with absurdity <b>✦</b></span><span>Home</span></footer>
    </div>
  );
}
