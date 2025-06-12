-- Insert sample polls for testing
INSERT INTO polls (
  id,
  question,
  options,
  votes,
  voters,
  created_at,
  expiry_date,
  privacy,
  creator_id,
  access_code
) VALUES 
(
  gen_random_uuid(),
  'What is your favorite programming language?',
  '["JavaScript", "Python", "TypeScript", "Go", "Rust"]',
  '[12, 18, 25, 8, 5]',
  '["user-123", "user-456", "user-789", "user-abc", "user-def"]',
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '7 days',
  'public',
  'creator-sample-123',
  NULL
),
(
  gen_random_uuid(),
  'Best time for team meetings?',
  '["Morning (9-11 AM)", "Afternoon (1-3 PM)", "Evening (5-7 PM)"]',
  '[15, 8, 3]',
  '["user-111", "user-222", "user-333", "user-444"]',
  NOW() - INTERVAL '1 day',
  NULL,
  'private',
  'creator-sample-456',
  'TEAM2024'
),
(
  gen_random_uuid(),
  'Which framework do you prefer for web development?',
  '["React", "Vue.js", "Angular", "Svelte"]',
  '[45, 12, 8, 15]',
  '["user-web1", "user-web2", "user-web3"]',
  NOW() - INTERVAL '3 hours',
  NOW() + INTERVAL '30 days',
  'public',
  'creator-sample-789',
  NULL
);
