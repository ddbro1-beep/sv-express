# SV Express API Documentation

Base URL: `https://sv-express-one.vercel.app/api` (Production)
Local: `http://localhost:3000/api` (Development)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Auth Endpoints

### Register
Create a new customer account.

**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Ivan",
  "lastName": "Ivanov",
  "phone": "+33753540436"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Ivan",
      "lastName": "Ivanov",
      "role": "customer"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Login
Authenticate user and get JWT token.

**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Refresh Token
Get a new JWT token using refresh token.

**POST** `/api/auth/refresh`

**Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

---

## Leads Endpoints

### Create Lead
Submit inquiry from landing page (public).

**POST** `/api/leads`

**Body:**
```json
{
  "name": "Ivan Petrov",
  "email": "ivan@example.com",
  "phone": "+33753540436",
  "originCountryId": 1,
  "destinationCountryId": 2,
  "weightEstimateKg": 5.5,
  "shipmentType": "package",
  "message": "I want to send clothes to Moscow"
}
```

**Response:** `201 Created`

### List Leads
Get all leads (admin only).

**GET** `/api/leads`

**Auth:** Required (admin)

**Query Parameters:**
- `status` (optional): Filter by status (new, contacted, converted, lost)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "leads": [...],
    "total": 45,
    "page": 1,
    "pages": 3
  }
}
```

### Update Lead
Update lead status or assign to admin.

**PUT** `/api/leads/:id`

**Auth:** Required (admin)

**Body:**
```json
{
  "status": "contacted",
  "assignedToAdminId": "admin_uuid"
}
```

### Convert Lead to Customer
Convert lead to registered customer.

**POST** `/api/leads/:id/convert`

**Auth:** Required (admin)

**Body:**
```json
{
  "password": "TempPass123!" // Temporary password for new customer
}
```

---

## Shipments Endpoints

### Create Shipment
Create a new shipment.

**POST** `/api/shipments`

**Auth:** Required

**Body:**
```json
{
  "shipmentType": "package",
  "weightKg": 8.5,
  "declaredValueEur": 150,
  "originCountryId": 1,
  "originAddress": "10 Rue de la Paix",
  "originCity": "Nice",
  "originPostalCode": "06000",
  "destinationCountryId": 2,
  "destinationAddress": "Литовский бульвар 15",
  "destinationCity": "Moscow",
  "destinationPostalCode": "117593",
  "recipientName": "Мария Петрова",
  "recipientPhone": "+79161234567"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "trackingNumber": "SV-2024-00142",
    "status": "created",
    "priceEur": 95
  }
}
```

### List Shipments
Get shipments (customers see only their own, admins see all).

**GET** `/api/shipments`

**Auth:** Required

**Query Parameters:**
- `status` (optional): Filter by status
- `customerId` (optional, admin only): Filter by customer
- `page`, `limit`: Pagination

**Response:** `200 OK`

### Get Shipment Details
Get full shipment information.

**GET** `/api/shipments/:id`

**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "trackingNumber": "SV-2024-00142",
    "customer": { ... },
    "origin": { ... },
    "destination": { ... },
    "status": "in_transit",
    "currentLocation": "Paris Hub",
    "estimatedDeliveryDate": "2024-12-20",
    "trackingEvents": [...]
  }
}
```

### Update Shipment
Update shipment details (admin only).

**PUT** `/api/shipments/:id`

**Auth:** Required (admin)

**Body:**
```json
{
  "status": "in_transit",
  "currentLocation": "Moscow Customs"
}
```

### Assign Admin to Shipment
Assign shipment to specific admin.

**PUT** `/api/shipments/:id/assign`

**Auth:** Required (admin)

**Body:**
```json
{
  "assignedAdminId": "admin_uuid"
}
```

### Add Tracking Number
Add or update tracking number.

**POST** `/api/shipments/:id/tracking`

**Auth:** Required (admin)

**Body:**
```json
{
  "trackingNumber": "SV-2024-00142"
}
```

---

## Tracking Endpoints

### Track Shipment
Track shipment by tracking number (public).

**GET** `/api/tracking/:trackingNumber`

**Example:** `/api/tracking/SV-2024-00142`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "trackingNumber": "SV-2024-00142",
    "status": "in_transit",
    "currentLocation": "Moscow Customs",
    "estimatedDelivery": "2024-12-20",
    "events": [
      {
        "id": "uuid",
        "status": "created",
        "location": "Nice, France",
        "description": "Shipment created",
        "eventDate": "2024-12-01T10:00:00Z"
      },
      {
        "id": "uuid",
        "status": "picked_up",
        "location": "Nice, France",
        "description": "Package picked up",
        "eventDate": "2024-12-02T14:30:00Z"
      }
    ]
  }
}
```

### Add Tracking Event
Add new tracking event (admin only).

**POST** `/api/tracking/:shipmentId/events`

**Auth:** Required (admin)

**Body:**
```json
{
  "status": "in_transit",
  "location": "Paris Hub",
  "description": "Package arrived at Paris sorting facility",
  "eventDate": "2024-12-05T08:15:00Z"
}
```

**Response:** `201 Created`

---

## Pricing Endpoints

### Calculate Price
Calculate shipping price (public).

**POST** `/api/pricing/calculate`

**Body:**
```json
{
  "shipmentType": "package",
  "weightKg": 8.5,
  "originCountryId": 1,
  "destinationCountryId": 2
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "basePrice": 95,
    "modifiers": {
      "weight": 0,
      "route": 1.0,
      "type": 1.0
    },
    "totalPrice": 95,
    "currency": "EUR"
  }
}
```

### Get Pricing Tiers
Get all pricing tiers.

**GET** `/api/pricing/tiers`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tiers": [
      {
        "id": 1,
        "name": "Documents",
        "weightMinKg": 0,
        "weightMaxKg": 0.5,
        "basePriceEur": 30,
        "shipmentType": "document"
      },
      {
        "id": 2,
        "name": "Small Package",
        "weightMinKg": 0.5,
        "weightMaxKg": 10,
        "basePriceEur": 95,
        "shipmentType": "package"
      }
    ]
  }
}
```

---

## Users Endpoints

### Get Current User
Get authenticated user profile.

**GET** `/api/users/me`

**Auth:** Required

**Response:** `200 OK`

### Update Profile
Update current user profile.

**PUT** `/api/users/me`

**Auth:** Required

**Body:**
```json
{
  "firstName": "Ivan",
  "lastName": "Petrov",
  "phone": "+33753540436"
}
```

### List Users
Get all users (admin only).

**GET** `/api/users`

**Auth:** Required (admin)

**Query Parameters:**
- `role` (optional): Filter by role (admin, customer)
- `page`, `limit`: Pagination

---

## Countries Endpoints

### List All Countries
Get all countries.

**GET** `/api/countries`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "countries": [
      {
        "id": 1,
        "code": "FR",
        "nameEn": "France",
        "nameRu": "Франция",
        "region": "eu",
        "isOrigin": true,
        "isDestination": false
      }
    ]
  }
}
```

### Get Origin Countries
Get countries where packages can be sent from.

**GET** `/api/countries/origins`

### Get Destination Countries
Get countries where packages can be sent to.

**GET** `/api/countries/destinations`

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Auth endpoints:** 5 requests per minute per IP
- **Public endpoints:** 30 requests per minute per IP
- **Authenticated endpoints:** 100 requests per minute per user

---

## Webhook Events (Future)

Coming soon: Webhook support for shipment status updates.

---

## Postman Collection

Import this URL to Postman for testing:
```
https://sv-express-one.vercel.app/api/postman-collection.json
```
