# Customer API Multipart/Form-Data Support

## Summary
Updated the customer service to support both `multipart/form-data` (for file uploads) and `application/json` (for regular data) in create and update operations.

## Changes Made

### Smart Content-Type Detection
The service now automatically detects whether to use:
- **multipart/form-data** - When `profile_image` is a File object
- **application/json** - When no file is present

### Updated Methods

#### 1. `create()` Method
```javascript
customerService.create(customerData)
```

**Behavior:**
- Checks if `customerData.profile_image` is a File object
- **With File**: Uses FormData and multipart/form-data
- **Without File**: Uses JSON and application/json

**Example with File:**
```javascript
const customerData = {
  customer_code: "899",
  full_name: "test",
  phone: "087171717",
  business_name: "test",
  business_number: "100030",
  profile_image: fileObject, // File from input
  address: "Ggg",
  notes: "test",
  status: true
};

await customerService.create(customerData);
```

**Example without File:**
```javascript
const customerData = {
  customer_code: "899",
  full_name: "test",
  phone: "087171717",
  business_name: "test",
  business_number: "100030",
  profile_image: null, // No file
  address: "Ggg",
  notes: "test",
  status: true
};

await customerService.create(customerData);
```

#### 2. `update()` Method
```javascript
customerService.update(id, customerData)
```

**Behavior:**
- Same smart detection as create()
- Checks if `customerData.profile_image` is a File object
- **With File**: Uses FormData and multipart/form-data
- **Without File**: Uses JSON and application/json

**Example with File:**
```javascript
await customerService.update(4, {
  full_name: "Updated Name",
  profile_image: newFileObject, // File from input
  phone: "087171717"
});
```

**Example without File:**
```javascript
await customerService.update(4, {
  full_name: "Updated Name",
  phone: "087171717",
  profile_image: null // No file
});
```

## Implementation Details

### FormData Construction
When a file is detected:
```javascript
const formData = new FormData();

// Append all customer data to FormData
Object.keys(customerData).forEach(key => {
  if (customerData[key] !== null && customerData[key] !== undefined) {
    formData.append(key, customerData[key]);
  }
});
```

### Headers
**With File (multipart/form-data):**
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  // Content-Type is automatically set by browser for FormData
}
```

**Without File (application/json):**
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## API Endpoint Compatibility

### Backend Endpoint
```
POST   http://srv1029267.hstgr.cloud:8000/api/customers
PUT    http://srv1029267.hstgr.cloud:8000/api/customers/{id}
```

### Supported Content Types
1. ✅ `multipart/form-data` - For file uploads
2. ✅ `application/json` - For regular data

### Request Examples

#### Multipart Request (with file)
```http
POST /api/customers HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
Authorization: Bearer <token>

------WebKitFormBoundary
Content-Disposition: form-data; name="customer_code"

899
------WebKitFormBoundary
Content-Disposition: form-data; name="full_name"

test
------WebKitFormBoundary
Content-Disposition: form-data; name="profile_image"; filename="photo.jpg"
Content-Type: image/jpeg

<binary data>
------WebKitFormBoundary--
```

#### JSON Request (without file)
```http
POST /api/customers HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "customer_code": "899",
  "full_name": "test",
  "phone": "087171717",
  "business_name": "test",
  "business_number": "100030",
  "profile_image": null,
  "address": "Ggg",
  "notes": "test",
  "status": true
}
```

## Response Format

### Success Response
```json
{
  "customer_code": "899",
  "full_name": "test",
  "phone": "087171717",
  "business_name": "test",
  "business_number": "100030",
  "profile_image": "customers/profile_images/photo.jpg",
  "total_purchase": "8900.00",
  "outstanding_balance": "3637.00",
  "address": "Ggg",
  "notes": "test",
  "status": true,
  "id": 4,
  "created_at": "2026-05-12T12:48:59",
  "updated_at": "2026-05-12T12:48:59"
}
```

### Error Response
```json
{
  "error": "Error message",
  "detail": "Detailed error information"
}
```

## Usage in Forms

### File Input Handling
```javascript
// In your form component
const [formData, setFormData] = useState({
  customer_code: "",
  full_name: "",
  phone: "",
  profile_image: null
});

// Handle file input
const handleFileChange = (e) => {
  const file = e.target.files[0];
  setFormData({
    ...formData,
    profile_image: file // This will trigger multipart upload
  });
};

// Submit form
const handleSubmit = async () => {
  try {
    // Service automatically detects if file is present
    const result = await customerService.create(formData);
    console.log('Customer created:', result);
  } catch (error) {
    console.error('Failed to create customer:', error);
  }
};
```

## Benefits

### 1. Automatic Detection
- No need to manually choose between JSON and FormData
- Service handles it automatically based on data type

### 2. Backward Compatible
- Existing code using JSON continues to work
- No breaking changes to current implementations

### 3. File Upload Support
- Can now upload profile images during create/update
- No need for separate upload endpoint

### 4. Cleaner Code
- Single method for both scenarios
- No duplicate code for file vs non-file operations

## Error Handling

### File Upload Errors
```javascript
try {
  await customerService.create(customerData);
} catch (error) {
  if (error.message.includes('file')) {
    // Handle file-specific errors
    alert('Failed to upload profile image');
  } else {
    // Handle general errors
    alert('Failed to create customer');
  }
}
```

### Network Errors
```javascript
try {
  await customerService.update(id, customerData);
} catch (error) {
  if (error.message.includes('Backend server is unavailable')) {
    // Backend is down
    alert('Server is temporarily unavailable');
  } else {
    // Other errors
    alert(error.message);
  }
}
```

## Testing

### Test Cases

#### 1. Create with File
```javascript
const customerData = {
  full_name: "John Doe",
  profile_image: new File(["content"], "photo.jpg", { type: "image/jpeg" })
};
const result = await customerService.create(customerData);
// Should use multipart/form-data
```

#### 2. Create without File
```javascript
const customerData = {
  full_name: "John Doe",
  profile_image: null
};
const result = await customerService.create(customerData);
// Should use application/json
```

#### 3. Update with File
```javascript
const result = await customerService.update(4, {
  full_name: "Updated Name",
  profile_image: new File(["content"], "new-photo.jpg", { type: "image/jpeg" })
});
// Should use multipart/form-data
```

#### 4. Update without File
```javascript
const result = await customerService.update(4, {
  full_name: "Updated Name",
  profile_image: null
});
// Should use application/json
```

## Notes

- **File Detection**: Uses `instanceof File` to detect if profile_image is a file
- **Null Handling**: Null and undefined values are excluded from FormData
- **Token**: Authorization token is automatically included from localStorage
- **Error Messages**: Improved error messages with actual error details from backend

## Completion Status

✅ Create method supports multipart/form-data
✅ Update method supports multipart/form-data
✅ Automatic content-type detection
✅ Backward compatible with JSON
✅ File upload support added
✅ Error handling improved
✅ No breaking changes to existing code
