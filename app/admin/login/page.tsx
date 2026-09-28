"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { isSupabaseConfigured } from "../../../lib/supabase/config";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Add the required environment variables first.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await createClient().auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="back-link">← Back to Ibi no Noto</Link>
        <p className="eyebrow">PRIVATE AREA</p>
        <h1>Welcome back.</h1>
        <p className="auth-intro">Sign in to manage your notes, drafts, and subscribers.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button primary auth-submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"} <span>↗</span></button>
        </form>
        <p className="auth-note">Create the first admin user from Supabase Authentication, then use those credentials here.</p>
      </div>
    </main>
  );
}
