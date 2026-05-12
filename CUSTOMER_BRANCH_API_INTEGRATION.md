# Customer Branch API Integration Documentation

## Overview
This document describes the API integration for customer branch management features including deactivation and credit limits.

## API Endpoints Implemented

### 1. Get Customer Deactivated Branches
**Endpoint:** `GET /api/customer-branches/deactivated/{customer_id}`

**Description:** Retrieves all deactivated branches for a specific customer.

**Request:**
```http
GET /api/customer-branches/deactivated/123
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "customer_id": 123,
    "branch_id": 5,
    "branch_name": "Dubai Main",
    "branch_code": "DXB",
    "is_active": false,
    "deactivated_at": "2024-01-15T10:30:00Z"
  }
]
```

**Frontend Usage:**
```javascript
const deactivatedBranches = await customerBranchService.getDeactivatedBranches(customerId);
```

---

### 2. Bulk Update Branch Activation
**Endpoint:** `POST /api/customer-branches/bulk-activation`

**Description:** Bulk update activation status for customer branches.

**Request:**
```http
POST /api/customer-branches/bulk-activation
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": 123,
  "branch_activations": [
    {
      "branch_id": 1,
      "is_active": false
    },
    {
      "branch_id": 2,
      "is_active": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branch activations updated successfully",
  "updated_count": 2
}
```

**Frontend Usage:**
```javascript
await customerBranchService.bulkActivation(customerId, [
  { branch_id: 1, is_active: false },
  { branch_id: 2, is_active: false }
]);
```

---

### 3. Get All Customer Branch Credits
**Endpoint:** `GET /api/customer-branches/credits`

**Description:** Retrieves all customer branch credit limits. Can be filtered by customer_id.

**Request:**
```http
GET /api/customer-branches/credits?customer_id=123
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "customer_id": 123,
    "branch_id": 1,
    "branch_name": "Dubai Main",
    "branch_code": "DXB",
    "credit_limit": 1000.00,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

**Frontend Usage:**
```javascript
// Get all credits
const allCredits = await customerBranchService.getAllCredits();

// Get credits for specific customer
const customerCredits = await customerBranchService.getAllCredits(customerId);
```

---

### 4. Create Customer Branch Credit
**Endpoint:** `POST /api/customer-branches/credits`

**Description:** Creates a new credit limit for a customer at a specific branch.

**Request:**
```http
POST /api/customer-branches/credits
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": 123,
  "branch_id": 1,
  "credit_limit": 1000.00
}
```

**Response:**
```json
{
  "id": 1,
  "customer_id": 123,
  "branch_id": 1,
  "credit_limit": 1000.00,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Frontend Usage:**
```javascript
const newCredit = await customerBranchService.createCredit({
  customer_id: 123,
  branch_id: 1,
  credit_limit: 1000.00
});
```

---

### 5. Get Customer Branch Credit
**Endpoint:** `GET /api/customer-branches/credits/{credit_id}`

**Description:** Retrieves a specific credit limit by ID.

**Request:**
```http
GET /api/customer-branches/credits/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "customer_id": 123,
  "branch_id": 1,
  "credit_limit": 1000.00,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Frontend Usage:**
```javascript
const credit = await customerBranchService.getCredit(creditId);
```

---

### 6. Update Customer Branch Credit
**Endpoint:** `PUT /api/customer-branches/credits/{credit_id}`

**Description:** Updates an existing credit limit.

**Request:**
```http
PUT /api/customer-branches/credits/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": 123,
  "branch_id": 1,
  "credit_limit": 1500.00
}
```

**Response:**
```json
{
  "id": 1,
  "customer_id": 123,
  "branch_id": 1,
  "credit_limit": 1500.00,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

**Frontend Usage:**
```javascript
const updatedCredit = await customerBranchService.updateCredit(creditId, {
  customer_id: 123,
  branch_id: 1,
  credit_limit: 1500.00
});
```

---

### 7. Delete Customer Branch Credit
**Endpoint:** `DELETE /api/customer-branches/credits/{credit_id}`

**Description:** Deletes a credit limit.

**Request:**
```http
DELETE /api/customer-branches/credits/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Credit limit deleted successfully"
}
```

**Frontend Usage:**
```javascript
await customerBranchService.deleteCredit(creditId);
```

---

## Frontend Service Implementation

### File: `app/lib/services/customerBranchService.js`

The service provides a clean interface for all customer branch operations:

```javascript
import { customerBranchService } from '@/app/lib/services/customerBranchService';

// Get deactivated branches
const deactivated = await customerBranchService.getDeactivatedBranches(customerId);

// Bulk update activations
await customerBranchService.bulkActivation(customerId, branchActivations);

// Get all credits
const credits = await customerBranchService.getAllCredits(customerId);

// Create credit
await customerBranchService.createCredit(creditData);

// Update credit
await customerBranchService.updateCredit(creditId, creditData);

// Delete credit
await customerBranchService.deleteCredit(creditId);

// Bulk update credits (helper method)
await customerBranchService.bulkUpdateCredits(customerId, credits);
```

---

## API Proxy Routes

All API calls go through Next.js proxy routes to handle CORS and authentication:

### Created Proxy Files:
1. `app/api/customer-branches/deactivated/[customer_id]/route.js`
2. `app/api/customer-branches/bulk-activation/route.js`
3. `app/api/customer-branches/credits/route.js`
4. `app/api/customer-branches/credits/[credit_id]/route.js`

### Proxy Features:
- ✅ CORS handling
- ✅ Authentication token forwarding
- ✅ Error handling
- ✅ Request/response logging
- ✅ ngrok-skip-browser-warning header

---

## Component Integration

### CustomerDeactivateModal

**File:** `app/components/CustomerDeactivateModal.js`

**API Calls:**
1. **On Open:** Fetches deactivated branches
   ```javascript
   const deactivated = await customerBranchService.getDeactivatedBranches(customer.id);
   ```

2. **On Save:** Bulk updates branch activations
   ```javascript
   await customerBranchService.bulkActivation(customer.id, branchActivations);
   ```

**Data Flow:**
```
User Opens Modal
    ↓
Fetch Branches (branchService.getDropdown)
    ↓
Fetch Deactivated Branches (customerBranchService.getDeactivatedBranches)
    ↓
User Adds/Removes Branches
    ↓
User Clicks "Deactivate Customer"
    ↓
Confirmation Modal
    ↓
User Confirms
    ↓
Call Bulk Activation API (customerBranchService.bulkActivation)
    ↓
Success → Close Modal → Refresh List
```

---

### CustomerCreditLimitModal

**File:** `app/components/CustomerCreditLimitModal.js`

**API Calls:**
1. **On Open:** Fetches existing credit limits
   ```javascript
   const credits = await customerBranchService.getAllCredits(customer.id);
   ```

2. **On Delete:** Deletes individual credit
   ```javascript
   await customerBranchService.deleteCredit(creditId);
   ```

3. **On Save:** Creates/updates credits
   ```javascript
   // Create new
   await customerBranchService.createCredit(creditData);
   
   // Update existing
   await customerBranchService.updateCredit(creditId, creditData);
   ```

**Data Flow:**
```
User Opens Modal
    ↓
Fetch Branches (branchService.getDropdown)
    ↓
Fetch Credit Limits (customerBranchService.getAllCredits)
    ↓
User Adds/Edits/Removes Credits
    ↓
User Clicks "Save Changes"
    ↓
For Each New Credit → Create via API
    ↓
For Each Existing Credit → Update via API
    ↓
Success → Close Modal → Refresh List
```

---

## Error Handling

### Permission Errors
```javascript
if (error.message.includes("Not authorized")) {
  alert("You don't have permission to perform this action. Please contact your administrator.");
}
```

### Network Errors
```javascript
if (error.message.includes("Network")) {
  alert("Network error. Please check your connection and try again.");
}
```

### Generic Errors
```javascript
alert(`Error: ${error.message}`);
```

---

## Backend Requirements

### Database Schema

**customer_branches table:**
```sql
CREATE TABLE customer_branches (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  deactivated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id, branch_id)
);
```

**customer_branch_credits table:**
```sql
CREATE TABLE customer_branch_credits (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  credit_limit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id, branch_id)
);
```

### Required Permissions

**For Deactivation:**
- `customer_branches:read` - View deactivated branches
- `customer_branches:write` - Update branch activations

**For Credit Limits:**
- `customer_branch_credits:read` - View credit limits
- `customer_branch_credits:write` - Create/update credit limits
- `customer_branch_credits:delete` - Delete credit limits

---

## Testing

### Manual Testing Checklist

**Deactivation Feature:**
- [ ] Open deactivate modal
- [ ] Verify existing deactivated branches load
- [ ] Add new branches to deactivate
- [ ] Remove branches from list
- [ ] Save and verify API call succeeds
- [ ] Verify branches are deactivated in database
- [ ] Test permission error handling
- [ ] Test network error handling

**Credit Limit Feature:**
- [ ] Open credit limit modal
- [ ] Verify existing credits load
- [ ] Add new credit limits
- [ ] Edit existing credit limits
- [ ] Delete credit limits
- [ ] Save and verify API calls succeed
- [ ] Verify credits are saved in database
- [ ] Test permission error handling
- [ ] Test network error handling

### API Testing with cURL

**Get Deactivated Branches:**
```bash
curl -X GET "http://srv1029267.hstgr.cloud:8000/api/customer-branches/deactivated/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Bulk Activation:**
```bash
curl -X POST "http://srv1029267.hstgr.cloud:8000/api/customer-branches/bulk-activation" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 123,
    "branch_activations": [
      {"branch_id": 1, "is_active": false}
    ]
  }'
```

**Create Credit:**
```bash
curl -X POST "http://srv1029267.hstgr.cloud:8000/api/customer-branches/credits" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 123,
    "branch_id": 1,
    "credit_limit": 1000.00
  }'
```

---

## Troubleshooting

### Issue: "Not authorized" error

**Cause:** User lacks required permissions

**Solution:** 
1. Check user's role permissions in database
2. Ensure role has required permissions:
   - `customer_branches:write`
   - `customer_branch_credits:write`
3. Contact administrator to grant permissions

### Issue: Deactivated branches not loading

**Cause:** API endpoint not returning data

**Solution:**
1. Check browser console for API errors
2. Verify API endpoint is accessible
3. Check backend logs for errors
4. Verify customer_id is correct

### Issue: Credit limits not saving

**Cause:** Validation error or permission issue

**Solution:**
1. Check browser console for detailed error
2. Verify credit_limit is a positive number
3. Verify branch_id exists
4. Check user has write permissions

---

## Future Enhancements

1. **Batch Operations:** Allow selecting multiple customers for bulk operations
2. **Credit History:** Track credit limit changes over time
3. **Usage Tracking:** Show how much credit has been used
4. **Alerts:** Notify when customer approaches credit limit
5. **Approval Workflow:** Require approval for high credit limits
6. **Audit Logs:** Detailed logging of all changes
7. **Export:** Export credit limits and deactivations to CSV/PDF

---

## Summary

The customer branch management features are fully integrated with the backend API. All CRUD operations are implemented with proper error handling and user feedback. The system is ready for production use once the backend endpoints are deployed and permissions are configured.
