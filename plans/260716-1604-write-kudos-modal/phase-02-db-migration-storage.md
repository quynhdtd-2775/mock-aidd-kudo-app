# Phase 02 — DB Migration + Storage Bucket

Track: B · Depends on: none · Parallel with Track A

## Context
- Existing schema: `supabase/migrations/20260714070000_profile_schema.sql` (kudos, profiles; RLS read-only).
- `public.kudos`: sender_id, receiver_id, hashtag_title, message, attachment_count, hashtags text,
  hearts_count, is_spam, created_at. No insert policy today.

## Requirements
Add a new forward-only migration `supabase/migrations/20260716100000_write_kudos.sql`:

1. **Columns on `public.kudos`**
   - `is_anonymous boolean not null default false`
   - `anonymous_name text` (nullable)
   - `image_urls text[] not null default '{}'`
2. **Insert RLS policy** (kudos):
   `create policy "kudos insert by sender" on public.kudos for insert to authenticated with check (sender_id = auth.uid());`
3. **Storage bucket** `kudos-images` (public read):
   `insert into storage.buckets (id, name, public) values ('kudos-images','kudos-images', true) on conflict do nothing;`
4. **Storage RLS** on `storage.objects`:
   - insert for `authenticated` where `bucket_id = 'kudos-images'`
   - select for `anon, authenticated` where `bucket_id = 'kudos-images'`

## Data Flow
Insert path writes `image_urls` = public URLs returned by storage upload; `attachment_count`
kept in sync with `array_length(image_urls)` (set in the server action, not a trigger — KISS).

## File Ownership
- Create: `supabase/migrations/20260716100000_write_kudos.sql`
- Note bucket may also be declarable in `supabase/config.toml`; prefer SQL migration for portability.

## Todo
- [x] Write migration SQL (columns + insert RLS + bucket + storage RLS)
- [x] Author only — do NOT run apply (Docker blocked)

## Success Criteria
Migration SQL parses and is idempotent-safe (`on conflict do nothing`, `if not exists` where usable).

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| Docker absent → cannot `db reset`/verify | High | Med | Author + human review now; user applies once Docker available. Flag in report. |
| Mock-auth (anon key) fails `auth.uid()` insert check | High | High | For local dev with `AUTH_MODE=mock`, insert needs a real Supabase session or a service-role client. Document; do NOT weaken prod RLS. Decide in phase-03. |
| Public bucket exposes uploads | Low | Low | Per clarifications (public bucket). Acceptable for this feature. |

## Rollback
Drop the new policy, drop columns, delete bucket rows — or `git revert` the migration file before it is ever applied.
