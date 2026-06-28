# Contacts API Documentation

## 🎯 Overview

Complete CRUD API for contact management with role-based access control (RBAC). Follows the same security patterns as the Users module.

## 🛡️ Access Control

**Allowed Roles:**
- **Superadmin (1)**: Full access to all contacts
- **Admin (2)**: Full access to all contacts  
- **Manager (3)**: Full access to all contacts
- **Consultant (5)**: Can view all contacts, can update all contacts except closed status, cannot delete contacts

**Restricted Roles:**
- **Editor (4)**: No access to contacts module

**Special Rules:**
- **Auto-assignment**: When a user updates a contact, `assigned_to` is automatically set to that user
- **Consultant restrictions**: Cannot update contacts with `status = 'closed'`
- **Delete permissions**: Only Superadmin, Admin, Manager can delete contacts

## 📋 API Endpoints

### Authentication Required
All endpoints require `Authorization: Bearer <token>` header or httpOnly cookie.

---

## 📝 GET /api/contacts

Get all contacts with role-based filtering.

**Access:** Superadmin, Admin, Manager, Consultant  
**Special:** All roles can now see all contacts (updated logic)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "test@example.com",
      "phone": "+81-90-1234-5678",
      "message": "Tư vấn du học Nhật",
      "status": "new",
      "contact_method": "email",
      "social_contact": "facebook.com/user",
      "assigned_to": 5,
      "assigned_to_name": "Consultant User",
      "first_contacted_at": null,
      "closed_at": null,
      "created_at": "2026-04-20T16:20:00.000Z",
      "updated_at": "2026-04-20T16:20:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 🔍 GET /api/contacts/:id

Get single contact by ID.

**Access:** Superadmin, Admin, Manager, Consultant  
**Special:** Consultant can only view assigned contacts

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "test@example.com",
    "phone": "+81-90-1234-5678",
    "message": "Tư vấn du học Nhật Bản",
    "status": "new",
    "contact_method": "email",
    "social_contact": "facebook.com/user",
    "assigned_to": 5,
    "assigned_to_name": "Consultant User",
    "first_contacted_at": null,
    "closed_at": null,
    "created_at": "2026-04-20T16:20:00.000Z",
    "updated_at": "2026-04-20T16:20:00.000Z"
  }
}
```

---

## ✅ POST /api/contacts

Create new contact.

**Access:** Superadmin, Admin, Manager, Consultant

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",           // Required
  "email": "test@example.com",      // Optional
  "phone": "+81-90-1234-5678",     // Optional  
  "message": "Tư vấn du học",      // Optional
  "status": "new",                  // Optional: new|pending|responded|closed
  "contact_method": "email",        // Optional: phone|email|social
  "social_contact": "facebook.com/user", // Optional
  "assigned_to": 5                  // Optional: User ID with contact permissions
}
```

**Validation:**
- `name`: Required, max 100 characters
- `email`: Valid email format if provided
- `phone`: Valid phone format if provided
- `status`: Must be one of: `new`, `pending`, `responded`, `closed`
- `contact_method`: Must be one of: `phone`, `email`, `social`
- `assigned_to`: Must be existing user with contact permissions (roles 1,2,3,5)

**Response:**
```json
{
  "success": true,
  "message": "Contact created successfully",
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "test@example.com",
    "phone": "+81-90-1234-5678",
    "message": "Tư vấn du học",
    "status": "new",
    "contact_method": "email",
    "social_contact": "facebook.com/user",
    "assigned_to": 5,
    "first_contacted_at": null,
    "closed_at": null,
    "created_at": "2026-04-20T16:20:00.000Z",
    "updated_at": "2026-04-20T16:20:00.000Z"
  }
}
```

---

## ✏️ PUT /api/contacts/:id

Update existing contact.

**Access:** Superadmin, Admin, Manager, Consultant  
**Special:** Consultant can update all contacts except closed status  
**Auto-assignment:** `assigned_to` field is automatically set to current user ID

**Request Body:** (All fields optional)
```json
{
  "name": "Nguyễn Văn A Updated",
  "email": "new@example.com",
  "phone": "+81-90-9999-8888", 
  "message": "Updated message",
  "status": "responded",
  "contact_method": "phone",
  "social_contact": "twitter.com/user",
  "assigned_to": 3,
  "first_contacted_at": "2026-04-20T17:00:00.000Z",
  "closed_at": "2026-04-20T18:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact updated successfully",
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A Updated",
    "email": "new@example.com",
    "phone": "+81-90-9999-8888",
    "message": "Updated message", 
    "status": "responded",
    "contact_method": "phone",
    "social_contact": "twitter.com/user",
    "assigned_to": 3,
    "first_contacted_at": "2026-04-20T17:00:00.000Z",
    "closed_at": "2026-04-20T18:00:00.000Z",
    "created_at": "2026-04-20T16:20:00.000Z",
    "updated_at": "2026-04-20T17:30:00.000Z"
  }
}
```

---

## 🗑️ DELETE /api/contacts/:id

Delete contact permanently.

**Access:** Superladmin, Admin, Manager ONLY  
**Restricted:** Consultant cannot delete contacts

**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

## 👥 GET /api/contacts/assignable-users

Get users who can be assigned contacts.

**Access:** Superadmin, Admin, Manager, Consultant

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "username": "superadmin", 
      "role_name": "superadmin"
    },
    {
      "id": 2,
      "name": "Admin User",
      "username": "admin",
      "role_name": "admin"
    },
    {
      "id": 3,
      "name": "Manager User", 
      "username": "manager",
      "role_name": "manager"
    },
    {
      "id": 5,
      "name": "Consultant User",
      "username": "consultant",
      "role_name": "consultant"
    }
  ]
}
```

---

## 📊 GET /api/contacts/stats

Get contact statistics by status.

**Access:** Superadmin, Admin, Manager, Consultant  
**Special:** Consultant only sees stats for assigned contacts

**Response:**
```json
{
  "success": true,
  "data": {
    "byStatus": [
      {
        "status": "new",
        "count": "15"
      },
      {
        "status": "pending", 
        "count": "8"
      },
      {
        "status": "responded",
        "count": "12"
      },
      {
        "status": "closed",
        "count": "5"
      }
    ],
    "total": 40
  }
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Name is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions to view contacts."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Contact not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🛡️ Security Features

### Input Sanitization
- **XSS Protection**: All text inputs sanitized
- **SQL Injection Prevention**: Parameterized queries only
- **Phone/Email Validation**: Format validation and normalization
- **Length Limits**: Enforced on all fields

### Audit Logging
All operations logged with:
- `CREATE_CONTACT`: Contact creation events
- `UPDATE_CONTACT`: Contact modification events  
- `DELETE_CONTACT`: Contact deletion events
- **Context**: User ID, IP, timestamp, affected data

### Security Logging
- **Permission Violations**: Unauthorized access attempts
- **Failed Operations**: Error tracking with context
- **Data Access**: Read operations for compliance

### Rate Limiting
- **15 requests/minute** per IP for contact operations
- **Higher limit** than users (contact forms expected)

---

## 📋 Database Schema

```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    message TEXT,
    status VARCHAR(30) CHECK (
        status IN ('new', 'pending', 'responded', 'closed')
    ) DEFAULT 'new',
    contact_method VARCHAR(20) CHECK (
        contact_method IN ('phone', 'email', 'social')
    ),
    social_contact VARCHAR(255),
    assigned_to INTEGER REFERENCES users(id),
    first_contacted_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_notes (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_assigned ON contacts(assigned_to);
```

---

## 📝 Contact Notes API

### GET /api/contacts/:contactId/notes

Get all notes for a specific contact.

**Access:** Superadmin, Admin, Manager, Consultant

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "note": "Đã liên lạc với khách hàng qua email",
      "created_at": "2026-04-20T16:30:00.000Z",
      "author_name": "Admin User", 
      "author_username": "admin"
    }
  ]
}
```

### POST /api/contacts/:contactId/notes

Add a new note to a contact.

**Access:** Superadmin, Admin, Manager, Consultant

**Request Body:**
```json
{
  "note": "Khách hàng đã gửi bằng cấp và CV"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "id": 3,
    "contact_id": 1,
    "user_id": 5,
    "note": "Khách hàng đã gửi bằng cấp và CV",
    "created_at": "2026-04-20T18:00:00.000Z",
    "author_name": "Consultant User",
    "author_username": "consultant"
  }
}
```

---

## 🔄 Contact Status API

### PUT /api/contacts/:id/status

Update contact status with business logic and optional note.

**Access:** Superadmin, Admin, Manager, Consultant  
**Special:** Consultant cannot update closed contacts  
**Auto-assignment:** `assigned_to` field is set to current user

**Request Body:**
```json
{
  "status": "pending",
  "note": "Đã liên lạc với khách hàng lần đầu"
}
```

**Status Values:**
- `new` - Thư mới  
- `pending` - Chờ phản hồi (auto-sets `first_contacted_at`)
- `responded` - Đã phản hồi
- `closed` - Đã đóng (auto-sets `closed_at`)

**Response:**
```json
{
  "success": true,
  "message": "Contact status updated successfully", 
  "data": {
    "id": 1,
    "status": "pending",
    "assigned_to": 5,
    "first_contacted_at": "2026-04-20T18:00:00.000Z",
    "updated_at": "2026-04-20T18:00:00.000Z"
  }
}
```
```

---

## 🧪 Testing

Use the provided test script:
```bash
node test-contacts-api.js
```

**Test Coverage:**
- ✅ Role-based access control (updated logic)
- ✅ CRUD operations for all roles  
- ✅ Contact notes management (add/view)
- ✅ Status update with business logic
- ✅ Consultant restrictions (no closed updates, no deletions)
- ✅ Auto-assignment functionality
- ✅ Input sanitization and validation
- ✅ Input validation and sanitization
- ✅ Error handling
- ✅ Audit logging verification

---

## 🔗 Related Endpoints

- **Users API**: `/api/users` - User management
- **Auth API**: `/api/auth` - Authentication
- **System**: `/api/me` - Current user info

---

**🛡️ Security Rating: Production Ready**  
The Contacts API implements enterprise-grade security with comprehensive RBAC, input sanitization, audit logging, and rate limiting.