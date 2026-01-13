-- Add week_number and year columns to workout_history for weekly tracking
ALTER TABLE workout_history 
ADD COLUMN IF NOT EXISTS week_number INTEGER,
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Update existing records with week number based on completed_at
UPDATE workout_history 
SET week_number = EXTRACT(WEEK FROM completed_at),
    year = EXTRACT(YEAR FROM completed_at)
WHERE week_number IS NULL;

-- Create index for faster weekly queries
CREATE INDEX IF NOT EXISTS idx_workout_history_week ON workout_history(year, week_number);

-- Create a table to store weekly workout logs (what was done each day of each week)
CREATE TABLE IF NOT EXISTS weekly_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM')),
  workout_data JSONB NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year, week_number, day_of_week)
);

-- Create index for weekly logs
CREATE INDEX IF NOT EXISTS idx_weekly_logs_user_week ON weekly_workout_logs(user_id, year, week_number);
