-- Storage Buckets and Policies for Photo Storage
-- This migration creates storage buckets and sets up access policies

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Create photos bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'job-photos',
    'job-photos',
    false, -- Private bucket, requires authentication
    10485760, -- 10MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES FOR JOB PHOTOS
-- ============================================================================

-- Allow authenticated users to view photos
CREATE POLICY "Authenticated users can view photos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'job-photos' 
        AND auth.role() = 'authenticated'
    );

-- Allow Admin and Staff to upload photos
CREATE POLICY "Admin and Staff can upload photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'job-photos'
        AND (
            public.get_user_role(auth.uid()) IN ('admin', 'staff')
        )
    );

-- Allow Admin and Staff to update photos (metadata)
CREATE POLICY "Admin and Staff can update photos"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'job-photos'
        AND (
            public.get_user_role(auth.uid()) IN ('admin', 'staff')
        )
    );

-- Allow Admin and Staff to delete photos
CREATE POLICY "Admin and Staff can delete photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'job-photos'
        AND (
            public.get_user_role(auth.uid()) IN ('admin', 'staff')
        )
    );

