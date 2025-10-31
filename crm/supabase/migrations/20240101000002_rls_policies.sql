-- Row Level Security (RLS) Policies
-- This migration sets up RLS for all tables based on user roles

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION TO GET USER ROLE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM public.user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.user_profiles FOR SELECT
    USING (public.get_user_role(auth.uid()) = 'admin');

-- Admins can insert/update any profile
CREATE POLICY "Admins can manage all profiles"
    ON public.user_profiles FOR ALL
    USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================================
-- CUSTOMERS POLICIES
-- ============================================================================

-- All authenticated users can view customers
CREATE POLICY "All users can view customers"
    ON public.customers FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Staff can insert/update customers
CREATE POLICY "Admin and Staff can manage customers"
    ON public.customers FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'staff')
    );

-- ============================================================================
-- JOBS POLICIES
-- ============================================================================

-- All authenticated users can view jobs
CREATE POLICY "All users can view jobs"
    ON public.jobs FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Staff can manage jobs
CREATE POLICY "Admin and Staff can manage jobs"
    ON public.jobs FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'staff')
    );

-- ============================================================================
-- QUOTES POLICIES
-- ============================================================================

-- All authenticated users can view quotes
CREATE POLICY "All users can view quotes"
    ON public.quotes FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Staff can manage quotes
CREATE POLICY "Admin and Staff can manage quotes"
    ON public.quotes FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'staff')
    );

-- All authenticated users can view quote items
CREATE POLICY "All users can view quote items"
    ON public.quote_items FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Staff can manage quote items
CREATE POLICY "Admin and Staff can manage quote items"
    ON public.quote_items FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'staff')
    );

-- ============================================================================
-- SERVICE HISTORY POLICIES
-- ============================================================================

-- All authenticated users can view service history
CREATE POLICY "All users can view service history"
    ON public.service_history FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Staff can manage service history
CREATE POLICY "Admin and Staff can manage service history"
    ON public.service_history FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'staff')
    );

-- ============================================================================
-- INVOICES POLICIES
-- ============================================================================

-- All authenticated users can view invoices
CREATE POLICY "All users can view invoices"
    ON public.invoices FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Accountant can manage invoices
CREATE POLICY "Admin and Accountant can manage invoices"
    ON public.invoices FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'accountant')
    );

-- All authenticated users can view invoice items
CREATE POLICY "All users can view invoice items"
    ON public.invoice_items FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Accountant can manage invoice items
CREATE POLICY "Admin and Accountant can manage invoice items"
    ON public.invoice_items FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'accountant')
    );

-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

-- All authenticated users can view payments
CREATE POLICY "All users can view payments"
    ON public.payments FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Accountant can manage payments
CREATE POLICY "Admin and Accountant can manage payments"
    ON public.payments FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'accountant')
    );

-- ============================================================================
-- PHOTOS POLICIES
-- ============================================================================

-- All authenticated users can view photos
CREATE POLICY "All users can view photos"
    ON public.photos FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Staff can manage photos
CREATE POLICY "Admin and Staff can manage photos"
    ON public.photos FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'staff')
    );

-- ============================================================================
-- ROUTES POLICIES
-- ============================================================================

-- All authenticated users can view routes
CREATE POLICY "All users can view routes"
    ON public.routes FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Staff can manage routes
CREATE POLICY "Admin and Staff can manage routes"
    ON public.routes FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'staff')
    );

-- All authenticated users can view route stops
CREATE POLICY "All users can view route stops"
    ON public.route_stops FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin and Staff can manage route stops
CREATE POLICY "Admin and Staff can manage route stops"
    ON public.route_stops FOR ALL
    USING (
        public.get_user_role(auth.uid()) IN ('admin', 'staff')
    );

