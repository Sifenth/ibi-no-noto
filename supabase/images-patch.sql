-- Run this once in Supabase for an existing project.
create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.post_images enable row level security;
grant select, insert, delete on public.post_images to authenticated;
grant select on public.post_images to anon, authenticated;

create policy "Published post images are public"
  on public.post_images for select
  using (exists (select 1 from public.posts where posts.id = post_images.post_id and posts.status = 'published'));

create policy "Authenticated editors manage post images"
  on public.post_images for all to authenticated
  using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "Public can view post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Authenticated editors upload post images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'post-images');

create policy "Authenticated editors delete post images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'post-images');
