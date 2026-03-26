# Employee Management Pages - Implementation Plan

## ✅ Completed
1. Employee Listing Page (`/dashboard/management/employees/page.js`)
   - View modal with tabs
   - Action menu
   - Search and filter
   - API integration

2. Employee Service (`/lib/services/employeeService.js`)
   - All CRUD operations
   - Position, Salary, Visa history methods
   - Documents upload/download
   - Bank details methods

3. Employee API Proxy (`/api/employees/route.js`)
   - GET and POST endpoints

## 🔨 To Be Created

### 1. Position History Page
**Path:** `/dashboard/management/employees/[id]/position-history/page.js`
**Features:**
- List all position changes
- Add new position
- View position details
- Timeline view

### 2. Salary History Page
**Path:** `/dashboard/management/employees/[id]/salary-history/page.js`
**Features:**
- List all salary changes
- Add new salary record
- View salary progression chart
- Export salary history

### 3. Visa History Page
**Path:** `/dashboard/management/employees/[id]/visa-history/page.js`
**Features:**
- List all visa records
- Add new visa
- View visa expiry alerts
- Upload visa documents

### 4. Documents Page
**Path:** `/dashboard/management/employees/[id]/documents/page.js`
**Features:**
- List all documents
- Upload new documents
- Download documents
- Delete documents
- Document categories

### 5. Bank Details Page
**Path:** `/dashboard/management/employees/[id]/bank-details/page.js`
**Features:**
- View bank account details
- Add/Update bank details
- Multiple bank accounts support
- Verify bank details

### 6. Add Employee Page
**Path:** `/dashboard/management/employees/add/page.js`
**Features:**
- Multi-step form
- Personal information
- Visa information
- Salary information
- Contact information
- Document upload

### 7. Edit Employee Page
**Path:** `/dashboard/management/employees/edit/[id]/page.js`
**Features:**
- Same as add page but pre-filled
- Update employee information
- View change history

## API Routes Needed

All API routes need to be created in `/api/employees/[employee_id]/`:
- `/position-history/route.js`
- `/position/route.js`
- `/salary-history/route.js`
- `/salary/route.js`
- `/visa-history/route.js`
- `/visa/route.js`
- `/documents/route.js`
- `/documents/upload/route.js`
- `/documents/[document_id]/route.js`
- `/documents/[document_id]/download/route.js`
- `/bank-details/route.js`

## Priority Order
1. Add Employee Form (most important for data entry)
2. Edit Employee Form
3. Documents Page (for file management)
4. Bank Details Page
5. Position History Page
6. Salary History Page
7. Visa History Page
