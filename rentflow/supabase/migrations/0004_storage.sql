-- ===========================================================================
-- RentFlow — 0004 storage buckets (prompt §7, Phase 0.3)
-- Private buckets; clients access objects only via short-lived signed URLs
-- minted server-side. Object paths are namespaced per tenant: <user_id>/...
-- ===========================================================================

insert into storage.buckets (id, name, public)
values
  ('item-images', 'item-images', false),
  ('documents',   'documents',   false)
on conflict (id) do nothing;

-- Owners may manage objects under their own <user_id>/ prefix. Public/booking
-- reads happen through server-minted signed URLs (service role), not the anon role.
drop policy if exists "item_images_owner_rw" on storage.objects;
create policy "item_images_owner_rw" on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "documents_owner_read" on storage.objects;
create policy "documents_owner_read" on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
-- Document writes (confirmation/contract PDFs) are performed by the service role.
