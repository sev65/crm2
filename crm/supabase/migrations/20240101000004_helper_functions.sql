-- Helper Functions and Views for Common Operations
-- This migration creates useful views and functions for the CRM

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Customer with job count and last job date
CREATE OR REPLACE VIEW public.customer_summary AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.city,
    c.state,
    c.status,
    COUNT(DISTINCT j.id) as total_jobs,
    MAX(j.scheduled_date) as last_job_date,
    SUM(CASE WHEN j.status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
    SUM(CASE WHEN j.status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_jobs,
    COALESCE(SUM(i.balance_amount), 0) as outstanding_balance,
    c.created_at
FROM public.customers c
LEFT JOIN public.jobs j ON j.customer_id = c.id
LEFT JOIN public.invoices i ON i.customer_id = c.id AND i.status != 'paid'
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.city, c.state, c.status, c.created_at;

-- Job with customer and quote details
CREATE OR REPLACE VIEW public.job_details AS
SELECT 
    j.id,
    j.job_number,
    j.customer_id,
    c.first_name || ' ' || c.last_name as customer_name,
    c.phone as customer_phone,
    c.address_line1 || 
        CASE WHEN c.address_line2 IS NOT NULL THEN ', ' || c.address_line2 ELSE '' END || 
        ', ' || c.city || ', ' || c.state || ' ' || c.postal_code as customer_address,
    j.scheduled_date,
    j.scheduled_time_start,
    j.scheduled_time_end,
    j.status,
    j.job_type,
    j.priority,
    j.description,
    q.id as quote_id,
    q.quote_number,
    q.estimated_amount,
    q.actual_amount,
    i.id as invoice_id,
    i.invoice_number,
    i.total_amount as invoice_total,
    i.balance_amount as invoice_balance,
    i.status as invoice_status,
    j.assigned_staff_ids,
    j.created_at,
    j.updated_at
FROM public.jobs j
LEFT JOIN public.customers c ON c.id = j.customer_id
LEFT JOIN public.quotes q ON q.job_id = j.id
LEFT JOIN public.invoices i ON i.job_id = j.id;

-- Route with job details
CREATE OR REPLACE VIEW public.route_details AS
SELECT 
    r.id,
    r.route_date,
    r.route_name,
    r.status,
    r.start_location,
    r.end_location,
    r.estimated_start_time,
    r.estimated_end_time,
    r.assigned_staff_ids,
    COUNT(rs.id) as total_stops,
    SUM(CASE WHEN j.status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
    SUM(CASE WHEN j.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_jobs,
    r.created_at,
    r.updated_at
FROM public.routes r
LEFT JOIN public.route_stops rs ON rs.route_id = r.id
LEFT JOIN public.jobs j ON j.id = rs.job_id
GROUP BY r.id, r.route_date, r.route_name, r.status, r.start_location, r.end_location, 
         r.estimated_start_time, r.estimated_end_time, r.assigned_staff_ids, r.created_at, r.updated_at;

-- ============================================================================
-- SEARCH FUNCTIONS
-- ============================================================================

-- Search customers by name, email, or phone
CREATE OR REPLACE FUNCTION public.search_customers(search_term TEXT)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    state TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.city,
        c.state,
        c.status
    FROM public.customers c
    WHERE 
        c.first_name ILIKE '%' || search_term || '%'
        OR c.last_name ILIKE '%' || search_term || '%'
        OR c.email ILIKE '%' || search_term || '%'
        OR c.phone ILIKE '%' || search_term || '%'
        OR (c.first_name || ' ' || c.last_name) ILIKE '%' || search_term || '%'
    ORDER BY c.last_name, c.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get customer's complete history
CREATE OR REPLACE FUNCTION public.get_customer_history(customer_uuid UUID)
RETURNS TABLE (
    job_id UUID,
    job_number TEXT,
    scheduled_date DATE,
    status TEXT,
    invoice_id UUID,
    invoice_number TEXT,
    invoice_total DECIMAL,
    invoice_balance DECIMAL,
    service_date DATE,
    customer_rating INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.job_number,
        j.scheduled_date,
        j.status,
        i.id,
        i.invoice_number,
        i.total_amount,
        i.balance_amount,
        sh.service_date,
        sh.customer_rating
    FROM public.jobs j
    LEFT JOIN public.invoices i ON i.job_id = j.id
    LEFT JOIN public.service_history sh ON sh.job_id = j.id
    WHERE j.customer_id = customer_uuid
    ORDER BY j.scheduled_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SCHEDULING FUNCTIONS
-- ============================================================================

-- Get available time slots for a date
CREATE OR REPLACE FUNCTION public.get_available_slots(
    target_date DATE,
    duration_minutes INTEGER DEFAULT 120
)
RETURNS TABLE (
    start_time TIME,
    end_time TIME,
    available BOOLEAN
) AS $$
DECLARE
    slot_start TIME := '08:00:00';
    slot_end TIME;
    work_end TIME := '17:00:00';
BEGIN
    WHILE slot_start < work_end LOOP
        slot_end := slot_start + (duration_minutes || ' minutes')::INTERVAL;
        
        -- Check if slot is available (no overlapping jobs)
        RETURN QUERY
        SELECT 
            slot_start::TIME,
            slot_end::TIME,
            NOT EXISTS (
                SELECT 1 
                FROM public.jobs j
                WHERE j.scheduled_date = target_date
                    AND j.status NOT IN ('cancelled')
                    AND (
                        (j.scheduled_time_start, COALESCE(j.scheduled_time_end, j.scheduled_time_start + INTERVAL '2 hours')) 
                        OVERLAPS (slot_start, slot_end)
                    )
            ) as available;
        
        slot_start := slot_start + INTERVAL '30 minutes';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- REPORTING FUNCTIONS
-- ============================================================================

-- Get jobs by date range
CREATE OR REPLACE FUNCTION public.get_jobs_by_date_range(
    start_date DATE,
    end_date DATE,
    job_status TEXT DEFAULT NULL
)
RETURNS TABLE (
    job_id UUID,
    job_number TEXT,
    customer_name TEXT,
    scheduled_date DATE,
    status TEXT,
    total_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.job_number,
        c.first_name || ' ' || c.last_name as customer_name,
        j.scheduled_date,
        j.status,
        COALESCE(i.total_amount, q.estimated_amount, 0) as total_amount
    FROM public.jobs j
    LEFT JOIN public.customers c ON c.id = j.customer_id
    LEFT JOIN public.invoices i ON i.job_id = j.id
    LEFT JOIN public.quotes q ON q.job_id = j.id
    WHERE j.scheduled_date BETWEEN start_date AND end_date
        AND (job_status IS NULL OR j.status = job_status)
    ORDER BY j.scheduled_date, j.scheduled_time_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get revenue summary by date range
CREATE OR REPLACE FUNCTION public.get_revenue_summary(
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    total_invoiced DECIMAL,
    total_paid DECIMAL,
    outstanding_balance DECIMAL,
    job_count BIGINT,
    completed_job_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(i.total_amount), 0) as total_invoiced,
        COALESCE(SUM(i.paid_amount), 0) as total_paid,
        COALESCE(SUM(i.balance_amount), 0) as outstanding_balance,
        COUNT(DISTINCT j.id) as job_count,
        SUM(CASE WHEN j.status = 'completed' THEN 1 ELSE 0 END) as completed_job_count
    FROM public.jobs j
    LEFT JOIN public.invoices i ON i.job_id = j.id
    WHERE j.scheduled_date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

