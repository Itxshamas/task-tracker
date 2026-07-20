-- Migration: add assigned_user_id to tasks and RLS policies

-- Add role to profiles if missing
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Add assigned_user_id to tasks
ALTER TABLE IF EXISTS tasks
  ADD COLUMN IF NOT EXISTS assigned_user_id uuid REFERENCES profiles(id);

-- Enable Row Level Security on tasks
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;

-- Admins full access policy
CREATE POLICY IF NOT EXISTS "admins_full_access" ON tasks
  FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Users can select tasks assigned to them or admins
CREATE POLICY IF NOT EXISTS "users_select_assigned" ON tasks
  FOR SELECT
  USING (
    assigned_user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Users can insert tasks only if assigned_user_id is themselves or they are admin
CREATE POLICY IF NOT EXISTS "users_insert" ON tasks
  FOR INSERT
  WITH CHECK (
    (assigned_user_id IS NULL OR assigned_user_id = auth.uid()) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Users can update tasks only if the task is assigned to them or they are admin
CREATE POLICY IF NOT EXISTS "users_update" ON tasks
  FOR UPDATE
  USING (
    assigned_user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (assigned_user_id = auth.uid()) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Users can delete tasks only if assigned to them or admin
CREATE POLICY IF NOT EXISTS "users_delete" ON tasks
  FOR DELETE
  USING (
    assigned_user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Ensure profiles table has created_at
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Ensure tasks.created_at exists
ALTER TABLE IF EXISTS tasks
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Notes: Run this migration with supabase CLI or psql connected to your DB.
