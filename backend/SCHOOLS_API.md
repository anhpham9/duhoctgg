# Schools API Documentation

## Overview

The Schools API provides comprehensive management for Japanese school information including schools, regions, school types, FAQs, and student reviews. This system supports the complete lifecycle of school data management with proper RBAC (Role-Based Access Control) enforcement.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Schools API](#schools-api)
3. [Regions API](#regions-api)
4. [School Types API](#school-types-api)
5. [FAQs API](#faqs-api)
6. [School Reviews API](#school-reviews-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Testing](#testing)
10. [Seeding Data](#seeding-data)

## Authentication & Authorization

### Role-Based Access Control (RBAC)

| Role | ID | Schools | Regions | Types | FAQs | Reviews | Delete Schools |
|------|----|---------|---------}-------|------|---------|----------------|
| Superadmin | 1 | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Yes |
| Admin | 2 | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ❌ No |
| Manager | 3 | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ❌ No |
| Editor | 4 | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ No |
| Consultant | 5 | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ No |

### Authentication Required

All endpoints require valid JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Schools API

### Base URL
```
/api/schools
```

### 1. Get All Schools

**Endpoint:** `GET /api/schools`

**Query Parameters:**
- `status` - Filter by status (`active`, `inactive`)
- `region_id` - Filter by region ID
- `type_id` - Filter by school type ID
- `search` - Search in name and location
- `min_rating` - Filter by minimum rating
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

**Example Request:**
```bash
curl -X GET "/api/schools?status=active&region_id=1&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tokyo International Language Academy",
      "slug": "tokyo-international-language-academy",
      "location": "Shibuya, Tokyo, Japan",
      "tuition_per_year": 800000,
      "class_size": 12,
      "visa_success_rate": 95,
      "features": {
        "dormitory": true,
        "part_time_job": true,
        "university_preparation": true
      },
      "region_id": 1,
      "type_id": 1,
      "status": "active",
      "logo_url": "https://example.com/logo.png",
      "thumbnail_url": "https://example.com/thumb.png",
      "rating": 4.5,
      "review_count": 12,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "region_name": "Tokyo",
      "type_name": "Language School"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 50,
    "per_page": 10
  }
}
```

### 2. Get School by ID

**Endpoint:** `GET /api/schools/:id`

**Example Request:**
```bash
curl -X GET "/api/schools/1" \
  -H "Authorization: Bearer <token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tokyo International Language Academy",
    "slug": "tokyo-international-language-academy",
    "location": "Shibuya, Tokyo, Japan",
    "tuition_per_year": 800000,
    "class_size": 12,
    "visa_success_rate": 95,
    "features": {
      "dormitory": true,
      "part_time_job": true,
      "university_preparation": true
    },
    "region_id": 1,
    "type_id": 1,
    "status": "active",
    "logo_url": "https://example.com/logo.png",
    "thumbnail_url": "https://example.com/thumb.png",
    "rating": 4.5,
    "review_count": 12,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "region_name": "Tokyo",
    "type_name": "Language School",
    "reviews": [
      {
        "id": 1,
        "student_name": "John Doe",
        "nationality": "American",
        "rating": 5,
        "content": "Excellent school!"
      }
    ]
  }
}
```

### 3. Create School

**Endpoint:** `POST /api/schools`

**Required Fields:**
- `name` (string, max 200 chars)
- `region_id` (integer, must exist in regions table)
- `type_id` (integer, must exist in school_types table)

**Optional Fields:**
- `slug` (string, auto-generated if not provided)
- `location` (string, max 500 chars)
- `tuition_per_year` (integer, 0-10,000,000)
- `class_size` (integer, 1-200)
- `visa_success_rate` (integer, 0-100)
- `features` (JSON object)
- `status` (string: `active`, `inactive`, default: `active`)
- `logo_url` (valid URL)
- `thumbnail_url` (valid URL)

**Example Request:**
```bash
curl -X POST "/api/schools" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Language School",
    "location": "Shibuya, Tokyo",
    "tuition_per_year": 750000,
    "class_size": 15,
    "visa_success_rate": 92,
    "features": {
      "dormitory": true,
      "part_time_job": true
    },
    "region_id": 1,
    "type_id": 1,
    "status": "active"
  }'
```

### 4. Update School

**Endpoint:** `PUT /api/schools/:id`

**Example Request:**
```bash
curl -X PUT "/api/schools/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated School Name",
    "tuition_per_year": 850000
  }'
```

### 5. Delete School

**Endpoint:** `DELETE /api/schools/:id`

**⚠️ Superadmin Only**

**Example Request:**
```bash
curl -X DELETE "/api/schools/1" \
  -H "Authorization: Bearer <token>"
```

### 6. Get Schools Statistics

**Endpoint:** `GET /api/schools/stats`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "total_schools": 50,
    "active_schools": 45,
    "inactive_schools": 5,
    "average_tuition": 950000,
    "average_rating": 4.3,
    "schools_by_region": [
      {"region_name": "Tokyo", "count": 15},
      {"region_name": "Osaka", "count": 10}
    ],
    "schools_by_type": [
      {"type_name": "Language School", "count": 20},
      {"type_name": "University", "count": 15}
    ]
  }
}
```

## Regions API

### Base URL
```
/api/regions
```

### Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/regions` | List all regions | Admin+ |
| GET | `/regions/:id` | Get region by ID | Admin+ |
| POST | `/regions` | Create region | Admin+ |
| PUT | `/regions/:id` | Update region | Admin+ |
| DELETE | `/regions/:id` | Delete region | Admin+ |

### Region Object Structure
```json
{
  "id": 1,
  "name": "Tokyo",
  "slug": "tokyo",
  "schools_count": 15,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## School Types API

### Base URL
```
/api/school-types
```

### Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/school-types` | List all school types | Admin+ |
| GET | `/school-types/:id` | Get school type by ID | Admin+ |
| POST | `/school-types` | Create school type | Admin+ |
| PUT | `/school-types/:id` | Update school type | Admin+ |
| DELETE | `/school-types/:id` | Delete school type | Admin+ |

### School Type Object Structure
```json
{
  "id": 1,
  "name": "Language School",
  "slug": "language-school",
  "schools_count": 20,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## FAQs API

### Base URL
```
/api/faqs
```

### Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/faqs` | List FAQs | Admin+ |
| GET | `/faqs/:id` | Get FAQ by ID | Admin+ |
| POST | `/faqs` | Create FAQ | Admin+ |
| PUT | `/faqs/:id` | Update FAQ | Admin+ |
| DELETE | `/faqs/:id` | Delete FAQ | Admin+ |

### FAQ Object Structure
```json
{
  "id": 1,
  "question": "What are the admission requirements?",
  "answer": "You need to have completed high school...",
  "type": "school",
  "school_id": 1,
  "school_name": "Tokyo International Language Academy",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### FAQ Types
- `school` - School-specific FAQ (requires `school_id`)
- `general` - General FAQ (no `school_id` required)

## School Reviews API

### Base URL
```
/api/school-reviews
```

### Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/school-reviews` | List reviews | Admin+ |
| GET | `/school-reviews/:id` | Get review by ID | Admin+ |
| POST | `/school-reviews` | Create review | Admin+ |
| PUT | `/school-reviews/:id` | Update review | Admin+ |
| DELETE | `/school-reviews/:id` | Delete review | Admin+ |

### School Review Object Structure
```json
{
  "id": 1,
  "school_id": 1,
  "student_name": "John Doe",
  "avatar_url": "https://example.com/avatar.png",
  "nationality": "American",
  "course_period": "2 years",
  "rating": 5,
  "content": "Excellent school with great teachers!",
  "school_name": "Tokyo International Language Academy",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Rating System
- Rating range: 1-5 (integer)
- Automatically updates school's average rating
- Updates school's review count

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting

### Rate Limits by Endpoint

| Endpoint | Window | Limit | Notes |
|----------|--------|-------|-------|
| `/schools/*` | 15 min | 150 req | Higher limit for frequent access |
| `/regions/*` | 15 min | 50 req | Lower limit for admin data |
| `/school-types/*` | 15 min | 50 req | Lower limit for admin data |
| `/faqs/*` | 15 min | 100 req | Standard limit |
| `/school-reviews/*` | 15 min | 100 req | Standard limit |

### Rate Limit Headers
```
X-RateLimit-Limit: 150
X-RateLimit-Remaining: 149
X-RateLimit-Reset: 1640995200
```

## Testing

### Running Tests

```bash
# Run the comprehensive test suite
node test-schools-api.js
```

### Test Coverage

The test suite covers:
- ✅ RBAC enforcement for all roles
- ✅ Input validation and sanitization
- ✅ Foreign key constraints
- ✅ Error handling
- ✅ Rate limiting compliance
- ✅ XSS prevention
- ✅ Data relationships
- ✅ CRUD operations for all modules

### Test Results Example

```
🧪 Starting test suite: Schools API Tests
✓ Create school with valid data - PASSED (245ms)
✓ Get schools with filters - PASSED (123ms)
✓ Update school with partial data - PASSED (187ms)
✓ Deny delete for non-superadmin - PASSED (156ms)

📊 TEST SUMMARY
Total Tests: 25
Passed: 25
Failed: 0
Success Rate: 100.00%
```

## Seeding Data

### Available Seeds

```bash
# Seed regions (Tokyo, Osaka, Kyoto, etc.)
node scripts/seeds/seedRegions.js

# Seed school types (Language School, University, etc.)
node scripts/seeds/seedSchoolTypes.js

# Seed sample schools (requires regions and types)
node scripts/seeds/seedSchools.js
```

### Seed Data Included

#### Regions (10 entries)
- Tokyo, Osaka, Kyoto, Yokohama, Kobe, Nagoya, Fukuoka, Sendai, Sapporo, Hiroshima

#### School Types (10 entries)
- Language School, Vocational School, University, Junior College, Graduate School, International School, Business School, Technical College, Art School, Cooking School

#### Sample Schools (5 entries)
- Tokyo International Language Academy
- Osaka Culinary Institute  
- Kyoto Traditional Arts University
- Yokohama Business College
- Nagoya Technical Institute

## Security Features

### Input Sanitization
- XSS prevention using `xss` library
- SQL injection prevention
- Input length validation
- URL format validation
- JSONB data sanitization

### Audit Logging
- All CRUD operations logged
- User identification in logs
- IP address tracking
- Request metadata capture

### Security Headers
- Helmet.js integration
- CORS configuration
- Content Security Policy

## Database Schema

### Schools Table Structure
```sql
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  location TEXT,
  tuition_per_year INTEGER,
  class_size INTEGER,
  visa_success_rate INTEGER,
  features JSONB,
  region_id INTEGER REFERENCES regions(id),
  type_id INTEGER REFERENCES school_types(id),
  status VARCHAR(20) DEFAULT 'active',
  logo_url TEXT,
  thumbnail_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships
- `schools.region_id` → `regions.id`
- `schools.type_id` → `school_types.id`
- `faqs.school_id` → `schools.id` (optional)
- `school_reviews.school_id` → `schools.id`

## Performance Considerations

### Indexing
- Primary keys on all tables
- Unique indexes on slug fields
- Foreign key indexes for joins
- Composite indexes for common queries

### Caching Opportunities
- School statistics (updated hourly)
- Popular schools list
- Regions and types (updated rarely)

### Pagination
- All list endpoints support pagination
- Default limit: 10 items
- Maximum limit: 100 items

## API Changelog

### v1.0.0 (Initial Release)
- Complete Schools module implementation
- RBAC with superadmin-only deletion
- Comprehensive input validation
- Rate limiting per endpoint
- Audit logging for all operations
- Full test suite coverage