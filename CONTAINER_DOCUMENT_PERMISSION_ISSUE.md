# Container Document Download - Permission Issue ✅

## Issue Identified
**Error**: `403 Forbidden - "Not authorized to download container documents"`

## Root Cause
The backend API is rejecting the download request due to insufficient permissions. The user's role does not have the required permission to download container documents.

## This is a Backend Permission Issue
The frontend is working correctly - it's sending the authentication token properly. The backend is receiving the request but rejecting it based on the user's permissions.

## Solution Applied (Frontend)
Improved error messages to clearly communicate the issue to users:

### Enhanced Error Handling
```javascript
if (response.status === 403) {
  throw new Error('You do not have permission to download container documents. Please contact your administrator.');
} else if (response.status === 401) {
  throw new Error('Your session has expired. Please log in again.');
} else if (response.status === 404) {
  throw new Error('Document not found. It may have been deleted.');
}
```

## Backend Fix Required

### Option 1: Add Permission to User's Role
The backend needs to grant the "Download Container Documents" permission to the user's role.

**Steps:**
1. Log into backend admin panel
2. Go to Roles & Permissions
3. Find the user's role (e.g., "Manager", "Staff")
4. Add permission: `containers.documents.download` or similar
5. Save changes

### Option 2: Update Backend API Endpoint
Modify the backend endpoint to allow document downloads for authenticated users:

**Backend File**: (Your backend API)
```python
# Example for FastAPI/Python backend
@router.get("/containers/{container_id}/documents/{document_id}/download")
async def download_container_document(
    container_id: int,
    document_id: int,
    current_user: User = Depends(get_current_user)  # Just check authentication
):
    # Remove or modify permission check
    # OLD: check_permission(current_user, "containers.documents.download")
    # NEW: Just verify user is authenticated (already done by Depends)
    
    document = get_document(container_id, document_id)
    return FileResponse(document.file_path)
```

### Option 3: Add Permission Check in Frontend
Hide the download button for users without permission:

```javascript
// In custom-clearance/page.js
const { hasPermission } = usePermission();
const canDownloadDocuments = hasPermission('containers.documents.download');

// In the documents modal
{canDownloadDocuments && (
  <button onClick={() => handleDownloadDocument(doc.id)}>
    <Download className="w-3.5 h-3.5" />
    Download
  </button>
)}
```

## Current Status

### Frontend: ✅ Fixed
- Better error messages
- Clear communication to users
- Proper error handling

### Backend: ⚠️ Needs Configuration
- User role needs "Download Container Documents" permission
- OR Backend endpoint needs to allow downloads for authenticated users
- OR Frontend needs to hide download button based on permissions

## User-Friendly Error Message
Users now see:
> "You do not have permission to download container documents. Please contact your administrator."

Instead of:
> "Failed to download document: Cannot download document: Download failed"

## Recommended Solution

**For Administrators:**
1. Go to backend admin panel
2. Navigate to Roles & Permissions
3. Find the role assigned to users who need to download documents
4. Add the "Download Container Documents" permission
5. Save and test

**For Developers:**
If all authenticated users should be able to download documents, modify the backend endpoint to remove the permission check and only verify authentication.

## Testing After Backend Fix

1. Backend admin grants permission to user's role
2. User logs out and logs back in (to refresh permissions)
3. Navigate to `/dashboard/inventory/custom-clearance`
4. Click "Documents" on a container
5. Click "Download" on a document
6. Document should download successfully ✅

## Alternative: View Instead of Download

If download permissions cannot be granted, consider adding a "View" button that opens the document in a new tab:

```javascript
const handleViewDocument = async (documentId) => {
  const url = `/api/containers/${selectedContainer.id}/documents/${documentId}/view`;
  window.open(url, '_blank');
};
```

This might have different permission requirements on the backend.

---

**Issue**: Backend Permission (403 Forbidden)  
**Frontend Status**: ✅ Fixed (Better error messages)  
**Backend Status**: ⚠️ Needs permission configuration  
**Recommended Action**: Grant "Download Container Documents" permission to user's role  
**Last Updated**: 2026-05-06
