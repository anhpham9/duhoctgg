# 🧑‍💼 Users CRUD API with RBAC

Complete users management API with Role-Based Access Control (RBAC) implementation.

---

## 🛡️ Permission Matrix

| Feature | Superadmin | Admin | Manager | Editor | Consultant |
|---------|------------|-------|---------|--------|------------|
| **View Users** | ✅ All | ✅ [3,4,5] | ✅ [4,5] | ❌ | ❌ |
| **Create Users** | ✅ All roles | ✅ [3,4,5] | ✅ [4,5] | ❌ | ❌ |
| **Update Users** | ✅ All | ✅ [3,4,5] | ✅ [4,5] | ❌ | ❌ |
| **Delete Users** | ✅ All | ✅ [3,4,5] | ✅ [4,5] | ❌ | ❌ |

**Role IDs:**
- `1`: Superadmin - Full access to all users
- `2`: Admin - Can manage Manager (3), Editor (4), Consultant (5)
- `3`: Manager - Can manage Editor (4), Consultant (5)
- `4`: Editor - No user management permissions
- `5`: Consultant - No user management permissions

---

## 🔗 API Endpoints

Base URL: `http://localhost:5000/api/users`

**Authentication Required:** All endpoints require `Bearer` token in Authorization header.

---

### 1. Get All Users

```http
GET /api/users
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "username": "superadmin", 
      "email": "superadmin@example.com",
      "role_id": 1,
      "role_name": "superadmin",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T10:00:00Z"
    }
  ],
  "total": 1
}
```

**RBAC Logic:**
- Users only see users they have permission to manage
- Always includes own profile
- Superadmin sees all users

---

### 2. Get Single User

```http
GET /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Admin User",
    "username": "admin",
    "email": "admin@example.com", 
    "role_id": 2,
    "role_name": "admin",
    "created_at": "2026-04-20T10:00:00Z",
    "updated_at": "2026-04-20T10:00:00Z"
  }
}
```

---

### 3. Create New User

```http
POST /api/users
```

**Body:**
```json
{
  "name": "New User",
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123", 
  "role_id": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 6,
    "name": "New User", 
    "username": "newuser",
    "email": "newuser@example.com",
    "role_id": 5,
    "role_name": "consultant",
    "created_at": "2026-04-20T10:30:00Z"
  }
}
```

**RBAC Logic:**
- Admin can create: Manager, Editor, Consultant
- Manager can create: Editor, Consultant
- Editor/Consultant: Access denied

**Validation:**
- All fields required
- Username must be unique
- Email must be unique
- Password is automatically hashed
- Role ID must exist and be allowed

---

### 4. Update User

```http
PUT /api/users/:id
```

**Body:** (All fields optional)
```json
{
  "name": "Updated Name",
  "username": "updatedusername", 
  "email": "updated@example.com",
  "role_id": 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully", 
  "data": {
    "id": 6,
    "name": "Updated Name",
    "username": "updatedusername", 
    "email": "updated@example.com",
    "role_id": 4,
    "role_name": "editor",
    "updated_at": "2026-04-20T11:00:00Z"
  }
}
```

**RBAC Logic:**
- Can only update users within permission scope
- Can update own profile (name, username, email only)
- Role change requires permission for both old and new role

---

### 5. Delete User

```http
DELETE /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**RBAC Logic:**
- Cannot delete own account
- Can only delete users within permission scope
- Permanent deletion (consider soft delete in production)

---

### 6. Get Available Roles

```http
GET /api/users/roles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "manager", 
      "description": "Quản lý người dùng và nội dung"
    },
    {
      "id": 4,
      "name": "editor",
      "description": "Biên tập nội dung" 
    },
    {
      "id": 5,
      "name": "consultant",
      "description": "Tư vấn và xử lý liên hệ"
    }
  ]
}
```

**Purpose:** Get list of roles current user can assign to new users

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "All fields are required (name, username, email, password, role_id)"
}
```

### 401 Unauthorized  
```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. You cannot create users with role ID 2."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false, 
  "message": "Username already exists"
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

## 🧪 Testing

### Manual Testing with curl

1. **Login to get token:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'
```

2. **Get all users:**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Create new user:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser", 
    "email": "test@example.com",
    "password": "password123",
    "role_id": 5
  }'
```

### Automated Testing

Run the test script:
```bash
cd backend
node test-users-api.js
```

---

## 🔐 Security Features

### Password Security
- Passwords hashed with bcrypt (salt rounds: 10)
- Plain passwords never stored
- No password returned in API responses

### JWT Authentication
- All endpoints require valid JWT token
- Token contains user ID and role information
- Automatic token expiration

### RBAC Implementation
- Fine-grained permission checking
- Role hierarchy enforcement  
- Users can only manage lower-privilege users
- Self-modification restrictions

### Input Validation
- Required field validation
- Unique constraints (username, email)
- Role existence validation
- SQL injection prevention (parameterized queries)

### Anti-Patterns Prevented
- Self-deletion protection
- Role escalation attacks
- Horizontal privilege escalation
- Mass assignment vulnerabilities

---

## 📊 Role Hierarchy Logic

```
Superadmin (1)
├── Can manage: All users [1,2,3,4,5]
├── Can create: All roles
└── Full system access

Admin (2)  
├── Can manage: [3,4,5] (Manager, Editor, Consultant)
├── Cannot manage: [1,2] (Superadmin, Admin)
└── Cannot create Superadmin or Admin accounts

Manager (3)
├── Can manage: [4,5] (Editor, Consultant) 
├── Cannot manage: [1,2,3] (Superadmin, Admin, Manager)
└── Limited to content team roles

Editor (4) / Consultant (5)
├── Can manage: [] (No user management)
├── Can view: Own profile only
└── Read-only access to user data
```

This RBAC system ensures secure user management with appropriate permission boundaries! 🛡️