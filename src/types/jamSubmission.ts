export interface JamSubmission {
  id?: string;
  theme: string;
  time_available?: string;
  skill_level?: string;
  engine?: string;
  game_types?: string[];
  dimension?: string;
  team_size?: string;
  main_goal?: string;
  scope_preference?: string;
  mechanics_enjoy?: string[];
  mechanics_avoid?: string[];
  created_at?: string;
  updated_at?: string;
}

export const TIME_OPTIONS = [
  '2 hours',
  '6 hours',
  '24 hours',
  '48 hours',
  '72 hours',
  '1 week'
];

export const SKILL_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced'
];

export const ENGINES = [
  'Unity',
  'Godot',
  'Unreal',
  'GameMaker',
  'Web / JavaScript',
  'Other / Any'
];

export const GAME_TYPES = [
  'Platformer',
  'Puzzle',
  'Top-down',
  'Narrative',
  'Horror',
  'Physics-based',
  'Arcade',
  'Strategy',
  'Exploration',
  'Other'
];

export const DIMENSIONS = [
  '2D',
  '3D',
  'Either'
];

export const TEAM_SIZES = [
  'Solo',
  '2 people',
  '3–4 people',
  '5+'
];

export const MAIN_GOALS = [
  'Finish something polished',
  'Experiment with a mechanic',
  'Learn a new skill',
  'Make something unique',
  'Just have fun'
];

export const SCOPE_PREFERENCES = [
  'Very safe',
  'Balanced',
  'Ambitious'
];

export const MECHANICS = [
  'Movement',
  'Combat',
  'Physics',
  'Dialogue',
  'Exploration',
  'Resource management',
  'Stealth',
  'Rhythm',
  'Puzzle interactions'
];
