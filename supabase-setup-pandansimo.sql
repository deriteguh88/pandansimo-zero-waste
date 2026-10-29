-- ============================================================
-- Setup tabel untuk situs Zero Waste & Pandansimo
-- (akun Supabase yang sama dengan Ruang Fokus, tabel baru & terpisah: pz_content)
-- ============================================================

create table if not exists public.pz_content (
  key text primary key,
  value_id text,
  value_en text,
  updated_at timestamptz not null default now()
);

alter table public.pz_content enable row level security;

-- Siapa saja (pengunjung situs, tanpa login) boleh MEMBACA konten
create policy "pz_content_public_read"
  on public.pz_content for select
  using (true);

-- HANYA admin (akun dengan UID tertentu) yang boleh menulis.
-- Ganti 'GANTI-DENGAN-UID-ADMIN' di bawah dengan UID akun admin kalian
-- (Authentication > Users > klik akun admin > salin "User UID").
create policy "pz_content_admin_insert"
  on public.pz_content for insert
  with check (auth.uid() = 'GANTI-DENGAN-UID-ADMIN'::uuid);

create policy "pz_content_admin_update"
  on public.pz_content for update
  using (auth.uid() = 'GANTI-DENGAN-UID-ADMIN'::uuid);

create policy "pz_content_admin_delete"
  on public.pz_content for delete
  using (auth.uid() = 'GANTI-DENGAN-UID-ADMIN'::uuid);

-- Aktifkan realtime supaya perubahan dari admin.html langsung
-- muncul di halaman publik yang sedang terbuka, tanpa refresh.
alter publication supabase_realtime add table public.pz_content;

-- ============================================================
-- Tabel untuk menyimpan URL gambar (hero, galeri, foto artikel, avatar tim)
-- ============================================================

create table if not exists public.pz_images (
  key text primary key,
  url text not null,
  updated_at timestamptz not null default now()
);

alter table public.pz_images enable row level security;

create policy "pz_images_public_read"
  on public.pz_images for select
  using (true);

create policy "pz_images_admin_insert"
  on public.pz_images for insert
  with check (auth.uid() = 'GANTI-DENGAN-UID-ADMIN'::uuid);

create policy "pz_images_admin_update"
  on public.pz_images for update
  using (auth.uid() = 'GANTI-DENGAN-UID-ADMIN'::uuid);

create policy "pz_images_admin_delete"
  on public.pz_images for delete
  using (auth.uid() = 'GANTI-DENGAN-UID-ADMIN'::uuid);

alter publication supabase_realtime add table public.pz_images;

-- ============================================================
-- Storage bucket untuk file gambar yang diupload dari admin.html
-- Catatan: bucket "pz-uploads" ini JUGA bisa dibuat lewat dashboard
-- (Storage > New bucket > nama "pz-uploads" > centang "Public bucket"),
-- yang mana saja boleh, hasilnya sama. Kalau sudah dibuat lewat
-- dashboard, lewati bagian "insert into storage.buckets" di bawah
-- supaya tidak dobel.
insert into storage.buckets (id, name, public)
values ('pz-uploads', 'pz-uploads', true)
on conflict (id) do nothing;

-- Siapa saja boleh MELIHAT/mengunduh file di bucket ini (perlu, supaya
-- foto tampil di halaman publik tanpa pengunjung harus login).
create policy "pz_uploads_public_read"
  on storage.objects for select
  using (bucket_id = 'pz-uploads');

-- HANYA admin yang boleh mengunggah/mengubah/menghapus file.
create policy "pz_uploads_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'pz-uploads' and auth.uid() = 'GANTI-DENGAN-UID-ADMIN'::uuid);

create policy "pz_uploads_admin_update"
  on storage.objects for update
  using (bucket_id = 'pz-uploads' and auth.uid() = 'GANTI-DENGAN-UID-ADMIN'::uuid);

create policy "pz_uploads_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'pz-uploads' and auth.uid() = 'GANTI-DENGAN-UID-ADMIN'::uuid);
