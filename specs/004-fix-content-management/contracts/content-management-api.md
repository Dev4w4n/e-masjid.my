# API Contract: Content Management Recovery

**API Version**: v1  
**Base URL**: `/api`  
**Authentication**: Supabase JWT with RLS enforcement  
**Content-Type**: `application/json`

## Authentication Headers

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "field": "title",
      "constraint": "min_length_3"
    }
  }
}
```

---

## 1. Create Content

**POST** `/api/content`

Creates new content for approval by masjid admin.

### Request

```json
{
  "masjid_id": "uuid",
  "display_id": "uuid?",
  "title": "string(3-255)",
  "description": "string?",
  "type": "image|youtube_video|text_announcement|event_poster",
  "url": "string(url)",
  "thumbnail_url": "string(url)?",
  "duration": "integer(5-300)?",
  "start_date": "date(YYYY-MM-DD)?",
  "end_date": "date(YYYY-MM-DD)?",
  "sponsorship_amount": "decimal(>=0)?",
  "resubmission_of": "uuid?"
}
```

### Response 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "masjid_id": "uuid",
    "display_id": "uuid?",
    "title": "string",
    "description": "string?",
    "type": "content_type",
    "url": "string",
    "thumbnail_url": "string?",
    "status": "pending",
    "submitted_by": "uuid",
    "submitted_at": "2025-09-26T10:30:00Z",
    "approved_by": null,
    "approved_at": null,
    "rejection_reason": null,
    "approval_notes": null,
    "resubmission_of": "uuid?",
    "duration": 10,
    "start_date": "2025-09-26",
    "end_date": "2025-10-03",
    "sponsorship_amount": 0.0,
    "sponsorship_tier": null,
    "file_size": 1024768,
    "file_type": "image/jpeg",
    "created_at": "2025-09-26T10:30:00Z",
    "updated_at": "2025-09-26T10:30:00Z"
  }
}
```

### Validation Rules

- `masjid_id` must be in user's admin masjids
- `type: "image"` requires valid image URL or upload
- `type: "youtube_video"` requires valid YouTube URL
- `end_date` must be >= `start_date`
- `resubmission_of` must be owned by current user

---

## 2. List Content

**GET** `/api/content?masjid_id={uuid}&status={status}&page={int}&limit={int}`

Lists content for masjid admin with filtering and pagination.

### Query Parameters

```
masjid_id: string (required) - Masjid UUID
status: string[] (optional) - pending,active,rejected,expired
type: string[] (optional) - image,youtube_video,text_announcement,event_poster
submitted_by: string (optional) - User UUID
page: integer (optional, default: 1)
limit: integer (optional, default: 20, max: 100)
```

### Response 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Eid Celebration Poster",
      "type": "image",
      "url": "https://storage.supabase.co/...",
      "thumbnail_url": "https://storage.supabase.co/...",
      "status": "pending",
      "submitted_by": "uuid",
      "submitted_at": "2025-09-26T10:30:00Z",
      "approval_notes": null,
      "resubmission_of": null,
      "duration": 15,
      "start_date": "2025-09-27",
      "end_date": "2025-10-01",
      "sponsorship_amount": 50.0,
      "sponsorship_tier": "silver",
      "submitter": {
        "email": "user@example.com",
        "full_name": "Ahmad Rahman"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

## 3. Approve/Reject Content

**PATCH** `/api/content/{content_id}/approve`

Approves or rejects content with admin notes.

### Request

```json
{
  "action": "approve|reject",
  "notes": "string?",
  "approved_by": "uuid"
}
```

### Response 200 (Approve)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "active",
    "approved_by": "uuid",
    "approved_at": "2025-09-26T14:30:00Z",
    "approval_notes": "Looks great! Approved for display.",
    "updated_at": "2025-09-26T14:30:00Z"
  },
  "notification_sent": true
}
```

### Response 200 (Reject)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "rejected",
    "approved_by": "uuid",
    "approved_at": "2025-09-26T14:30:00Z",
    "rejection_reason": "Please use higher resolution image",
    "approval_notes": "Image quality too low for display",
    "updated_at": "2025-09-26T14:30:00Z"
  },
  "notification_sent": true
}
```

### Authorization

- User must be admin of content's masjid
- Content must be in `pending` status

---

## 4. Get Pending Approvals

**GET** `/api/approvals?masjid_id={uuid}&limit={int}`

Lists content pending approval for masjid admin dashboard.

### Query Parameters

```
masjid_id: string (optional) - Filter by specific masjid
limit: integer (optional, default: 50)
include_history: boolean (optional) - Include resubmission history
```

### Response 200

```json
{
  "success": true,
  "data": [
    {
      "content": {
        "id": "uuid",
        "title": "Friday Prayer Announcement",
        "type": "youtube_video",
        "url": "https://youtube.com/watch?v=abc123",
        "thumbnail_url": "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
        "status": "pending",
        "submitted_at": "2025-09-26T09:15:00Z",
        "duration": 30,
        "start_date": "2025-09-27",
        "end_date": "2025-09-29",
        "resubmission_of": null,
        "sponsorship_amount": 0.0
      },
      "submitter": {
        "id": "uuid",
        "email": "imam@masjid.com",
        "full_name": "Imam Abdullah"
      },
      "resubmission_history": []
    },
    {
      "content": {
        "id": "uuid",
        "title": "Community Event Poster (Revised)",
        "type": "image",
        "status": "pending",
        "submitted_at": "2025-09-26T11:45:00Z",
        "resubmission_of": "original-uuid"
      },
      "submitter": {
        "id": "uuid",
        "email": "events@masjid.com",
        "full_name": "Sister Fatimah"
      },
      "resubmission_history": [
        {
          "id": "original-uuid",
          "title": "Community Event Poster",
          "status": "rejected",
          "rejection_reason": "Missing event date",
          "approved_at": "2025-09-25T16:20:00Z"
        }
      ]
    }
  ],
  "count": 8,
  "statistics": {
    "total_pending": 8,
    "avg_approval_time_hours": 4.2,
    "resubmissions": 2
  }
}
```

---

## 5. Get/Update Display Settings

**GET** `/api/display-settings/{masjid_id}`  
**PATCH** `/api/display-settings/{masjid_id}`

Manages display configuration for content carousel.

### GET Response 200

```json
{
  "success": true,
  "data": {
    "masjid_id": "uuid",
    "carousel_interval": 10,
    "max_content_items": 20,
    "content_transition_type": "fade",
    "auto_refresh_interval": 5,
    "prayer_time_position": "top",
    "show_sponsorship_amounts": false,
    "content_filters": {
      "min_sponsorship": 0,
      "allowed_types": ["image", "youtube_video"],
      "max_duration": 60
    },
    "updated_at": "2025-09-20T08:00:00Z"
  }
}
```

### PATCH Request

```json
{
  "carousel_interval": "integer(5-60)?",
  "max_content_items": "integer(5-50)?",
  "content_transition_type": "fade|slide|zoom|none?",
  "auto_refresh_interval": "integer(1-30)?",
  "show_sponsorship_amounts": "boolean?",
  "content_filters": {
    "min_sponsorship": "decimal?",
    "allowed_types": "string[]?",
    "max_duration": "integer?"
  }
}
```

---

## File Upload Endpoint

**POST** `/api/content/upload`

Handles image file uploads to Supabase Storage.

### Request (multipart/form-data)

```
file: File (image/jpeg, image/png, image/webp, max 10MB)
masjid_id: string (UUID)
```

### Response 201

```json
{
  "success": true,
  "data": {
    "url": "https://storage.supabase.co/content-images/masjid-uuid/filename.jpg",
    "thumbnail_url": "https://storage.supabase.co/content-images/masjid-uuid/thumb_filename.jpg",
    "file_size": 2048576,
    "file_type": "image/jpeg",
    "dimensions": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

---

## Real-time Notifications

### WebSocket Events

```typescript
// Subscribe to content approval updates
supabase
  .channel("content-approvals")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "display_content",
      filter: `masjid_id=in.(${userMasjidIds.join(",")})`,
    },
    (payload) => {
      // Handle notification
      const { old, new: updated } = payload;
      if (old.status !== updated.status) {
        showNotification({
          type: "content_status_changed",
          content_id: updated.id,
          title: updated.title,
          old_status: old.status,
          new_status: updated.status,
          approval_notes: updated.approval_notes,
        });
      }
    }
  )
  .subscribe();
```

---

## Error Codes

| Code               | Description                       | HTTP Status |
| ------------------ | --------------------------------- | ----------- |
| `VALIDATION_ERROR` | Request validation failed         | 400         |
| `UNAUTHORIZED`     | User not authenticated            | 401         |
| `FORBIDDEN`        | User lacks permission for masjid  | 403         |
| `NOT_FOUND`        | Content or resource not found     | 404         |
| `CONFLICT`         | Content already approved/rejected | 409         |
| `FILE_TOO_LARGE`   | Upload exceeds 10MB limit         | 413         |
| `UNSUPPORTED_TYPE` | Invalid file type                 | 415         |
| `RATE_LIMIT`       | Too many requests                 | 429         |
| `SERVER_ERROR`     | Internal server error             | 500         |

## Rate Limiting

```
POST /api/content: 10 requests/minute per user
POST /api/content/upload: 5 requests/minute per user
PATCH /api/content/{id}/approve: 20 requests/minute per user
GET endpoints: 100 requests/minute per user
```

---

**Contract Version**: 1.0  
**Last Updated**: 26 September 2025  
**Implementation Status**: To be implemented
