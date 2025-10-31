# API Guide - Junk Removal CRM

This guide provides comprehensive documentation for all API endpoints available in the CRM system.

## Base URLs

- **Local Development**: `http://localhost:54321/rest/v1/`
- **Production**: `https://<your-project-ref>.supabase.co/rest/v1/`

## Authentication

All API requests require a valid JWT token from Supabase Auth in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Request/Response Format

- **Content-Type**: `application/json`
- **Accept**: `application/json`

Supabase uses PostgREST, which provides a RESTful API directly from your PostgreSQL schema.

## Common Query Parameters

PostgREST supports filtering, sorting, and pagination:

- `select` - Specify columns: `?select=id,name,email`
- `eq` - Equal: `?status=eq.completed`
- `neq` - Not equal: `?status=neq.cancelled`
- `gt`, `gte`, `lt`, `lte` - Comparisons: `?amount=gt.100`
- `like`, `ilike` - Pattern matching: `?name=ilike.%john%`
- `in` - Array contains: `?status=in.(scheduled,in-progress)`
- `is` - Null check: `?notes=is.null`
- `order` - Sorting: `?order=scheduled_date.desc`
- `limit` - Limit results: `?limit=10`
- `offset` - Pagination: `?offset=20`

---

## Customers

### List Customers

```http
GET /customers
```

**Query Parameters:**
- `select` - Column selection
- `status` - Filter by status: `?status=eq.active`
- `city` - Filter by city: `?city=eq.New York`
- `order` - Sort: `?order=last_name.asc`

**Example Response:**
```json
[
  {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "555-0123",
    "address_line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Customer

```http
GET /customers?id=eq.{customer_id}
```

### Create Customer

```http
POST /customers
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "555-0456",
  "address_line1": "456 Oak Ave",
  "city": "Los Angeles",
  "state": "CA",
  "postal_code": "90001",
  "notes": "Prefers morning appointments"
}
```

**Required Fields:** `first_name`, `last_name`, `phone`, `address_line1`, `city`, `state`, `postal_code`

### Update Customer

```http
PATCH /customers?id=eq.{customer_id}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "notes": "Updated notes"
}
```

### Delete Customer

```http
DELETE /customers?id=eq.{customer_id}
```

**Note:** This will cascade delete all associated jobs, invoices, etc.

### Search Customers

```http
GET /rpc/search_customers?search_term={search_term}
```

**Example:**
```http
GET /rpc/search_customers?search_term=john
```

---

## Jobs

### List Jobs

```http
GET /jobs?select=*,customers(*)
```

**Filtering:**
- By customer: `?customer_id=eq.{id}`
- By date: `?scheduled_date=eq.2024-01-15`
- By status: `?status=eq.completed`
- Date range: `?scheduled_date=gte.2024-01-01&scheduled_date=lte.2024-01-31`

**Example Response:**
```json
[
  {
    "id": "uuid",
    "job_number": "JR-2024-0001",
    "customer_id": "uuid",
    "scheduled_date": "2024-01-15",
    "scheduled_time_start": "09:00:00",
    "scheduled_time_end": "11:00:00",
    "status": "scheduled",
    "job_type": "residential",
    "priority": "normal",
    "assigned_staff_ids": ["uuid1", "uuid2"],
    "customers": {
      "first_name": "John",
      "last_name": "Doe"
    }
  }
]
```

### Get Job Details (View)

```http
GET /job_details?id=eq.{job_id}
```

Returns comprehensive job information including customer address, quote, and invoice data.

### Create Job

```http
POST /jobs
Content-Type: application/json

{
  "customer_id": "uuid",
  "scheduled_date": "2024-01-20",
  "scheduled_time_start": "10:00:00",
  "scheduled_time_end": "12:00:00",
  "job_type": "residential",
  "priority": "high",
  "description": "Basement cleanout",
  "estimated_duration_minutes": 120,
  "assigned_staff_ids": ["uuid1"]
}
```

**Note:** `job_number` is auto-generated if not provided.

### Update Job Status

```http
PATCH /jobs?id=eq.{job_id}
Content-Type: application/json

{
  "status": "completed",
  "completed_at": "2024-01-15T14:30:00Z"
}
```

### Reschedule Job

```http
PATCH /jobs?id=eq.{job_id}
Content-Type: application/json

{
  "scheduled_date": "2024-01-22",
  "scheduled_time_start": "13:00:00",
  "status": "rescheduled"
}
```

### Cancel Job

```http
PATCH /jobs?id=eq.{job_id}
Content-Type: application/json

{
  "status": "cancelled",
  "cancelled_at": "2024-01-15T10:00:00Z",
  "cancellation_reason": "Customer requested"
}
```

---

## Quotes

### List Quotes

```http
GET /quotes?select=*,jobs(job_number),customers(first_name,last_name)
```

### Get Quote with Items

```http
GET /quotes?id=eq.{quote_id}
GET /quote_items?quote_id=eq.{quote_id}
```

### Create Quote

```http
POST /quotes
Content-Type: application/json

{
  "job_id": "uuid",
  "customer_id": "uuid",
  "estimated_amount": 500.00,
  "labor_cost": 200.00,
  "disposal_cost": 150.00,
  "distance_fee": 50.00,
  "notes": "Includes truck and 2 workers",
  "valid_until": "2024-02-01"
}
```

### Add Quote Items

```http
POST /quote_items
Content-Type: application/json

{
  "quote_id": "uuid",
  "item_description": "Large furniture removal",
  "quantity": 5,
  "unit_price": 50.00,
  "total_price": 250.00
}
```

### Update Quote Status

```http
PATCH /quotes?id=eq.{quote_id}
Content-Type: application/json

{
  "status": "accepted",
  "accepted_at": "2024-01-15T12:00:00Z"
}
```

---

## Invoices

### List Invoices

```http
GET /invoices?select=*,customers(first_name,last_name),jobs(job_number)
```

### Create Invoice

```http
POST /invoices
Content-Type: application/json

{
  "job_id": "uuid",
  "customer_id": "uuid",
  "quote_id": "uuid",
  "invoice_date": "2024-01-15",
  "due_date": "2024-02-15",
  "subtotal": 500.00,
  "tax_amount": 40.00,
  "total_amount": 540.00,
  "balance_amount": 540.00,
  "notes": "Payment due within 30 days"
}
```

### Add Invoice Items

```http
POST /invoice_items
Content-Type: application/json

{
  "invoice_id": "uuid",
  "item_description": "Junk removal service",
  "quantity": 1,
  "unit_price": 500.00,
  "total_price": 500.00
}
```

### Get Invoice with Items and Payments

```http
GET /invoices?id=eq.{invoice_id}
GET /invoice_items?invoice_id=eq.{invoice_id}
GET /payments?invoice_id=eq.{invoice_id}
```

---

## Payments

### Record Payment

```http
POST /payments
Content-Type: application/json

{
  "invoice_id": "uuid",
  "payment_method": "credit_card",
  "amount": 270.00,
  "payment_date": "2024-01-20",
  "reference_number": "TXN-12345",
  "notes": "Paid via Stripe"
}
```

**Payment Methods:** `cash`, `check`, `credit_card`, `debit_card`, `bank_transfer`, `other`

**Note:** Invoice balance and status are automatically updated.

### List Payments

```http
GET /payments?select=*,invoices(invoice_number,total_amount)
```

### Filter Payments by Date Range

```http
GET /payments?payment_date=gte.2024-01-01&payment_date=lte.2024-01-31
```

---

## Photos

### Create Photo Record

```http
POST /photos
Content-Type: application/json

{
  "job_id": "uuid",
  "storage_path": "jobs/{job_id}/before-photo-1.jpg",
  "photo_type": "before",
  "caption": "Living room before cleanup"
}
```

**Photo Types:** `before`, `after`, `during`, `other`

### Get Photos for Job

```http
GET /photos?job_id=eq.{job_id}&select=*
```

### Upload Photo File (Storage API)

```javascript
// Using Supabase JavaScript client
const { data, error } = await supabase.storage
  .from('job-photos')
  .upload(`jobs/${jobId}/${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  });
```

### Get Photo URL

```javascript
const { data } = supabase.storage
  .from('job-photos')
  .getPublicUrl(`jobs/${jobId}/${filename}`);
```

**Note:** For private buckets, use signed URLs with expiration:

```javascript
const { data } = supabase.storage
  .from('job-photos')
  .createSignedUrl(`jobs/${jobId}/${filename}`, 3600); // 1 hour expiration
```

---

## Routes

### List Routes

```http
GET /routes?select=*,route_stops(*,jobs(*))
```

### Get Routes for Date

```http
GET /routes?route_date=eq.2024-01-15
```

### Create Route

```http
POST /routes
Content-Type: application/json

{
  "route_date": "2024-01-20",
  "route_name": "Downtown Route",
  "start_location": "123 Office St",
  "end_location": "123 Office St",
  "estimated_start_time": "08:00:00",
  "estimated_end_time": "17:00:00",
  "assigned_staff_ids": ["uuid1", "uuid2"],
  "vehicle_id": "TRUCK-001"
}
```

### Add Route Stops

```http
POST /route_stops
Content-Type: application/json

{
  "route_id": "uuid",
  "job_id": "uuid",
  "stop_order": 1,
  "estimated_arrival": "08:30:00",
  "estimated_duration_minutes": 60
}
```

### Update Route Status

```http
PATCH /routes?id=eq.{route_id}
Content-Type: application/json

{
  "status": "in-progress",
  "actual_start_time": "2024-01-20T08:15:00Z"
}
```

---

## Service History

### Get Service History

```http
GET /service_history?customer_id=eq.{customer_id}&select=*,jobs(job_number)
```

### Create Service History Entry

```http
POST /service_history
Content-Type: application/json

{
  "job_id": "uuid",
  "customer_id": "uuid",
  "service_date": "2024-01-15",
  "service_notes": "Customer was very satisfied",
  "customer_feedback": "Excellent service!",
  "customer_rating": 5
}
```

**Note:** Service history is automatically created when a job status changes to "completed".

---

## Helper Functions & Views

### Search Customers

```http
GET /rpc/search_customers?search_term=john
```

### Get Customer History

```http
GET /rpc/get_customer_history?customer_uuid={customer_id}
```

### Get Available Time Slots

```http
GET /rpc/get_available_slots?target_date=2024-01-20&duration_minutes=120
```

### Get Jobs by Date Range

```http
GET /rpc/get_jobs_by_date_range?start_date=2024-01-01&end_date=2024-01-31&job_status=completed
```

### Get Revenue Summary

```http
GET /rpc/get_revenue_summary?start_date=2024-01-01&end_date=2024-01-31
```

**Response:**
```json
{
  "total_invoiced": 15000.00,
  "total_paid": 12000.00,
  "outstanding_balance": 3000.00,
  "job_count": 25,
  "completed_job_count": 20
}
```

### Customer Summary View

```http
GET /customer_summary?select=*
```

Returns customer data with aggregated job counts and outstanding balances.

### Job Details View

```http
GET /job_details?id=eq.{job_id}
```

Returns comprehensive job information including customer address, quote, and invoice.

---

## Error Handling

Supabase returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (RLS policy violation)
- `404` - Not Found
- `500` - Server Error

**Example Error Response:**
```json
{
  "message": "new row violates row-level security policy",
  "code": "42501",
  "details": null,
  "hint": null
}
```

---

## Best Practices

1. **Always use select** to limit returned columns for better performance
2. **Use pagination** with `limit` and `offset` for large datasets
3. **Filter on indexed columns** (dates, IDs, status) for faster queries
4. **Handle RLS policies** - ensure your user role has proper permissions
5. **Use transactions** when creating related records (quotes with items, invoices with payments)

---

## Example Workflows

### Complete Job Workflow

1. Create job
2. Create quote
3. Customer accepts quote
4. Job is scheduled and completed
5. Service history auto-created
6. Invoice generated
7. Payment recorded
8. Photos uploaded

### Daily Route Planning

1. Get scheduled jobs for date
2. Create route
3. Add jobs as route stops in order
4. Update route status as day progresses
5. Mark jobs as completed
6. Update actual arrival/departure times

---

For more information, see the [Supabase PostgREST documentation](https://supabase.com/docs/guides/api).

