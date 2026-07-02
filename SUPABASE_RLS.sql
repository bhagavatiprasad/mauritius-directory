-- ==========================================
-- MAURITIUS LOCAL BUSINESS DIRECTORY
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Run this full script inside the Supabase SQL Editor (https://supabase.com/dashboard)
-- to enforce robust backend security on your directory tables.

-- ------------------------------------------------------------------
-- 1. ADMIN HELPER FUNCTION (Using SECURITY DEFINER to prevent recursion)
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Unauthenticated guests are never admins
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


-- ------------------------------------------------------------------
-- 2. CATEGORIES TABLE POLICIES
-- ------------------------------------------------------------------
-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin write access to categories" ON public.categories;

-- Policy: Anyone can view categories (Public SELECT)
CREATE POLICY "Allow public read access to categories"
ON public.categories
FOR SELECT
TO public
USING (true);

-- Policy: Only admins can INSERT/UPDATE/DELETE categories
CREATE POLICY "Allow admin write access to categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ------------------------------------------------------------------
-- 3. PROFILES TABLE POLICIES
-- ------------------------------------------------------------------
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow select for owners and admins" ON public.profiles;
DROP POLICY IF EXISTS "Allow update for owners and admins" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;

-- Policy: Users can view only their own profile, Admins can view all
CREATE POLICY "Allow select for owners and admins"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

-- Policy: Users can update only their own profile, Admins can update all
-- WITH CHECK ensures non-admins can NEVER escalate privileges or toggle `is_admin = true`
CREATE POLICY "Allow update for owners and admins"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
  (auth.uid() = id OR public.is_admin()) AND
  (
    is_admin = false OR 
    public.is_admin()
  )
);

-- Policy: Authenticated users can insert their own profile on first login (e.g., self-healing trigger)
-- Enforces that is_admin is defaulted or set to false for normal signups
CREATE POLICY "Allow users to insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND is_admin = false);


-- ------------------------------------------------------------------
-- 4. LISTINGS TABLE POLICIES
-- ------------------------------------------------------------------
-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow select based on status, ownership, or admin" ON public.listings;
DROP POLICY IF EXISTS "Allow insert for authenticated owners" ON public.listings;
DROP POLICY IF EXISTS "Allow update for owners and admins" ON public.listings;
DROP POLICY IF EXISTS "Allow delete for owners and admins" ON public.listings;

-- Policy: SELECT
-- Anyone (public) can read APPROVED listings.
-- Authenticated users can view their own listings regardless of status.
-- Admins can view ALL listings regardless of status.
CREATE POLICY "Allow select based on status, ownership, or admin"
ON public.listings
FOR SELECT
TO public
USING (
  status = 'approved' OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  public.is_admin()
);

-- Policy: INSERT
-- Authenticated users can insert listings linked only to their own user_id.
-- Admins can insert any listing.
CREATE POLICY "Allow insert for authenticated owners"
ON public.listings
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  public.is_admin()
);

-- Policy: UPDATE
-- Owners can update their own listings.
-- Admins can update any listing.
CREATE POLICY "Allow update for owners and admins"
ON public.listings
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  public.is_admin()
)
WITH CHECK (
  user_id = auth.uid() OR 
  public.is_admin()
);

-- Policy: DELETE
-- Owners can delete their own listings.
-- Admins can delete any listing.
CREATE POLICY "Allow delete for owners and admins"
ON public.listings
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  public.is_admin()
);


-- ==================================================================
-- HOW TO VERIFY ROW LEVEL SECURITY IS WORKING PROPERLY
-- ==================================================================
--
-- 1. TESTING GUEST ACCESS:
--    - Open an Incognito/Private window (or sign out).
--    - Verify you can read categories and approved listings successfully.
--    - Attempt to insert a category or view pending listings. These must be rejected or return 0 rows.
--
-- 2. TESTING AUTHENTICATED USER:
--    - Sign in as a regular non-admin user.
--    - Try to select/update another user's profile. You should receive empty results/access denied.
--    - Try to update your own profile and change `is_admin` to `true`. This will fail with a policy violation.
--    - List a new business. Ensure `user_id` matches your uid. Try to submit with another user's `user_id`. It will fail.
--
-- 3. TESTING ADMIN ACCOUNT:
--    - Sign in as hello.bhagavati@gmail.com (ensure profiles.is_admin = true for this user).
--    - Verify you can view all user profiles, approve/reject pending listings, and edit/delete categories.
--
-- 4. DIRECT DATABASE VERIFICATION (Run in Supabase SQL editor):
--    To verify RLS is active on these tables:
--    SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--    All three tables (listings, profiles, categories) must return 'true' in the rowsecurity column.
