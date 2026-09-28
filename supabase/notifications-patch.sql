-- Run this once in Supabase for an existing project.
create table if not exists public.post_notifications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  subscriber_id uuid not null references public.newsletter_subscribers(id) on delete cascade,
  sent_at timestamptz not null default now(),
  unique (post_id, subscriber_id)
);

grant select, insert on public.post_notifications to authenticated;
alter table public.post_notifications enable row level security;

create policy "Authenticated editors manage notification history"
  on public.post_notifications for all to authenticated
  using (true) with check (true);
