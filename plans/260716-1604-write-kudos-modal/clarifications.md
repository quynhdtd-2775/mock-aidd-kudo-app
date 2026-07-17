# Clarifications — Write Kudos Modal (Viết Kudo, screen ihQ26W78P2)

## Session 2026-07-16

- Q: Editor implementation + message storage format? → A: Tiptap with mention extension; store sanitized HTML in kudos.message
- Q: Hashtag source (dropdown vs free create)? → A: Suggest existing hashtags from kudos table + free-text create new
- Q: Image storage (max 5, jpg/png)? → A: Supabase Storage bucket `kudos-images` + `image_urls text[]` column on kudos
- Q: Post-submit behavior? → A: Insert to Supabase, close modal, router.refresh(); live-board feed stays mock (separate task)
- Q: Modal trigger on /kudos-live-board? → A: The "ghi nhận" pill in components/kudos-live-board/function-buttons.tsx (default, not re-asked)
- Q: Anonymous name field required when checkbox on? → A: Optional; store is_anonymous + anonymous_name, display fallback "Ẩn danh" (default, not re-asked)
- Q: Local mock-auth insert path vs strict RLS? → A: Server-only service-role client when AUTH_MODE=mock; prod keeps anon key + strict sender_id = auth.uid() RLS
- Q: No Docker runtime for local Supabase? → A: User installs/starts one themselves; implementation proceeds, migration verification deferred until ready
- Q: Image size cap? → A: 5 MB per file (default, not re-asked)
- Q: Blueprint approval? → A: Approved — forge phases 02–05
