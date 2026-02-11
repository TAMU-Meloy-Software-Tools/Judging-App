-- Migration: Add dedicated judge account field to events table
-- Each event has one dedicated judge account that all judge profiles share

ALTER TABLE events 
ADD COLUMN judge_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON COLUMN events.judge_user_id IS 'The dedicated judge account for this event - all judge profiles share this login';
