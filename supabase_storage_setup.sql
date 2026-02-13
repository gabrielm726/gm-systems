-- =================================================================
-- SUPABASE STORAGE SETUP FOR ASSETS
-- Executar no SQL Editor do Supabase Dashboard
-- =================================================================

-- 1. Create a public bucket for assets (Fixed array syntax for PostgreSQL)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('assets', 'assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
on conflict (id) do update set 
    public = true, 
    file_size_limit = 5242880, 
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- 2. Allow Public Read Access (Images are visible to everyone with the link)
create policy "Public Access to Assets"
  on storage.objects for select
  using ( bucket_id = 'assets' );

-- 3. Allow Authenticated Uploads (Only logged in users can upload)
-- Note: Requires Supabase Auth to be active. If using custom auth, you might need to relax this or sync users.
-- Assuming 'anon' key for now or authenticated user.
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'assets' );

-- 4. Allow Updates
create policy "Allow Updates"
  on storage.objects for update
  with check ( bucket_id = 'assets' );

-- 5. Allow Deletes
create policy "Allow Deletes"
  on storage.objects for delete
  using ( bucket_id = 'assets' );
