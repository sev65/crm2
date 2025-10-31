# Junk Removal CRM System

A comprehensive full-stack Customer Relationship Management (CRM) system for managing a junk removal business. This system centralizes customer information, job scheduling, pricing, service history, invoicing, photo storage, and route planning.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with React, TypeScript, and Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Storage, Authentication)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: Supabase Storage buckets for job photos
- **API**: Supabase REST API and PostgREST
- **Authentication**: Supabase Auth with role-based access control

## 📋 Features

### Core Modules

1. **Customer Management**
   - Contact information and addresses
   - Customer search with fuzzy matching
   - Customer status tracking (active, inactive, blocked)
   - Customer history view

2. **Job Scheduling**
   - Job/appointment creation and management
   - Status tracking (scheduled, in-progress, completed, cancelled)
   - Staff assignment (multiple staff per job)
   - Priority levels (low, normal, high, urgent)
   - Auto-generated job numbers

3. **Pricing & Quotes**
   - Quote generation with line items
   - Quote status tracking (draft, sent, accepted, rejected)
   - Estimated vs actual pricing
   - Quote expiration dates

4. **Service History**
   - Automatic history creation on job completion
   - Customer feedback and ratings
   - Service notes and documentation

5. **Invoicing & Payments**
   - Invoice generation with line items
   - Payment recording (cash, check, credit card, bank transfer)
   - Automatic balance calculation
   - Outstanding balance tracking
   - Invoice status (pending, partial, paid, overdue)

6. **Photo Management**
   - Before/after/during job photos
   - Secure storage in Supabase Storage
   - Photo metadata and captions
   - Linked to specific jobs

7. **Route Planning**
   - Multi-stop route creation
   - Stop ordering and sequencing
   - Route status tracking
   - Time estimation and tracking

## 🔐 User Roles & Permissions

### Admin
- Full access to all modules
- User management capabilities
- All CRUD operations

### Staff
- Jobs: Create, update, view
- Scheduling: Manage appointments
- Photos: Upload, view, manage
- Customers: View, create, update
- Service History: View, create

### Accountant
- Invoices: Full management
- Payments: Record and manage
- View-only access to customers and jobs for context

## 📁 Project Structure

```
crm/
├── supabase/
│   ├── config.toml                 # Supabase local development config
│   └── migrations/
│       ├── 20240101000001_initial_schema.sql    # Core database schema
│       ├── 20240101000002_rls_policies.sql       # Row Level Security policies
│       ├── 20240101000003_storage_setup.sql      # Storage buckets and policies
│       └── 20240101000004_helper_functions.sql  # Views and helper functions
├── docs/
│   ├── API_GUIDE.md                # API endpoint documentation
│   └── SCHEMA.md                   # Database schema documentation
└── README.md                        # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for database migrations)
- A Supabase account and project

### Setup

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Set up database** (using Supabase CLI)
   ```bash
   # Link to your Supabase project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```

4. **Create your first admin user**
   - Sign up via the Supabase dashboard Auth section
   - Insert the user profile with admin role:
   ```sql
   INSERT INTO public.user_profiles (id, email, full_name, role)
   VALUES (
     'your-user-uuid-from-auth',
     'admin@example.com',
     'Admin User',
     'admin'
   );
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) and log in!

### Database Schema

The system includes the following main tables:

- `customers` - Customer contact information
- `jobs` - Job/appointment records
- `quotes` & `quote_items` - Pricing and estimates
- `service_history` - Completed job records
- `invoices` & `invoice_items` - Billing information
- `payments` - Payment records
- `photos` - Photo metadata (storage paths)
- `routes` & `route_stops` - Route planning data
- `user_profiles` - Extended user information with roles

See `docs/SCHEMA.md` for detailed schema documentation.

## 📚 API Usage

### Authentication

All API requests require authentication via Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Base URL

- **Local**: `http://localhost:54321/rest/v1/`
- **Production**: `https://<your-project-ref>.supabase.co/rest/v1/`

### Common Endpoints

#### Customers

- `GET /customers` - List all customers
- `GET /customers?id=eq.{id}` - Get specific customer
- `POST /customers` - Create customer
- `PATCH /customers?id=eq.{id}` - Update customer
- `DELETE /customers?id=eq.{id}` - Delete customer
- `GET /rpc/search_customers?search_term={term}` - Search customers

#### Jobs

- `GET /jobs` - List all jobs
- `GET /jobs?customer_id=eq.{id}` - Get jobs for customer
- `GET /jobs?scheduled_date=eq.{date}` - Get jobs for date
- `POST /jobs` - Create job
- `PATCH /jobs?id=eq.{id}` - Update job status
- `GET /rpc/job_details` - Get detailed job view

#### Quotes

- `GET /quotes` - List all quotes
- `GET /quotes?job_id=eq.{id}` - Get quote for job
- `POST /quotes` - Create quote
- `POST /quote_items` - Add quote line items

#### Invoices & Payments

- `GET /invoices` - List all invoices
- `GET /invoices?customer_id=eq.{id}` - Get customer invoices
- `POST /invoices` - Create invoice
- `POST /payments` - Record payment
- `GET /rpc/get_revenue_summary?start_date={date}&end_date={date}` - Revenue report

#### Photos

- `POST /photos` - Create photo record
- `GET /photos?job_id=eq.{id}` - Get photos for job
- Use Supabase Storage API for actual file uploads

#### Routes

- `GET /routes` - List all routes
- `GET /routes?route_date=eq.{date}` - Get routes for date
- `POST /routes` - Create route
- `POST /route_stops` - Add stops to route

See `docs/API_GUIDE.md` for comprehensive API documentation with examples.

## 🗄️ Storage Setup

### Photo Storage

Photos are stored in the `job-photos` bucket in Supabase Storage.

**Upload a photo:**
```javascript
const { data, error } = await supabase.storage
  .from('job-photos')
  .upload(`jobs/${jobId}/${filename}`, file);

// Then create photo record
await supabase.from('photos').insert({
  job_id: jobId,
  storage_path: `jobs/${jobId}/${filename}`,
  photo_type: 'before'
});
```

**Access Policies:**
- View: All authenticated users
- Upload/Delete: Admin and Staff only
- File size limit: 10MB
- Allowed types: JPEG, PNG, WebP, GIF

## 🔄 Automated Workflows

### Job Completion
- When a job status changes to "completed", a service history entry is automatically created

### Invoice Balance Updates
- When payments are added/updated/deleted, invoice balances and status are automatically recalculated

### Number Generation
- Job numbers: `JR-YYYY-####` (e.g., JR-2024-0001)
- Quote numbers: `QT-YYYY-####`
- Invoice numbers: `INV-YYYY-####`

## 📊 Views & Functions

### Pre-built Views

- `customer_summary` - Customer overview with job counts and outstanding balances
- `job_details` - Complete job information with customer and invoice data
- `route_details` - Route information with stop counts and job status

### Helper Functions

- `search_customers(search_term)` - Fuzzy search customers
- `get_customer_history(customer_uuid)` - Complete customer job/payment history
- `get_available_slots(target_date, duration)` - Find available time slots
- `get_jobs_by_date_range(start_date, end_date, status)` - Filter jobs by date
- `get_revenue_summary(start_date, end_date)` - Revenue reporting

## 🔧 Development

### Running Migrations Locally

```bash
supabase migration up
```

### Creating New Migrations

```bash
supabase migration new migration_name
```

### Resetting Database (Local)

```bash
supabase db reset
```

## 📝 Notes

- All timestamps are stored in UTC
- Row Level Security is enabled on all tables
- Foreign key constraints ensure data integrity
- Soft deletes are not implemented - use status fields for archival

## 🚧 Future Enhancements

- Email notifications for job scheduling
- SMS reminders for appointments
- Integration with mapping services (Google Maps API)
- Route optimization algorithms
- Mobile app for field staff
- Customer portal for self-service

## 📄 License

This project is proprietary software for junk removal business operations.

## 🤝 Contributing

See `docs/SCHEMA.md` and `docs/API_GUIDE.md` for detailed documentation when contributing to this project.

