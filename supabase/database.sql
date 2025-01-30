-- First, disable RLS
ALTER TABLE generations DISABLE ROW LEVEL SECURITY;

-- Clear all existing data that might be incorrectly accessible
TRUNCATE TABLE generations;

-- Re-enable RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own generations" ON generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON generations;
DROP POLICY IF EXISTS "Users can delete their own generations" ON generations;

-- Create strict policies
CREATE POLICY "Users can view their own generations"
ON generations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() AND
  user_id IS NOT NULL AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can insert their own generations"
ON generations
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  user_id IS NOT NULL AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own generations"
ON generations
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() AND
  user_id IS NOT NULL AND
  auth.uid() IS NOT NULL
);

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS generations_user_id_idx ON generations(user_id);

-- Add a constraint to ensure user_id is never null
ALTER TABLE generations ALTER COLUMN user_id SET NOT NULL; 