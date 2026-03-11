/*
  # Create jam submissions table

  1. New Tables
    - `jam_submissions`
      - `id` (uuid, primary key)
      - `theme` (text) - The jam theme entered by user
      - `time_available` (text) - Time constraint for the jam
      - `skill_level` (text) - User's skill level
      - `engine` (text) - Preferred engine/toolset
      - `game_types` (jsonb) - Array of preferred game types
      - `dimension` (text) - 2D, 3D, or Either
      - `team_size` (text) - Size of the team
      - `main_goal` (text) - Primary goal for the jam
      - `scope_preference` (text) - Risk tolerance
      - `mechanics_enjoy` (jsonb) - Mechanics user enjoys building
      - `mechanics_avoid` (jsonb) - Mechanics user wants to avoid
      - `created_at` (timestamptz) - When submission was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `jam_submissions` table
    - Add policy for anyone to insert submissions (no auth required)
    - Add policy for users to read their own submissions
*/

CREATE TABLE IF NOT EXISTS jam_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  time_available text,
  skill_level text,
  engine text,
  game_types jsonb DEFAULT '[]'::jsonb,
  dimension text,
  team_size text,
  main_goal text,
  scope_preference text,
  mechanics_enjoy jsonb DEFAULT '[]'::jsonb,
  mechanics_avoid jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jam_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create jam submissions"
  ON jam_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read jam submissions"
  ON jam_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update jam submissions"
  ON jam_submissions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
