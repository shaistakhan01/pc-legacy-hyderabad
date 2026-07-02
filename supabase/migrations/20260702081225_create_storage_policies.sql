-- ══════════════════════════════════════════════════════════════════
-- PUBLIC BUCKETS: room-images, hall-images, menu-images
-- Anyone can read; only staff/admin can write.
-- ══════════════════════════════════════════════════════════════════

-- room-images
create policy "room_images_public_select"
  on storage.objects for select
  using (bucket_id = 'room-images');
create policy "room_images_staff_insert"
  on storage.objects for insert
  with check (bucket_id = 'room-images' and public.is_staff_or_admin());
create policy "room_images_staff_update"
  on storage.objects for update
  using (bucket_id = 'room-images' and public.is_staff_or_admin());
create policy "room_images_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'room-images' and public.is_staff_or_admin());

-- hall-images
create policy "hall_images_public_select"
  on storage.objects for select
  using (bucket_id = 'hall-images');
create policy "hall_images_staff_insert"
  on storage.objects for insert
  with check (bucket_id = 'hall-images' and public.is_staff_or_admin());
create policy "hall_images_staff_update"
  on storage.objects for update
  using (bucket_id = 'hall-images' and public.is_staff_or_admin());
create policy "hall_images_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'hall-images' and public.is_staff_or_admin());

-- menu-images
create policy "menu_images_public_select"
  on storage.objects for select
  using (bucket_id = 'menu-images');
create policy "menu_images_staff_insert"
  on storage.objects for insert
  with check (bucket_id = 'menu-images' and public.is_staff_or_admin());
create policy "menu_images_staff_update"
  on storage.objects for update
  using (bucket_id = 'menu-images' and public.is_staff_or_admin());
create policy "menu_images_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'menu-images' and public.is_staff_or_admin());

-- ══════════════════════════════════════════════════════════════════
-- PRIVATE BUCKETS: guest-documents, invoices
-- Owner (uploader) or staff/admin only.
-- ══════════════════════════════════════════════════════════════════

-- guest-documents
create policy "guest_documents_owner_or_staff_select"
  on storage.objects for select
  using (bucket_id = 'guest-documents' and (owner = auth.uid() or public.is_staff_or_admin()));
create policy "guest_documents_owner_insert"
  on storage.objects for insert
  with check (bucket_id = 'guest-documents' and owner = auth.uid());
create policy "guest_documents_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'guest-documents' and public.is_staff_or_admin());

-- invoices
create policy "invoices_owner_or_staff_select"
  on storage.objects for select
  using (bucket_id = 'invoices' and (owner = auth.uid() or public.is_staff_or_admin()));
create policy "invoices_staff_insert"
  on storage.objects for insert
  with check (bucket_id = 'invoices' and public.is_staff_or_admin());
create policy "invoices_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'invoices' and public.is_staff_or_admin());