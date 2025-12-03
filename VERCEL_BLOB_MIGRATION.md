# Vercel Blob Storage Migration

## Overview

PDF storage has been migrated from local disk storage (`/tmp` or `uploads/`) to **Vercel Blob Storage** for persistent, production-ready file storage.

## Changes Made

### 1. New Helper Library (`lib/pdfStorage.ts`)
- Centralized PDF upload logic using `@vercel/blob`
- Handles file validation, buffer conversion, and Blob upload
- Returns public URL, filename, size, and buffer

### 2. Updated PDF Upload Route (`app/api/pdf/upload/route.ts`)
- Uploads PDF to Vercel Blob Storage immediately
- Calculates page count from in-memory buffer
- Returns `pdfUrl`, `pdfName`, `pdfSize`, and `pageCount`
- No longer writes to disk

### 3. Updated Order Interface (`lib/ordersStore.ts`)
- Added `pdfUrl: string` (required) - Vercel Blob Storage URL
- Added `pdfName?: string` - Original PDF filename
- Added `pdfSize?: number` - PDF file size in bytes
- Kept `pdfPath?: string` (deprecated) - For backward compatibility only

### 4. Updated Order Creation Flow
- `app/api/paytr/init/route.ts` now accepts `pdfUrl`, `pdfName`, `pdfSize`
- Order creation stores Blob URL instead of file path

### 5. Updated Frontend
- `components/OrderForm.tsx` now uses `pdfUrl` from upload response
- Admin panel (`app/admin/page.tsx`) opens PDFs directly from Blob URL
- Backward compatibility: Falls back to old `pdfPath` route if `pdfUrl` not available

### 6. Backward Compatibility
- Old PDF serving route (`app/api/admin/pdf/[filePath]/route.ts`) kept for legacy orders
- Admin panel handles both `pdfUrl` and `pdfPath`
- Migration can happen gradually without breaking existing orders

## Environment Setup

### Vercel Blob Storage

The `@vercel/blob` package automatically uses the `BLOB_READ_WRITE_TOKEN` environment variable from Vercel.

**Local Development:**
```bash
# Add to .env.local (get from Vercel dashboard)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

**Production:**
- Automatically configured when deployed to Vercel
- Token is available in Vercel environment variables

## API Changes

### PDF Upload Response

**Before:**
```json
{
  "filePath": "uuid.pdf",
  "fileId": "uuid"
}
```

**After:**
```json
{
  "success": true,
  "pdfUrl": "https://xxx.public.blob.vercel-storage.com/...",
  "pdfName": "document.pdf",
  "pdfSize": 123456,
  "pageCount": 42,
  "fileId": "..."
}
```

### Order Creation Request

**Before:**
```json
{
  "pdfPath": "uuid.pdf",
  ...
}
```

**After:**
```json
{
  "pdfUrl": "https://xxx.public.blob.vercel-storage.com/...",
  "pdfName": "document.pdf",
  "pdfSize": 123456,
  "pageCount": 42,
  ...
}
```

## Migration Strategy

1. **New Orders**: Automatically use Vercel Blob Storage
2. **Old Orders**: Continue to work via legacy PDF serving route
3. **Optional Migration**: Can migrate old orders to Blob Storage if needed

## Benefits

- ✅ Persistent storage (not ephemeral like `/tmp`)
- ✅ Public URLs for direct access
- ✅ No file system dependencies
- ✅ Scalable cloud storage
- ✅ Automatic CDN delivery

## Notes

- PDF files are stored in Blob Storage with prefix `pdfs/`
- Files are publicly accessible (required for admin panel)
- Old PDF serving route is deprecated but functional for backward compatibility
