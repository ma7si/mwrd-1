/*
  # Fix RLS Infinite Recursion

  ## Problem
  Admin policies on user_profiles table cause infinite recursion by querying
  the same table they're protecting.

  ## Solution
  1. Drop existing problematic admin policies
  2. Create helper function that bypasses RLS to check admin status
  3. Recreate admin policies using the helper function

  ## Changes
  - Drop "Admins can view all profiles" policy
  - Drop "Admins can update all profiles" policy
  - Create is_admin() function with SECURITY DEFINER
  - Create new admin policies using is_admin() function
*/

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Create helper function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Recreate admin policies using the helper function
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Also create admin insert and delete policies for completeness
CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete profiles"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (is_admin());
