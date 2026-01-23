// Database types matching schema.sql

export interface User {
  id: string;
  netid: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'participant' | 'judge' | 'moderator' | 'admin';
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: string;
  name: string;
  event_type: 'hackathon' | 'design_competition' | 'pitch_competition';
  start_date: Date;
  end_date: Date;
  location?: string;
  description?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  registration_deadline?: Date;
  max_team_size?: number;
  min_team_size?: number;
  max_teams?: number;
  sponsor_id?: string;
  judging_phase: 'not-started' | 'in-progress' | 'ended';
  current_active_team_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Team {
  id: string;
  event_id: string;
  name: string;
  project_title?: string;
  description?: string;
  presentation_order?: number;
  status: 'waiting' | 'active' | 'completed' | 'pending' | 'approved' | 'rejected';
  project_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TeamMember {
  id: string;
  team_id: string;
  name: string;
  email?: string;
  created_at: Date;
}

export interface RubricCriteria {
  id: string;
  name: string;
  short_name?: string;
  description?: string;
  max_score: number;
  display_order: number;
  icon_name?: string;
  guiding_question?: string;
  created_at: Date;
}

export interface ScoreSubmission {
  id: string;
  user_id: string;
  event_id: string;
  team_id: string;
  started_at: Date;
  submitted_at?: Date;
  time_spent_seconds?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Score {
  id: string;
  submission_id: string;
  user_id: string;
  team_id: string;
  rubric_criteria_id: string;
  score: number;
  reflection?: string;
  created_at: Date;
  updated_at: Date;
}

export interface JudgeComment {
  id: string;
  submission_id: string;
  user_id: string;
  team_id: string;
  comments?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  tier?: 'platinum' | 'gold' | 'silver' | 'bronze';
  primary_color: string;
  secondary_color: string;
  text_color: string;
  created_at: Date;
}

export interface JudgeSession {
  id: string;
  event_id: string;
  user_id: string;
  logged_in_at: Date;
  last_activity: Date;
  logged_out_at?: Date;
}

export interface ActivityLog {
  id: string;
  event_id?: string;
  user_id?: string;
  title: string;
  description?: string;
  activity_type?: string;
  icon_name?: string;
  tone?: string;
  created_at: Date;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  netId: string;
  email: string;
  role: 'participant' | 'judge' | 'admin' | 'moderator';
  iat?: number;
  exp?: number;
}

// API Response types
export interface ApiResponse {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    [key: string]: string;
  };
  body: string; // JSON stringified
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
}

// Database credentials from Secrets Manager
export interface DbCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
  dbname: string;
}
