-- Add auth reference to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Update RLS policies to use auth
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Insert default users (will be linked to auth users later)
INSERT INTO users (name, auth_id) VALUES ('Fabio', null), ('Claudia', null)
ON CONFLICT (name) DO NOTHING;
