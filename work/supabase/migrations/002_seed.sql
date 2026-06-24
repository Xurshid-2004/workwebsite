-- Seed data matching src/data mock files (run after 001_schema.sql)

INSERT INTO categories (id, name, slug, icon) VALUES
  ('cat-design', 'Design', 'design', 'PenTool'),
  ('cat-development', 'Development', 'development', 'Code'),
  ('cat-marketing', 'Marketing', 'marketing', 'Megaphone'),
  ('cat-management', 'Management', 'management', 'Briefcase'),
  ('cat-finance', 'Finance', 'finance', 'DollarSign'),
  ('cat-support', 'Customer Support', 'customer-support', 'Headset')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, name, phone, title, avatar_url, role, profile_role, badge, company_id) VALUES
  ('user-alex', 'alex@example.com', 'Alex Johnson', '+1 (555) 201-3344', 'UI/UX Designer', 'https://i.pravatar.cc/150?u=alex', 'poster', 'both', 'Premium Member', 'company-freelance'),
  ('user-sarah', 'sarah@stripe.com', 'Sarah Jenkins', NULL, 'Talent Lead', 'https://i.pravatar.cc/150?u=sarah', 'poster', 'poster', NULL, 'company-stripe'),
  ('user-mike', 'mike@vercel.com', 'Mike Ross', NULL, 'Engineering Manager', 'https://i.pravatar.cc/150?u=mike', 'poster', 'poster', NULL, 'company-vercel'),
  ('user-emily', 'emily@notion.com', 'Emily Chen', NULL, 'Recruiter', 'https://i.pravatar.cc/150?u=emily', 'poster', 'poster', NULL, 'company-notion'),
  ('user-jordan', 'jordan@example.com', 'Jordan Lee', '+1 (555) 882-1190', 'Frontend Developer', 'https://i.pravatar.cc/150?u=jordan', 'seeker', 'seeker', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Jobs (abbreviated — full set from seed; key fields only)
INSERT INTO jobs (id, title, company_id, company_name, company_logo, category_id, poster_id, description, requirements, status, work_type, schedule_type, schedule_pattern, location, salary_min, salary_max, skills, is_featured, created_at, updated_at) VALUES
  ('job-1', 'Senior Product Designer', 'company-stripe', 'Stripe', 'https://logo.clearbit.com/stripe.com', 'cat-design', 'user-sarah', 'We are looking for an experienced Product Designer.', '["5+ years experience","Figma"]'::jsonb, 'active', 'remote', 'full-time', 'flexible-hours', '{"label":"Remote","isRemote":true}'::jsonb, 120000, 150000, '["Figma","UX"]'::jsonb, true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('job-2', 'Frontend Developer', 'company-vercel', 'Vercel', 'https://logo.clearbit.com/vercel.com', 'cat-development', 'user-mike', 'Join our frontend team.', '["React","TypeScript"]'::jsonb, 'active', 'hybrid', 'full-time', 'standard', '{"label":"San Francisco, CA","city":"San Francisco","lat":37.7749,"lng":-122.4194,"isRemote":false}'::jsonb, 130000, 160000, '["React","Next.js"]'::jsonb, true, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
  ('job-3', 'Marketing Manager', 'company-notion', 'Notion', 'https://logo.clearbit.com/notion.so', 'cat-marketing', 'user-emily', 'Lead our growth initiatives.', '["B2B marketing"]'::jsonb, 'active', 'onsite', 'full-time', 'standard', '{"label":"New York, NY","city":"New York","lat":40.7128,"lng":-74.006,"isRemote":false}'::jsonb, 90000, 120000, '["B2B","Growth"]'::jsonb, false, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('job-4', 'Backend Engineer', 'company-supabase', 'Supabase', 'https://logo.clearbit.com/supabase.com', 'cat-development', 'user-mike', 'Scale our backend.', '["PostgreSQL"]'::jsonb, 'active', 'remote', 'full-time', 'flexible-hours', '{"label":"Remote","isRemote":true}'::jsonb, 140000, 180000, '["PostgreSQL","Node.js"]'::jsonb, false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('job-5', 'Freelance Brand Designer', 'company-freelance', 'Creative Studio Co.', 'https://logo.clearbit.com/figma.com', 'cat-design', 'user-alex', 'Freelance brand designer role.', '["Branding"]'::jsonb, 'active', 'remote', 'freelance', 'flexible-hours', '{"label":"Remote","isRemote":true}'::jsonb, 60, 90, '["Branding","Figma"]'::jsonb, false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('job-6', 'Part-time Customer Support', 'company-support', 'HelpDesk Pro', 'https://logo.clearbit.com/zendesk.com', 'cat-support', 'user-alex', 'Support team role.', '["Communication"]'::jsonb, 'active', 'remote', 'part-time', 'weekends', '{"label":"Remote","isRemote":true}'::jsonb, 20, 28, '["Support"]'::jsonb, false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO favorites (user_id, job_id) VALUES
  ('user-alex', 'job-1'),
  ('user-alex', 'job-2')
ON CONFLICT DO NOTHING;

INSERT INTO chats (id, job_id, updated_at) VALUES
  ('chat-1', 'job-1', '2026-06-24T10:30:00Z'),
  ('chat-2', 'job-2', '2026-06-23T16:00:00Z'),
  ('chat-3', 'job-3', '2026-06-22T09:15:00Z'),
  ('chat-4', 'job-5', '2026-06-24T14:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_participants (chat_id, user_id) VALUES
  ('chat-1', 'user-alex'), ('chat-1', 'user-sarah'),
  ('chat-2', 'user-alex'), ('chat-2', 'user-mike'),
  ('chat-3', 'user-alex'), ('chat-3', 'user-emily'),
  ('chat-4', 'user-alex'), ('chat-4', 'user-jordan')
ON CONFLICT DO NOTHING;

INSERT INTO messages (id, chat_id, sender_id, body, read, created_at) VALUES
  ('msg-1', 'chat-1', 'user-sarah', 'Hi Alex! Thanks for applying.', true, '2026-06-24T10:00:00Z'),
  ('msg-2', 'chat-1', 'user-alex', 'Thank you! Very interested.', true, '2026-06-24T10:15:00Z'),
  ('msg-3', 'chat-1', 'user-sarah', 'Your portfolio looks great!', false, '2026-06-24T10:30:00Z'),
  ('msg-8', 'chat-4', 'user-jordan', 'Hi Alex! I saw your Freelance Brand Designer posting.', false, '2026-06-24T14:00:00Z')
ON CONFLICT (id) DO NOTHING;
