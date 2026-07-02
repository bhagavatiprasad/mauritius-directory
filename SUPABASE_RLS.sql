-- ==========================================
-- MAURITIUS LOCAL BUSINESS DIRECTORY
-- COMPLETE DATABASE SETUP & SECURITY SCRIPT
-- ==========================================
-- Run this full script inside the Supabase SQL Editor (https://supabase.com/dashboard)
-- to completely build your database schema, enable storage buckets, set up auto-triggers,
-- seed initial category data, and apply RLS security policies.

-- ------------------------------------------------------------------
-- 1. DATABASE TABLES SCHEMA (DDL)
-- ------------------------------------------------------------------

-- A. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  is_admin BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- B. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY, -- Text IDs are used (e.g. 'cat-dining', 'cat-hotels')
  name TEXT NOT NULL,
  icon TEXT, -- Lucide icon keys (e.g. 'Utensils', 'Hotel')
  archived BOOLEAN DEFAULT false NOT NULL
);

-- C. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE RESTRICT,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  hours TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- ------------------------------------------------------------------
-- 2. AUTOMATIC PROFILE GENERATION TRIGGER (Auth Sync)
-- ------------------------------------------------------------------
-- This function is executed automatically on signup to create the profile row
-- and auto-promote 'hello.bhagavati@gmail.com' to administrator status.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    new.id,
    new.email,
    CASE WHEN new.email = 'hello.bhagavati@gmail.com' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email; -- Updates email if needed
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------------
-- 3. SEED INITIAL CATEGORIES DATA
-- ------------------------------------------------------------------
INSERT INTO public.categories (id, name, icon, archived) VALUES
  ('cat-dining', 'Restaurants & Dining', 'Utensils', false),
  ('cat-hotels', 'Hotels & Accommodation', 'Hotel', false),
  ('cat-shopping', 'Retail & Shopping', 'ShoppingBag', false),
  ('cat-services', 'Professional Services', 'Briefcase', false),
  ('cat-wellness', 'Health & Wellness', 'HeartPulse', false),
  ('cat-activities', 'Activities & Adventure', 'Compass', false),
  ('cat-beauty', 'Beauty & Spas', 'Sparkles', false),
  ('cat-automotive', 'Automotive & Repairs', 'Car', false)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  archived = EXCLUDED.archived;


-- ------------------------------------------------------------------
-- 4. SUPABASE STORAGE BUCKET CONFIGURATION
-- ------------------------------------------------------------------
-- Setup the 'listing-images' bucket for user uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies:
-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete Access" ON storage.objects;

-- Allow anyone to read uploaded images (Public)
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'listing-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated User Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'listing-images');

-- Allow users to delete their own uploaded images (by checking if path starts with user id)
CREATE POLICY "Owner Delete Access" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'listing-images' AND (auth.uid()::text = regexp_replace(name, '/.*', '')));


-- ------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ------------------------------------------------------------------

-- ADMIN HELPER FUNCTION (Using SECURITY DEFINER to avoid query recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND profiles.is_admin = true
  );
END;
$$;


-- A. CATEGORIES TABLE POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin write access to categories" ON public.categories;

CREATE POLICY "Allow public read access to categories"
ON public.categories FOR SELECT TO public
USING (true);

CREATE POLICY "Allow admin write access to categories"
ON public.categories FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- B. PROFILES TABLE POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for owners and admins" ON public.profiles;
DROP POLICY IF EXISTS "Allow update for owners and admins" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;

CREATE POLICY "Allow select for owners and admins"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Allow update for owners and admins"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
  (auth.uid() = id OR public.is_admin()) AND
  (is_admin = false OR public.is_admin()) -- Non-admins can never set is_admin to true
);

CREATE POLICY "Allow users to insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id AND is_admin = false);


-- C. LISTINGS TABLE POLICIES
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select based on status, ownership, or admin" ON public.listings;
DROP POLICY IF EXISTS "Allow insert for authenticated owners" ON public.listings;
DROP POLICY IF EXISTS "Allow update for owners and admins" ON public.listings;
DROP POLICY IF EXISTS "Allow delete for owners and admins" ON public.listings;

CREATE POLICY "Allow select based on status, ownership, or admin"
ON public.listings FOR SELECT TO public
USING (
  status = 'approved' OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  public.is_admin()
);

CREATE POLICY "Allow insert for authenticated owners"
ON public.listings FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  public.is_admin()
);

CREATE POLICY "Allow update for owners and admins"
ON public.listings FOR UPDATE TO authenticated
USING (
  user_id = auth.uid() OR
  public.is_admin()
)
WITH CHECK (
  user_id = auth.uid() OR 
  public.is_admin()
);

CREATE POLICY "Allow delete for owners and admins"
ON public.listings FOR DELETE TO authenticated
USING (
  user_id = auth.uid() OR
  public.is_admin()
);


-- ==================================================================
-- HOW TO VERIFY ROW LEVEL SECURITY IS WORKING PROPERLY
-- ==================================================================
-- To verify RLS is active on these tables, run the following query:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- All tables (listings, profiles, categories) should return 'true' under 'rowsecurity'.
