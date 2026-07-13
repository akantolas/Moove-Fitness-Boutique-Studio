-- Profile avatar URL + Supabase Storage bucket for posing avatars

alter table public.profiles
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('posing-avatars', 'posing-avatars', true)
on conflict (id) do update set public = true;

drop policy if exists posing_avatars_public_read on storage.objects;
create policy posing_avatars_public_read on storage.objects
  for select using (bucket_id = 'posing-avatars');

drop policy if exists posing_avatars_insert_own on storage.objects;
create policy posing_avatars_insert_own on storage.objects
  for insert with check (
    bucket_id = 'posing-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists posing_avatars_update_own on storage.objects;
create policy posing_avatars_update_own on storage.objects
  for update using (
    bucket_id = 'posing-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists posing_avatars_delete_own on storage.objects;
create policy posing_avatars_delete_own on storage.objects
  for delete using (
    bucket_id = 'posing-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
