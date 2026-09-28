-- Run this in Supabase Dashboard > SQL Editor for an existing project.
-- 500 MB in bytes. The project plan must support this limit.
update storage.buckets
set file_size_limit = 524288000,
    public = true
where id = 'post-images';

-- If the bucket does not exist yet, create it with the same limit.
insert into storage.buckets (id, name, public, file_size_limit)
values ('post-images', 'post-images', true, 524288000)
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    public = excluded.public;
