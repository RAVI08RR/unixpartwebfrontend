# Assets API - Complete Implementation

All Assets API endpoints have been implemented as Next.js proxy routes.

## Available Endpoints

### Basic Asset Operations
- ✅ `GET /api/assets/` - Get all assets (with pagination, filters)
- ✅ `POST /api/assets/` - Create asset
- ✅ `GET /api/assets/by-asset-id/{asset_id}` - Get asset by asset_id string
- ✅ `GET /api/assets/{asset_id}` - Get asset by ID
- ✅ `PUT /api/assets/{asset_id}` - Update asset
- ✅ `DELETE /api/assets/{asset_id}` - Delete asset
- ✅ `POST /api/assets/with-default-ownership` - Create asset with default ownership

### Ownership Management
- ✅ `PUT /api/assets/{asset_id}/ownership` - Update asset ownership
- ✅ `GET /api/assets/{asset_id}/ownership-history` - Get ownership history
- ✅ `PUT /api/assets/{asset_id}/ownership-with-history` - Update ownership with history
- ✅ `PUT /api/assets/{asset_id}/ownership/with-history` - Update ownership with history (alternative path)

### Transfer Operations
- ✅ `GET /api/assets/{asset_id}/transfer-history` - Get transfer history
- ✅ `POST /api/assets/{asset_id}/transfer` - Transfer asset

### Document Management
- ✅ `GET /api/assets/{asset_id}/documents` - Get all documents for asset
- ✅ `POST /api/assets/{asset_id}/documents` - Upload document
- ✅ `POST /api/assets/{asset_id}/documents/upload` - Upload document (alternative path)
- ✅ `DELETE /api/assets/documents/{document_id}` - Delete document
- ✅ `GET /api/assets/{asset_id}/documents/{document_id}/download` - Download document

### Sales Operations
- ✅ `POST /api/assets/{asset_id}/sell` - Sell asset
- ✅ `GET /api/assets/{asset_id}/sale` - Get asset sale details
- ✅ `GET /api/assets/sales/all` - Get all asset sales

## Request/Response Examples

### Create Asset
```javascript
POST /api/assets/
{
  "asset_name": "Laptop Dell XPS 15",
  "category": "Electronics",
  "description": "High-performance laptop",
  "serial_number": "SN123456",
  "purchase_date": "2026-03-18",
  "purchase_price": 1500,
  "purchase_branch_id": 1,
  "current_operating_branch_id": 1,
  "condition": "Good",
  "status": "Active",
  "ownerships": []
}
```

### Get All Assets
```javascript
GET /api/assets/?skip=0&limit=100&status=Active&branch_id=1
```

### Response Format
```javascript
[
  {
    "asset_name": "string",
    "category": "string",
    "description": "string",
    "serial_number": "string",
    "purchase_date": "2026-03-18",
    "purchase_price": "string",
    "purchase_branch_id": 0,
    "current_operating_branch_id": 0,
    "condition": "Good",
    "status": "Active",
    "id": 0,
    "asset_id": "string",
    "created_at": "2026-03-18T07:34:30.427Z",
    "updated_at": "2026-03-18T07:34:30.427Z",
    "purchase_branch": {
      "id": 0,
      "branch_code": "string",
      "branch_name": "string"
    },
    "current_operating_branch": {
      "id": 0,
      "branch_code": "string",
      "branch_name": "string"
    },
    "asset_ownerships": []
  }
]
```

## Usage in Frontend

```javascript
import { apiClient } from '@/app/lib/api';

// Get all assets
const assets = await apiClient.get('/api/assets/?skip=0&limit=100');

// Create asset
const newAsset = await apiClient.post('/api/assets/', assetData);

// Update asset
const updated = await apiClient.put(`/api/assets/${assetId}`, updateData);

// Delete asset
await apiClient.delete(`/api/assets/${assetId}`);

// Transfer asset
await apiClient.post(`/api/assets/${assetId}/transfer`, transferData);

// Sell asset
await apiClient.post(`/api/assets/${assetId}/sell`, saleData);

// Upload document
const formData = new FormData();
formData.append('file', file);
formData.append('document_type', 'Invoice');
await apiClient.post(`/api/assets/${assetId}/documents`, formData);
```

## Notes

- All routes include proper CORS headers
- Authorization headers are forwarded from client to backend
- Timeouts are set appropriately (10s for GET, 15s for POST/PUT)
- Error handling returns appropriate status codes
- Document uploads support multipart/form-data
- Document downloads preserve content-type and content-disposition headers
