-- Seed for the profile screen (Profile bản thân — MoMorph 3FoIx6ALVb).
-- Content mirrors the Figma design / kudos-live-board mock data; nothing invented.
--
-- DEMO_USER_ID below is the single source of truth for the demo user's UUID.
-- lib/profile/current-user.ts mirrors this value — keep them in sync.
-- DEMO_USER_ID = 00000000-0000-4000-8000-000000000001

-- auth.users rows so profiles.id FKs hold. Minimal local-dev rows.
--
-- The empty-string token columns are REQUIRED: GoTrue scans them as Go
-- strings, and a NULL there breaks every /auth/v1/token call with
-- "Database error querying schema" (500). Never seed them as NULL.
--
-- Local email/password login: demo.user@sun-asterisk.com / TestLogin123!
-- (bcrypt-hashed below; local dev only, never a real credential).
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'demo.user@sun-asterisk.com',
   extensions.crypt('TestLogin123!', extensions.gen_salt('bf')),
   now(), '{"provider":"email","providers":["email","google"]}', '{}', now(), now(),
   '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'sender.one@sun-asterisk.com', '',
   now(), '{"provider":"google","providers":["google"]}', '{}', now(), now(),
   '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000003',
   'authenticated', 'authenticated', 'sender.two@sun-asterisk.com', '',
   now(), '{"provider":"google","providers":["google"]}', '{}', now(), now(),
   '', '', '', '', '', '', '', '');

-- Demo user: profile header in the design ("Huỳnh Dương Xuân Nhật", CEVC3,
-- Legend Hero). Box counts 25/25 as shown in the stats panel.
insert into public.profiles (id, display_name, hero_code, avatar_url, hero_badge, boxes_opened, boxes_unopened, language)
values
  ('00000000-0000-4000-8000-000000000001', 'Huỳnh Dương Xuân Nhật', 'CEVC3',
   '/profile/avatar-sample-1.png', 'legend', 25, 25, 'vi'),
  ('00000000-0000-4000-8000-000000000002', 'Huỳnh Dương Xuân Nhật', 'CEVC10',
   '/profile/avatar-sample-2.png', 'super', 0, 0, 'vi'),
  ('00000000-0000-4000-8000-000000000003', 'Huỳnh Dương Xuân Nhật', 'CEVC10',
   '/profile/avatar-sample-2.png', 'legend', 0, 0, 'vi');

-- 4 kudos received by the demo user, mirroring the four post cards in the
-- design (message/hashtags/attachments/hearts copied from the Figma content).
-- Design order top→bottom: 2 "Spam" cards (Super Hero sender, no title) then
-- 2 titled cards (Legend Hero sender). Second offsets keep created_at desc
-- ordering while the displayed HH:mm stays "10:00" as in the design.
--
-- Messages are stored as sanitized HTML (matching the write-kudos modal's
-- Tiptap output): wrapped in <p>...</p>, literal "<3" escaped to "&lt;3" so
-- the ALL KUDOS feed (phase-06) renders it as text, not a mangled tag.
-- image_urls populated on the 2 titled rows to exercise real-URL rendering;
-- the 2 spam rows keep attachment_count-only (placeholder-loop) rendering.
insert into public.kudos (sender_id, receiver_id, hashtag_title, message, attachment_count, hashtags, hearts_count, is_spam, image_urls, is_anonymous, anonymous_name, created_at)
values
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '',
   '<p>Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. &lt;3 và cuộc sống...</p>',
   5, '#Dedicated #Inspring #Dedicated #Inspring #Dedicated #Inspring...', 1000, true,
   '{}', false, null,
   '2025-10-30T10:00:03+07:00'),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '',
   '<p>Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. &lt;3 và cuộc sống...</p>',
   5, '#Dedicated #Inspring #Dedicated #Inspring #Dedicated #Inspring...', 1000, true,
   '{}', false, null,
   '2025-10-30T10:00:02+07:00'),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'IDOL GIỚI TRẺ',
   '<p>Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. &lt;3 và cuộc sống...</p>',
   5, '#Dedicated #Inspring #Dedicated #Inspring #Dedicated #Inspring...', 1000, false,
   '{"/kudos-live-board/sample-image.png"}', false, null,
   '2025-10-30T10:00:01+07:00'),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'IDOL GIỚI TRẺ',
   '<p>Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. &lt;3 và cuộc sống...</p>',
   5, '#Dedicated #Inspring #Dedicated #Inspring #Dedicated #Inspring...', 1000, false,
   '{"/kudos-live-board/sample-image.png"}', false, null,
   '2025-10-30T10:00:00+07:00'),
  -- Anonymous kudos row (phase-06): exercises the "Ẩn danh" display path on
  -- the ALL KUDOS feed. Newest created_at so it renders at the top of the
  -- feed. anonymous_name left null → mapper falls back to "Ẩn danh".
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '',
   '<p>Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. &lt;3 và cuộc sống...</p>',
   5, '#Dedicated #Inspring #Dedicated #Inspring #Dedicated #Inspring...', 1000, false,
   '{}', true, null,
   '2025-10-30T10:00:04+07:00');

-- A couple of kudos SENT by the demo user so the "kudos sent" stat is non-zero.
insert into public.kudos (sender_id, receiver_id, hashtag_title, message, attachment_count, hashtags, hearts_count, created_at)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', '',
   '<p>Cảm ơn anh đã luôn hỗ trợ team hết mình!</p>', 0, '#Dedicated', 12, '2025-10-29T09:00:00+07:00'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '',
   '<p>Cảm ơn anh đã đồng hành cùng dự án!</p>', 0, '#Inspring', 8, '2025-10-28T15:30:00+07:00');

-- Icon catalog: the design shows 6 collection slots ("Bộ sưu tập icon của tôi",
-- all locked/gray in the mock). Unlock 3 for the demo user so both states render.
insert into public.secret_box_icons (id, name, image_url, sort_order)
values
  ('10000000-0000-4000-8000-000000000001', 'Icon 1', '/profile/icons/icon-1.png', 1),
  ('10000000-0000-4000-8000-000000000002', 'Icon 2', '/profile/icons/icon-2.png', 2),
  ('10000000-0000-4000-8000-000000000003', 'Icon 3', '/profile/icons/icon-3.png', 3),
  ('10000000-0000-4000-8000-000000000004', 'Icon 4', '/profile/icons/icon-4.png', 4),
  ('10000000-0000-4000-8000-000000000005', 'Icon 5', '/profile/icons/icon-5.png', 5),
  ('10000000-0000-4000-8000-000000000006', 'Icon 6', '/profile/icons/icon-6.png', 6);

insert into public.user_icon_unlocks (user_id, icon_id)
values
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002'),
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003');
