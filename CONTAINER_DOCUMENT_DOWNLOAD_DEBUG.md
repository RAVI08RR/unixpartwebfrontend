# Container Document Download - Enhanced Debugging ✅

## Issue
Document download still failing with generic error message: "Failed to download document: Cannot download document: Download failed"

## Solution Applied
Added comprehensive logging and error handling to identify the exact issue.

## Changes Made

### 1. Enhanced API Route (`app/api/containers/[id]/documents/[document_id]/download/route.js`)

**Added Detailed Logging:**
```javascript
console.log('📥 Downloading container document:', {
  containerId: id,
  documentId: document_id,
  backendUrl,
  hasAuth: !!authHeader
});

console.log('📥 Backend response:', {
  status: response.status,
  statusText: response.statusText,
  contentType: response.headers.get('Content-Type')
});
```

**Improved Error Handling:**
```javascript
if (!response.ok) {
  const errorText = await response.text();
  console.error('📥 Download failed:', errorText);
  return new Response(JSON.stringify({ 
    error: 'Download failed', 
    details: errorText,
    status: response.status 
  }), { 
    status: response.status,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Success Logging:**
```javascript
console.log('📥 File downloaded successfully:', {
  size: fileData.byteLength,
  contentType,
  contentDisposition
});
```

### 2. Enhanced Service Method (`app/lib/services/containerService.js`)

**Added Client-Side Logging:**
```javascript
console.log('📥 Downloading document:', { containerId, documentId });

console.log('📥 Download response:', {
  status: response.status,
  statusText: response.statusText,
  contentType: response.headers.get('Content-Type')
});

console.log('📥 Blob received:', { size: blob.size, type: blob.type });
console.log('📥 Downloading as:', filename);
console.log('📥 Download triggered successfully');
```

**Better Error Messages:**
```javascript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
  console.error('📥 Download error:', errorData);
  throw new Error(errorData.details || errorData.message || errorData.error || 'Download failed');
}
```

**Improved Filename Handling:**
```javascript
let filename = `document-${documentId}`;  // Fallback with document ID
```

## How to Debug

### 1. Open Browser Console
Press F12 or right-click → Inspect → Console tab

### 2. Try to Download a Document
Click the "Download" button on any document

### 3. Check Console Logs
You should see logs like:
```
📥 Downloading document: {containerId: "123", documentId: "456"}
📥 Download response: {status: 200, statusText: "OK", contentType: "application/pdf"}
📥 Blob received: {size: 12345, type: "application/pdf"}
📥 Downloading as: "my-document.pdf"
📥 Download triggered successfully
```

### 4. If Error Occurs
The console will show:
```
📥 Download error: {error: "...", details: "...", status: 404}
📦 Container document download failed: Error: ...
```

## Common Issues and Solutions

### Issue 1: 404 Not Found
**Cause**: Document doesn't exist in backend  
**Solution**: Check if document ID is correct

### Issue 2: 401 Unauthorized
**Cause**: Missing or invalid auth token  
**Solution**: Check if user is logged in, token might be expired

### Issue 3: 500 Internal Server Error
**Cause**: Backend error  
**Solution**: Check backend logs, file might be missing from storage

### Issue 4: CORS Error
**Cause**: Cross-origin request blocked  
**Solution**: Already handled with `Access-Control-Allow-Origin: *`

### Issue 5: Network Error
**Cause**: Backend not reachable  
**Solution**: Check if backend API is running

## Testing Steps

1. **Navigate** to `/dashboard/inventory/custom-clearance`
2. **Click** "Documents" button on any container
3. **Open** browser console (F12)
4. **Click** "Download" on a document
5. **Check** console logs for detailed information
6. **Report** the exact error message from console

## What to Look For

### Success Indicators:
- ✅ Status: 200
- ✅ Blob size > 0
- ✅ File downloads automatically
- ✅ Correct filename

### Failure Indicators:
- ❌ Status: 4xx or 5xx
- ❌ Error in console
- ❌ No file download
- ❌ Toast error message

## Next Steps

After trying to download:
1. Copy the console logs
2. Share the exact error message
3. Note the HTTP status code
4. Check if the document exists in backend

This will help identify the exact issue!

---

**Status**: ✅ Enhanced Debugging Added  
**Files Modified**: 
- `app/api/containers/[id]/documents/[document_id]/download/route.js`
- `app/lib/services/containerService.js`  
**Last Updated**: 2026-05-06
