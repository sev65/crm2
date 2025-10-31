# Quick Start Guide

Get your Junk Removal CRM up and running quickly.

## Initial Setup

### 1. Link to Supabase Project

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

### 2. Run Migrations

```bash
supabase db push
```

This will create all tables, policies, functions, and storage buckets.

### 3. Create First Admin User

After migrations, create a user in Supabase Auth, then insert profile:

```sql
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
  'your-user-uuid-from-auth',
  'admin@example.com',
  'Admin User',
  'admin'
);
```

### 4. Set Up Storage Bucket

The `job-photos` bucket is created automatically by migrations. Verify in Supabase Dashboard → Storage.

## Testing the API

### Using cURL

```bash
# Get your API key from Supabase Dashboard → Settings → API

# List customers
curl -X GET 'https://your-project.supabase.co/rest/v1/customers' \
  -H "apikey: YOUR_API_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create a customer
curl -X POST 'https://your-project.supabase.co/rest/v1/customers' \
  -H "apikey: YOUR_API_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "555-0123",
    "address_line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001"
  }'
```

### Using JavaScript/TypeScript

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'YOUR_ANON_KEY'
)

// Create customer
const { data, error } = await supabase
  .from('customers')
  .insert({
    first_name: 'John',
    last_name: 'Doe',
    phone: '555-0123',
    address_line1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001'
  })

// Search customers
const { data } = await supabase
  .rpc('search_customers', { search_term: 'john' })
```

## Next Steps

1. Create user profiles for Staff and Accountant roles
2. Set up your first customer
3. Create a job/appointment
4. Generate a quote
5. Upload test photos to verify storage setup

See `README.md` and `docs/API_GUIDE.md` for detailed documentation.

