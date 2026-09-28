-- Run this once in Supabase for an existing project after removing Engineering.
update public.posts
set category = 'journal'
where category = 'engineering';

alter table public.posts
  drop constraint if exists posts_category_check;

alter table public.posts
  add constraint posts_category_check
  check (category in ('journal', 'japanese'));
