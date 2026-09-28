# Ibi no Noto

Ibi no Noto is a small editorial journal built with Next.js. It publishes notes about
everyday life and Japanese learning, with a responsive reading experience, light/dark
theme toggle, post archive, and image support.

**Live site:** <https://ibinonoto.com>

## How it works

- **Public journal:** Published posts are loaded from Supabase and shown on the home
  page, archive, category pages, and individual post pages. If Supabase is not
  configured, the app uses a small set of built-in fallback posts.
- **Subscription:** Visitors submit an email address at `/api/newsletter`. The route
  validates the address and stores it in the `newsletter_subscribers` table. When
  Resend is configured, it sends a welcome email. Duplicate subscriptions are
  treated as successful without creating another row.
- **Admin dashboard:** Editors sign in at `/admin/login` with a Supabase Auth email
  and password. Authenticated editors can view post and subscriber counts, create or
  edit drafts, publish notes, upload image URLs, and delete posts. Publishing a note
  sends one Resend notification to each active subscriber; `post_notifications`
  prevents duplicate notifications.
- **Database and access control:** Run `supabase/schema.sql` in Supabase to create
  the content, subscriber, notification, and storage tables plus row-level security
  policies. Public users can read published content and subscribe; authenticated
  editors manage content and view subscribers.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in values from your Supabase and
   Resend projects. Never commit `.env.local`.
3. Run `supabase/schema.sql` in the Supabase SQL Editor and create the first editor
   in Supabase Authentication.
4. Start the development server:

   ```bash
   npm run dev
   ```

Open <http://localhost:3000>.

## Scripts

```bash
npm run dev    # Start the development server
npm run lint   # Run ESLint
npm run build  # Create a production build
```
