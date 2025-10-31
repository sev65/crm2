# Setup Guide - Junk Removal CRM

Complete step-by-step setup instructions for the full-stack CRM system.

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **Supabase Account** 
   - Sign up: https://supabase.com
   - Create a new project

3. **Supabase CLI** (optional, for local development)
   ```bash
   npm install -g supabase
   ```

## Step 1: Database Setup

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run each migration file in order:
   - `supabase/migrations/20240101000001_initial_schema.sql`
   - `supabase/migrations/20240101000002_rls_policies.sql`
   - `supabase/migrations/20240101000003_storage_setup.sql`
   - `supabase/migrations/20240101000004_helper_functions.sql`

### Option B: Using Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

## Step 2: Create Storage Bucket

The storage bucket is created automatically by the migration, but verify it exists:

1. Go to Supabase Dashboard → Storage
2. Check that `job-photos` bucket exists
3. If not, create it manually with:
   - Name: `job-photos`
   - Public: No (private)
   - File size limit: 10MB

## Step 3: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to Supabase Dashboard → Settings → API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (Optional) Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

3. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Create First Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" or "Invite User"
3. Create a user with email/password
4. Copy the user's UUID from the users table
5. Go to SQL Editor and run:

```sql
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
  'PASTE-USER-UUID-HERE',
  'admin@yourcompany.com',
  'Admin User',
  'admin'
);
```

## Step 6: Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Step 7: First Login

1. Navigate to http://localhost:3000
2. You'll be redirected to `/login`
3. Enter the email and password you created
4. You should now see the dashboard!

## Production Deployment

### Deploy Frontend (Vercel Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy Frontend (Other Platforms)

The app is a standard Next.js application and can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

## Troubleshooting

### "Invalid API key" error
- Check that `.env.local` has correct values
- Restart dev server after changing env variables

### "Row Level Security policy violation"
- Verify user profile exists in `user_profiles` table
- Check user's role is set correctly

### "Storage bucket not found"
- Verify `job-photos` bucket exists in Storage
- Check bucket policies are set correctly

### Migration errors
- Run migrations in order
- Check for existing tables (may need to drop first in development)

## Next Steps

1. Create additional user profiles for Staff and Accountant roles
2. Add your first customer
3. Schedule your first job
4. Upload test photos to verify storage
5. Create a test invoice and payment

For detailed API documentation, see `docs/API_GUIDE.md`.

