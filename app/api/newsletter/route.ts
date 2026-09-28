import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import { welcomeEmail } from "../../../lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json({ message: "Newsletter setup is not connected yet." }, { status: 503 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });
  if (error && error.code !== "23505") {
    const message = error.message.toLowerCase().includes("permission")
      ? "Newsletter permissions are not enabled in Supabase yet. Run supabase/permissions-patch.sql in the SQL Editor."
      : "We could not save your subscription. Please try again.";
    return NextResponse.json({ message }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    const welcome = welcomeEmail();
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [email],
        subject: "Welcome to Ibi no Noto",
        html: welcome.html,
        text: welcome.text,
      }),
    });
    if (!resendResponse.ok) {
      const resendError = await resendResponse.json().catch(() => null) as { message?: string } | null;
      const providerMessage = resendError?.message?.toLowerCase() ?? "";
      const message = providerMessage.includes("domain") || providerMessage.includes("not verified")
        ? "You are subscribed, but Resend needs a verified sender domain before it can deliver this email."
        : providerMessage.includes("testing") || providerMessage.includes("onboarding")
          ? "You are subscribed, but Resend testing mode only allows delivery to the email address on your Resend account."
          : "You are subscribed, but the confirmation email could not be sent. Check your Resend sender and API key.";
      return NextResponse.json({ message }, { status: 502 });
    }
  }

  return NextResponse.json({ message: "You are on the list. Thank you." });
}
