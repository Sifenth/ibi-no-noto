create type post_status as enum ('draft', 'published');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_image_url text,
  category text not null check (category in ('journal', 'japanese')),
  status post_status not null default 'draft',
  featured boolean not null default false,
  reading_time integer not null default 1,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table public.post_notifications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  subscriber_id uuid not null references public.newsletter_subscribers(id) on delete cascade,
  sent_at timestamptz not null default now(),
  unique (post_id, subscriber_id)
);

grant usage on schema public to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant select, insert, delete on public.post_images to authenticated;
grant select on public.post_images to anon, authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select on public.newsletter_subscribers to authenticated;
grant select, insert on public.post_notifications to authenticated;

alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.post_notifications enable row level security;

create policy "Published posts are public"
  on public.posts for select
  using (status = 'published');

create policy "Authenticated editors manage posts"
  on public.posts for all to authenticated
  using (true) with check (true);

create policy "Published post images are public"
  on public.post_images for select
  using (exists (select 1 from public.posts where posts.id = post_images.post_id and posts.status = 'published'));

create policy "Authenticated editors manage post images"
  on public.post_images for all to authenticated
  using (true) with check (true);

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

create policy "Authenticated editors manage subscribers"
  on public.newsletter_subscribers for select to authenticated
  using (true);

create policy "Authenticated editors manage notification history"
  on public.post_notifications for all to authenticated
  using (true) with check (true);

create index posts_published_at_idx on public.posts (published_at desc);
create index posts_category_idx on public.posts (category);
create index post_images_post_id_idx on public.post_images (post_id, sort_order);
create index post_notifications_post_id_idx on public.post_notifications (post_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('post-images', 'post-images', true, 524288000)
on conflict (id) do update
set public = true,
    file_size_limit = 524288000;

create policy "Public can view post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Authenticated editors upload post images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'post-images');

create policy "Authenticated editors delete post images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'post-images');
