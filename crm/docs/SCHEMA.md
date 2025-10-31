# Database Schema Documentation

Complete documentation of the database schema for the Junk Removal CRM system.

## Overview

The database uses PostgreSQL with the following design principles:
- UUID primary keys for all tables
- Timestamps with timezone (TIMESTAMPTZ)
- Foreign key constraints for data integrity
- Row Level Security (RLS) for access control
- Auto-generated unique numbers for jobs, quotes, and invoices

---

## Tables

### user_profiles

Extends Supabase auth.users with additional profile information and role assignment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, FK → auth.users | User ID (matches auth.users) |
| email | TEXT | NOT NULL | User email address |
| full_name | TEXT | | User's full name |
| role | TEXT | NOT NULL, CHECK | Role: 'admin', 'staff', or 'accountant' |
| phone | TEXT | | Contact phone number |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- Primary key on `id`

---

### customers

Stores customer contact information and addresses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique customer ID |
| first_name | TEXT | NOT NULL | Customer first name |
| last_name | TEXT | NOT NULL | Customer last name |
| email | TEXT | | Email address |
| phone | TEXT | NOT NULL | Primary phone number |
| secondary_phone | TEXT | | Alternate phone number |
| address_line1 | TEXT | NOT NULL | Street address |
| address_line2 | TEXT | | Apartment, suite, etc. |
| city | TEXT | NOT NULL | City |
| state | TEXT | NOT NULL | State/Province |
| postal_code | TEXT | NOT NULL | ZIP/Postal code |
| country | TEXT | DEFAULT 'USA' | Country |
| notes | TEXT | | Additional notes |
| status | TEXT | DEFAULT 'active', CHECK | Status: 'active', 'inactive', 'blocked' |
| created_by | UUID | FK → auth.users | User who created record |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_customers_name` - GIN index on full name (trigram)
- `idx_customers_email` - B-tree index on email
- `idx_customers_phone` - B-tree index on phone
- `idx_customers_city` - B-tree index on city
- `idx_customers_status` - B-tree index on status

**Relationships:**
- One-to-many with `jobs`
- One-to-many with `quotes`
- One-to-many with `invoices`
- One-to-many with `service_history`

---

### jobs

Job/appointment records linked to customers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique job ID |
| customer_id | UUID | NOT NULL, FK → customers | Associated customer |
| job_number | TEXT | UNIQUE, NOT NULL | Auto-generated: JR-YYYY-#### |
| scheduled_date | DATE | NOT NULL | Scheduled date |
| scheduled_time_start | TIME | NOT NULL | Start time |
| scheduled_time_end | TIME | | End time (optional) |
| status | TEXT | DEFAULT 'scheduled', CHECK | Status enum |
| job_type | TEXT | CHECK | Type: 'residential', 'commercial', 'construction', 'estate-cleanout' |
| priority | TEXT | DEFAULT 'normal', CHECK | Priority: 'low', 'normal', 'high', 'urgent' |
| description | TEXT | | Job description |
| estimated_duration_minutes | INTEGER | | Estimated duration |
| assigned_staff_ids | UUID[] | DEFAULT '{}' | Array of assigned staff user IDs |
| completed_at | TIMESTAMPTZ | | Completion timestamp |
| cancelled_at | TIMESTAMPTZ | | Cancellation timestamp |
| cancellation_reason | TEXT | | Reason for cancellation |
| created_by | UUID | FK → auth.users | User who created job |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Status Values:**
- `scheduled` - Job is scheduled
- `in-progress` - Job is currently being worked on
- `completed` - Job is finished
- `cancelled` - Job was cancelled
- `rescheduled` - Job was rescheduled

**Indexes:**
- `idx_jobs_customer_id` - B-tree index on customer_id
- `idx_jobs_scheduled_date` - B-tree index on scheduled_date
- `idx_jobs_status` - B-tree index on status
- `idx_jobs_job_number` - B-tree index on job_number
- `idx_jobs_assigned_staff` - GIN index on assigned_staff_ids array

**Relationships:**
- Many-to-one with `customers`
- One-to-many with `quotes`
- One-to-many with `invoices`
- One-to-many with `photos`
- One-to-many with `service_history`
- Many-to-many with `routes` (via `route_stops`)

**Triggers:**
- `generate_job_number` - Auto-generates job number before insert
- `create_service_history_on_job_completion` - Creates service history when status changes to 'completed'

---

### quotes

Pricing estimates for jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique quote ID |
| job_id | UUID | FK → jobs | Associated job (nullable) |
| customer_id | UUID | NOT NULL, FK → customers | Associated customer |
| quote_number | TEXT | UNIQUE, NOT NULL | Auto-generated: QT-YYYY-#### |
| status | TEXT | DEFAULT 'draft', CHECK | Status enum |
| estimated_amount | DECIMAL(10,2) | NOT NULL | Estimated total |
| actual_amount | DECIMAL(10,2) | | Final amount after job |
| labor_cost | DECIMAL(10,2) | | Labor cost breakdown |
| disposal_cost | DECIMAL(10,2) | | Disposal fee |
| distance_fee | DECIMAL(10,2) | | Distance/travel fee |
| notes | TEXT | | Quote notes |
| valid_until | DATE | | Quote expiration date |
| sent_at | TIMESTAMPTZ | | When quote was sent to customer |
| accepted_at | TIMESTAMPTZ | | When customer accepted |
| created_by | UUID | FK → auth.users | User who created quote |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Status Values:**
- `draft` - Quote is being prepared
- `sent` - Quote sent to customer
- `accepted` - Customer accepted quote
- `rejected` - Customer rejected quote
- `expired` - Quote expired

**Indexes:**
- `idx_quotes_job_id` - B-tree index on job_id
- `idx_quotes_customer_id` - B-tree index on customer_id
- `idx_quotes_status` - B-tree index on status
- `idx_quotes_quote_number` - B-tree index on quote_number

**Relationships:**
- Many-to-one with `jobs` (nullable)
- Many-to-one with `customers`
- One-to-many with `quote_items`
- One-to-one with `invoices` (optional)

**Triggers:**
- `generate_quote_number` - Auto-generates quote number before insert

---

### quote_items

Line items for quotes (detailed breakdown).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique item ID |
| quote_id | UUID | NOT NULL, FK → quotes | Parent quote |
| item_description | TEXT | NOT NULL | Item/service description |
| quantity | INTEGER | DEFAULT 1 | Quantity |
| unit_price | DECIMAL(10,2) | NOT NULL | Price per unit |
| total_price | DECIMAL(10,2) | NOT NULL | Quantity × unit_price |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_quote_items_quote_id` - B-tree index on quote_id

**Relationships:**
- Many-to-one with `quotes`

---

### service_history

Historical records of completed jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique history ID |
| job_id | UUID | NOT NULL, FK → jobs | Associated job |
| customer_id | UUID | NOT NULL, FK → customers | Associated customer |
| service_date | DATE | NOT NULL | Date service was performed |
| service_notes | TEXT | | Service notes |
| customer_feedback | TEXT | | Customer feedback |
| customer_rating | INTEGER | CHECK (1-5) | Customer rating (1-5 stars) |
| completed_by | UUID | FK → auth.users | Staff who completed job |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_service_history_job_id` - B-tree index on job_id
- `idx_service_history_customer_id` - B-tree index on customer_id
- `idx_service_history_service_date` - B-tree index on service_date

**Relationships:**
- Many-to-one with `jobs`
- Many-to-one with `customers`

**Note:** Automatically created when job status changes to 'completed'.

---

### invoices

Billing records for completed jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique invoice ID |
| job_id | UUID | FK → jobs | Associated job (nullable) |
| customer_id | UUID | NOT NULL, FK → customers | Associated customer |
| quote_id | UUID | FK → quotes | Associated quote (nullable) |
| invoice_number | TEXT | UNIQUE, NOT NULL | Auto-generated: INV-YYYY-#### |
| invoice_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | Invoice date |
| due_date | DATE | NOT NULL | Payment due date |
| status | TEXT | DEFAULT 'pending', CHECK | Status enum |
| subtotal | DECIMAL(10,2) | NOT NULL | Subtotal before tax/discount |
| tax_amount | DECIMAL(10,2) | DEFAULT 0 | Tax amount |
| discount_amount | DECIMAL(10,2) | DEFAULT 0 | Discount amount |
| total_amount | DECIMAL(10,2) | NOT NULL | Final total |
| paid_amount | DECIMAL(10,2) | DEFAULT 0 | Amount paid so far |
| balance_amount | DECIMAL(10,2) | NOT NULL | Outstanding balance |
| notes | TEXT | | Invoice notes |
| created_by | UUID | FK → auth.users | User who created invoice |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Status Values:**
- `pending` - Invoice created, no payment
- `partial` - Partial payment received
- `paid` - Fully paid
- `overdue` - Past due date, not paid
- `cancelled` - Invoice cancelled

**Indexes:**
- `idx_invoices_job_id` - B-tree index on job_id
- `idx_invoices_customer_id` - B-tree index on customer_id
- `idx_invoices_status` - B-tree index on status
- `idx_invoices_due_date` - B-tree index on due_date
- `idx_invoices_invoice_number` - B-tree index on invoice_number

**Relationships:**
- Many-to-one with `jobs` (nullable)
- Many-to-one with `customers`
- Many-to-one with `quotes` (nullable)
- One-to-many with `invoice_items`
- One-to-many with `payments`

**Triggers:**
- `generate_invoice_number` - Auto-generates invoice number before insert
- `update_invoice_balance` - Updates balance and status when payments are added/updated/deleted

---

### invoice_items

Line items for invoices (detailed breakdown).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique item ID |
| invoice_id | UUID | NOT NULL, FK → invoices | Parent invoice |
| item_description | TEXT | NOT NULL | Item/service description |
| quantity | INTEGER | DEFAULT 1 | Quantity |
| unit_price | DECIMAL(10,2) | NOT NULL | Price per unit |
| total_price | DECIMAL(10,2) | NOT NULL | Quantity × unit_price |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_invoice_items_invoice_id` - B-tree index on invoice_id

**Relationships:**
- Many-to-one with `invoices`

---

### payments

Payment records for invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique payment ID |
| invoice_id | UUID | NOT NULL, FK → invoices | Associated invoice |
| payment_method | TEXT | NOT NULL, CHECK | Payment method enum |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| payment_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | Date payment received |
| reference_number | TEXT | | Transaction/check reference |
| notes | TEXT | | Payment notes |
| recorded_by | UUID | FK → auth.users | User who recorded payment |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Payment Methods:**
- `cash` - Cash payment
- `check` - Check payment
- `credit_card` - Credit card
- `debit_card` - Debit card
- `bank_transfer` - Bank transfer
- `other` - Other method

**Indexes:**
- `idx_payments_invoice_id` - B-tree index on invoice_id
- `idx_payments_payment_date` - B-tree index on payment_date

**Relationships:**
- Many-to-one with `invoices`

**Triggers:**
- `update_invoice_balance` - Automatically updates invoice balance and status

---

### photos

Photo metadata linked to jobs (actual files stored in Supabase Storage).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique photo ID |
| job_id | UUID | NOT NULL, FK → jobs | Associated job |
| storage_path | TEXT | NOT NULL | Path in Supabase Storage bucket |
| photo_type | TEXT | NOT NULL, CHECK | Photo type enum |
| caption | TEXT | | Photo caption |
| uploaded_by | UUID | FK → auth.users | User who uploaded |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Photo Types:**
- `before` - Before job photo
- `after` - After job photo
- `during` - During job photo
- `other` - Other/misc photo

**Indexes:**
- `idx_photos_job_id` - B-tree index on job_id
- `idx_photos_photo_type` - B-tree index on photo_type

**Relationships:**
- Many-to-one with `jobs`

**Storage:**
- Files stored in `job-photos` Supabase Storage bucket
- Path format: `jobs/{job_id}/{filename}`

---

### routes

Route plans for organizing daily job schedules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique route ID |
| route_date | DATE | NOT NULL | Route date |
| route_name | TEXT | | Route name/identifier |
| status | TEXT | DEFAULT 'planned', CHECK | Status enum |
| start_location | TEXT | | Starting address |
| end_location | TEXT | | Ending address (usually office) |
| estimated_start_time | TIME | | Estimated start time |
| estimated_end_time | TIME | | Estimated end time |
| actual_start_time | TIMESTAMPTZ | | Actual start timestamp |
| actual_end_time | TIMESTAMPTZ | | Actual end timestamp |
| assigned_staff_ids | UUID[] | DEFAULT '{}' | Array of assigned staff |
| vehicle_id | TEXT | | Vehicle identifier |
| notes | TEXT | | Route notes |
| created_by | UUID | FK → auth.users | User who created route |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Status Values:**
- `planned` - Route is planned
- `in-progress` - Route is active
- `completed` - Route is finished
- `cancelled` - Route was cancelled

**Indexes:**
- `idx_routes_route_date` - B-tree index on route_date
- `idx_routes_status` - B-tree index on status

**Relationships:**
- One-to-many with `route_stops`
- Many-to-many with `jobs` (via `route_stops`)

---

### route_stops

Individual stops (jobs) within a route.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique stop ID |
| route_id | UUID | NOT NULL, FK → routes | Parent route |
| job_id | UUID | NOT NULL, FK → jobs | Associated job |
| stop_order | INTEGER | NOT NULL | Order in route (1, 2, 3...) |
| estimated_arrival | TIME | | Estimated arrival time |
| estimated_duration_minutes | INTEGER | | Estimated stop duration |
| actual_arrival | TIMESTAMPTZ | | Actual arrival timestamp |
| actual_departure | TIMESTAMPTZ | | Actual departure timestamp |
| notes | TEXT | | Stop notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_route_stops_route_id` - B-tree index on route_id
- `idx_route_stops_job_id` - B-tree index on job_id
- `idx_route_stops_order` - Composite index on (route_id, stop_order)

**Relationships:**
- Many-to-one with `routes`
- Many-to-one with `jobs`

---

## Views

### customer_summary

Aggregated customer information with job counts and balances.

**Columns:**
- All customer columns
- `total_jobs` - Count of all jobs
- `last_job_date` - Date of most recent job
- `completed_jobs` - Count of completed jobs
- `scheduled_jobs` - Count of scheduled jobs
- `outstanding_balance` - Sum of unpaid invoice balances

### job_details

Comprehensive job view with customer and invoice information.

**Columns:**
- All job columns
- `customer_name` - Full customer name
- `customer_phone` - Customer phone
- `customer_address` - Formatted full address
- `quote_id`, `quote_number`, `estimated_amount`, `actual_amount`
- `invoice_id`, `invoice_number`, `invoice_total`, `invoice_balance`, `invoice_status`

### route_details

Route information with aggregated stop and job data.

**Columns:**
- All route columns
- `total_stops` - Count of route stops
- `completed_jobs` - Count of completed jobs on route
- `in_progress_jobs` - Count of in-progress jobs on route

---

## Functions

### Helper Functions

- `get_user_role(user_id UUID)` - Returns user's role
- `update_updated_at_column()` - Trigger function to update updated_at timestamps
- `generate_job_number()` - Auto-generates job numbers
- `generate_quote_number()` - Auto-generates quote numbers
- `generate_invoice_number()` - Auto-generates invoice numbers
- `update_invoice_balance()` - Updates invoice balance when payments change
- `create_service_history_on_job_completion()` - Creates service history on job completion

### Search Functions

- `search_customers(search_term TEXT)` - Fuzzy search customers by name, email, phone
- `get_customer_history(customer_uuid UUID)` - Get complete customer job/payment history
- `get_available_slots(target_date DATE, duration_minutes INTEGER)` - Find available time slots for scheduling

### Reporting Functions

- `get_jobs_by_date_range(start_date DATE, end_date DATE, job_status TEXT)` - Filter jobs by date range
- `get_revenue_summary(start_date DATE, end_date DATE)` - Revenue and job statistics

---

## Sequences

- `job_number_seq` - Sequence for job numbers
- `quote_number_seq` - Sequence for quote numbers
- `invoice_number_seq` - Sequence for invoice numbers

---

## Storage Buckets

### job-photos

Private bucket for storing job photos.

**Configuration:**
- Public: `false` (requires authentication)
- File size limit: 10MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**Access Policies:**
- View: All authenticated users
- Upload/Delete: Admin and Staff only

---

## Row Level Security (RLS)

All tables have RLS enabled with policies based on user roles:

- **Admin**: Full access to all tables
- **Staff**: Access to customers, jobs, quotes, service history, photos, routes
- **Accountant**: Access to invoices and payments, view-only for other tables

See `supabase/migrations/20240101000002_rls_policies.sql` for detailed policies.

---

## Data Types Reference

- **UUID**: Universally unique identifier (128-bit)
- **TEXT**: Variable-length text string
- **DATE**: Date (no time component)
- **TIME**: Time of day (no date)
- **TIMESTAMPTZ**: Timestamp with timezone
- **DECIMAL(10,2)**: Decimal number with 10 digits, 2 after decimal point
- **INTEGER**: 32-bit signed integer
- **UUID[]**: Array of UUIDs
- **BOOLEAN**: True/false value

