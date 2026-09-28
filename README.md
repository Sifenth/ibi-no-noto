# Ibi no Noto

**Live site:** <https://ibinonoto.com>

Ibi no Noto is a small editorial journal about everyday life and Japanese learning.
It is built with Next.js, React, TypeScript, Supabase, and Resend.

This README is written as a teaching guide. The goal is not only to tell you how to
run the project, but to make the ideas simple enough that you could rebuild it
yourself.

## The whole project in one minute

Imagine a notebook with three people involved:

1. **A reader** visits the public website, reads published notes, and enters an email
   address.
2. **Supabase** is the filing cabinet. It stores posts, subscribers, images, and
   login sessions. Row-level security decides who may see or change each record.
3. **The editor** signs in to the private dashboard, writes a note, and publishes it.
   The app then asks **Resend** to email the active subscribers.

Next.js is the building that connects these rooms:

```text
Browser
  ├── public pages ──> Supabase posts
  ├── newsletter form ──> /api/newsletter ──> Supabase + Resend welcome email
  └── /admin ──> Supabase Auth ──> dashboard ──> publish ──> Resend notifications
```

The most important idea is that the browser never gets a secret server key. It uses
the public Supabase publishable key, while server actions and the database policies
decide what is allowed.

## What the visitor sees

- `/` shows the latest published note, an archive, an about section, and the
  newsletter form.
- `/posts/[slug]` shows one published note.
- `/[section]` shows simple section pages such as `/journal`, `/japanese`, `/about`,
  `/newsletter`, and `/admin`.
- The home page has a light/dark theme toggle and responsive navigation.

If Supabase is not configured, the home page can still render its fallback sample
posts. Once Supabase is configured, published posts come from the database.

## How newsletter subscription works

Think of the subscription endpoint as a receptionist:

1. The browser sends `{ "email": "reader@example.com" }` to `POST /api/newsletter`.
2. The route parses JSON and checks that the value looks like an email address.
3. It inserts the address into `newsletter_subscribers`.
4. A duplicate email is harmless because the database unique constraint returns
   error code `23505`, which the route treats as an already-successful subscription.
5. If `RESEND_API_KEY` and `RESEND_FROM_EMAIL` exist, the route sends a welcome email.
6. The route returns a short message for the browser to display.

The browser-side `Newsletter` component in `app/home-client.tsx` owns the small
piece of state needed for this interaction: the current email, the status message,
and whether the request is in progress.

## How the admin dashboard works

The dashboard is a locked room:

1. `/admin/login` calls Supabase Auth's `signInWithPassword`.
2. `middleware.ts` runs for `/admin/*`, refreshes the Supabase session cookies, and
   redirects unauthenticated visitors to `/admin/login`.
3. `app/admin/page.tsx` checks the authenticated user again on the server. This is
   deliberate: a security check in the browser alone would not be enough.
4. The dashboard loads all editor-visible posts and the subscriber count.
5. `PostEditor` collects title, slug, excerpt, content, category, status, images,
   SEO fields, and the featured flag.
6. The server action `savePost` writes the post. A draft is just a row with status
   `draft`; publishing changes the status to `published`.
7. The server calculates reading time, revalidates affected pages, and redirects
   back to the dashboard.
8. When a post changes from unpublished to published, `notifySubscribers` sends one
   notification per active subscriber. `post_notifications` records each successful
   send, so the same post is not sent twice to the same person.

## File map

### Pages and user interface

| File | Job |
| --- | --- |
| `app/page.tsx` | Server entry point for `/`; loads published posts and renders `Home`. |
| `app/home-client.tsx` | Public home UI, navigation, theme toggle, archive, and newsletter form. |
| `app/posts/[slug]/page.tsx` | Loads one post and turns text media markers into image, video, or audio elements. |
| `app/[section]/page.tsx` | Renders the small section landing pages. |
| `app/admin/login/page.tsx` | Supabase email/password login form. |
| `app/admin/page.tsx` | Server-rendered editorial dashboard and post list. |
| `app/admin/posts/new/page.tsx` | Creates a new post using `PostEditor`. |
| `app/admin/posts/[id]/page.tsx` | Edits an existing post using `PostEditor`. |
| `components/post-editor.tsx` | Client form for writing posts and uploading media. |
| `components/wave-background.tsx` | Decorative visual used by the home page. |
| `app/globals.css` | Global layout, typography, theme, and component styling. |

### Data, authentication, and email

| File | Job |
| --- | --- |
| `lib/posts.ts` | Post types, fallback data, and Supabase read functions. |
| `lib/posts-actions.ts` | Server actions for saving/deleting posts and notifying subscribers. |
| `lib/post-types.ts` | Shared fallback post type/data used by client UI. |
| `lib/supabase/config.ts` | Checks and returns the Supabase environment configuration. |
| `lib/supabase/client.ts` | Creates the browser Supabase client. |
| `lib/supabase/server.ts` | Creates the server Supabase client and reads the logged-in user. |
| `lib/email.ts` | Escapes email text and builds HTML/plain-text email bodies. |
| `middleware.ts` | Refreshes auth cookies and protects `/admin/*`. |
| `app/api/newsletter/route.ts` | Validates and stores newsletter subscriptions. |

## Function-by-function explanation

### `lib/posts.ts`

- `getPublishedPosts()` asks Supabase for published posts ordered newest first. If
  Supabase is unavailable or returns an error, it returns an empty list rather than
  exposing database details to the public page.
- `getPostBySlug(slug)` finds one published post and then loads its gallery images.
  If Supabase is not configured, it searches the fallback posts instead.
- `getAdminPosts()` reads all posts for the authenticated dashboard.
- `getSubscriberCount()` asks Supabase for an exact count without downloading every
  subscriber row.

### `lib/posts-actions.ts`

- `value(form, key)` safely turns a form field into trimmed text.
- `slugify(title)` turns a title into a URL-friendly slug. For example,
  `Learning Japanese!` becomes `learning-japanese`.
- `requireEditor()` checks configuration, creates the server client, and redirects
  unauthenticated users to the login page.
- `notifySubscribers(client, post)` finds active subscribers, skips notification
  records that already exist, calls Resend, and records each successful delivery.
- `savePost(form)` reads the editor form, calculates reading time, inserts or updates
  the post, stores gallery URLs, sends publication notifications when appropriate,
  refreshes cached pages, and redirects to `/admin`.
- `deletePost(form)` deletes the selected post and refreshes the home/dashboard pages.

### `lib/supabase/*`

- `isSupabaseConfigured` is a boolean used to decide whether the app can use the
  database.
- `getSupabaseConfig()` returns the URL and publishable key, or throws a useful
  setup error when either is missing.
- Browser `createClient()` uses `createBrowserClient`, so login state can live in
  browser cookies.
- Server `createClient()` uses Next.js cookies, so server components and actions can
  identify the same user.
- `getAuthenticatedUser()` asks Supabase Auth who is currently logged in.
- `middleware(request)` refreshes cookies and redirects visitors who try to enter the
  admin area without a valid session.

### `app/api/newsletter/route.ts`

- `POST(request)` is the only public API route. It parses JSON, validates the email,
  saves it, optionally sends the welcome email, and returns a deliberate HTTP status
  for each outcome: `400` for invalid input, `503` for missing setup, `500` for a
  database problem, and `502` when Resend cannot deliver.

### `lib/email.ts`

- `escapeHtml(value)` prevents user-controlled titles and excerpts from becoming
  executable HTML inside an email.
- `getSiteUrl()` chooses the configured site URL and falls back to localhost for
  local development.
- `renderEmail(content, preheader)` wraps content in the shared Ibi no Noto email
  design.
- `button(url, label)` creates a reusable email button.
- `welcomeEmail()` creates the confirmation sent after subscribing.
- `publishedNoteEmail(post)` creates the email announcing a newly published note.

### `app/home-client.tsx`

- `Arrow()` is a small reusable arrow decoration.
- `ThemeToggle()` remembers the visitor's light/dark choice in `localStorage`.
- `Header()` manages the mobile menu and navigation links.
- `Newsletter()` submits the visitor's email to the API route and displays feedback.
- `Archive()` shows three posts at a time and manages previous/next pagination.
- `Home({ posts })` composes the complete public homepage.

### `components/post-editor.tsx`

- `uploadFiles(files, type)` checks file type and size, uploads files to Supabase
  Storage, creates public URLs, and either sets the cover image or inserts a marker
  at the cursor. A marker such as `[image:https://...]` is later understood by the
  post page.
- `PostEditor({ action, post })` renders the reusable create/edit form. The server
  action is passed in, so the same component works for a new post and an existing one.

### Page functions

- `Page()` in `app/page.tsx` loads the public posts before rendering the client home.
- `PostPage({ params })` loads a post by slug, calls `notFound()` when it does not
  exist, and converts media markers into HTML media controls.
- `SectionPage({ params })` chooses the requested section content and renders its
  notes.
- `AdminLoginPage()` stores email/password input, calls Supabase Auth, displays login
  errors, and navigates to the dashboard after success.
- `AdminPage()` performs the server-side auth check, loads dashboard data, and renders
  post editing/deletion controls.

## Database: the filing cabinet

`supabase/schema.sql` creates:

- `posts`: title, slug, content, category, draft/published status, SEO fields, and
  timestamps.
- `post_images`: gallery images belonging to a post.
- `newsletter_subscribers`: unique email addresses and unsubscribe timestamps.
- `post_notifications`: the `(post_id, subscriber_id)` history that prevents repeats.
- `post-images` storage bucket: public media files with authenticated upload/delete
  policies.

The row-level security policies are the database's bouncer:

- Anonymous visitors may read published posts and insert newsletter subscriptions.
- Authenticated editors may manage posts, images, subscribers, and notification
  history.
- Drafts and editor-only records are not public.

## Recreate it yourself

If you wanted to rebuild this project from an empty folder, use this order:

1. Create a Next.js app with TypeScript and a simple public home page.
2. Add Supabase packages and create browser/server clients.
3. Create the four tables and storage bucket in `supabase/schema.sql`.
4. Add RLS policies before connecting the UI, so every database request has an
   intentional permission rule.
5. Build `getPublishedPosts()` and render a post list.
6. Add a dynamic `/posts/[slug]` page.
7. Add the newsletter API route and a form that calls it.
8. Add Supabase Auth login, middleware, and the protected dashboard.
9. Add server actions for create, update, publish, and delete.
10. Add media uploads and the simple `[kind:url]` content-marker format.
11. Add Resend emails only after saving the database record successfully.
12. Add styling, theme state, validation, error messages, and page revalidation.

At every step, ask: “What data comes in, what decision is made, what data is saved,
and what does the user see next?” That question is the Feynman-style shortcut for
understanding this application.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in values from Supabase and Resend.
   Never commit `.env.local`.
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
