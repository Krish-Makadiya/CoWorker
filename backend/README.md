# Server for GIG Platform SIH 2026

Express.js + MongoDB backend for the SIH 2026 Gig Management Platform.

**Base URL:** `http://localhost:8000`

---

## Setup

```bash
npm install
cp .env.sample .env   # fill in your values
npm run dev
npm test              # run Jest sanity test suite
```

### Environment Variables

| Variable                | Description                       |
| ----------------------- | --------------------------------- |
| `PORT`                  | Server port (default `8000`)      |
| `MONGODB_USERNAME`      | MongoDB username                  |
| `MONGODB_PASSWORD`      | MongoDB password                  |
| `MONGODB_URI`           | MongoDB connection URI            |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for uploads |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret             |

---

## Data Models

### User

Base user record shared across all roles. Passwords are bcrypt-hashed before save.

| Field          | Type     | Required | Notes                                     |
| -------------- | -------- | -------- | ----------------------------------------- |
| `email`        | String   | ✅       | Unique                                    |
| `password`     | String   | ✅       | Hashed with bcrypt (salt rounds: 10)      |
| `name`         | String   | ✅       |                                           |
| `mobileNumber` | String   | ✅       |                                           |
| `roles`        | [String] |          | Enum: `worker`, `customer`, `cooperative` |
| `createdAt`    | Date     | auto     |                                           |
| `updatedAt`    | Date     | auto     |                                           |

### Cooperative

| Field                | Type     | Required | Notes                |
| -------------------- | -------- | -------- | -------------------- |
| `userId`             | ObjectId | ✅       | Ref → `User`, unique |
| `name`               | String   | ✅       |                      |
| `registrationNumber` | String   | ✅       | Unique               |
| `address.city`       | String   | ✅       |                      |
| `address.state`      | String   | ✅       |                      |
| `address.pinCode`    | String   | ✅       |                      |
| `createdAt`          | Date     | auto     |                      |
| `updatedAt`          | Date     | auto     |                      |

### Worker

| Field            | Type     | Required | Notes                                                      |
| ---------------- | -------- | -------- | ---------------------------------------------------------- |
| `userId`         | ObjectId | ✅       | Ref → `User`, unique                                       |
| `cooperativeId`  | ObjectId |          | Ref → `Cooperative`, default `null`                        |
| `skills`         | [String] |          | Default `[]`                                               |
| `experience`     | Number   |          | Min: `0`                                                   |
| `certifications` | [String] |          | Default `[]`                                               |
| `verification`   | String   |          | Enum: `pending`, `verified`, `rejected`. Default `pending` |
| `address`        | String   |          |                                                            |
| `rating`         | Number   |          | Min: `0`, Max: `5`, default `0`                            |
| `createdAt`      | Date     | auto     |                                                            |
| `updatedAt`      | Date     | auto     |                                                            |

### Customer

| Field                  | Type     | Required | Notes                   |
| ---------------------- | -------- | -------- | ----------------------- |
| `userId`               | ObjectId | ✅       | Ref → `User`, unique    |
| `address`              | String   | ✅       |                         |
| `location.type`        | String   | ✅       | Enum: `Point`           |
| `location.coordinates` | [Number] | ✅       | `[longitude, latitude]` |

> `location` has a `2dsphere` index for geospatial queries.

### ServiceRequest

| Field                  | Type     | Required | Notes                                                                             |
| ---------------------- | -------- | -------- | --------------------------------------------------------------------------------- |
| `customerId`           | ObjectId | ✅       | Ref → `Customer`                                                                  |
| `serviceId`            | ObjectId | ✅       | Ref → `Service`                                                                   |
| `workerId`             | ObjectId |          | Ref → `Worker`, default `null`                                                    |
| `title`                | String   | ✅       | Trimmed                                                                           |
| `description`          | String   | ✅       | Trimmed                                                                           |
| `address`              | String   | ✅       | Default: Customer's saved address                                                 |
| `location.type`        | String   | ✅       | Enum: `Point`                                                                     |
| `location.coordinates` | [Number] | ✅       | `[longitude, latitude]`, default: Customer's location                             |
| `scheduledAt`          | Date     | ✅       | Service appointment date & time                                                   |
| `preServicePhotos`     | [String] |          | Array of Cloudinary image URLs (before photos), default `[]`                      |
| `postServicePhotos`    | [String] |          | Array of Cloudinary image URLs (after photos), default `[]`                       |
| `status`               | String   |          | Enum: `open`, `accepted`, `in_progress`, `completed`, `cancelled`. Default `open` |
| `createdAt`            | Date     | auto     |                                                                                   |
| `updatedAt`            | Date     | auto     |                                                                                   |

> `location` has a `2dsphere` index for geospatial searching.

---

## Authentication & Authorization

Protected routes require the following header:

| Header    | Type     | Description                         |
| --------- | -------- | ----------------------------------- |
| `user-id` | ObjectId | The `_id` of the authenticated User |

- `authenticateUser` middleware looks up the user by this header. If not found, returns `401 Unauthorized`.
- `requireRole(...roles)` middleware checks if the user possesses any of the required roles. If not, returns `403 Forbidden`.

---

## Service Request Lifecycle & API Flow

```
[ Customer ] --- POST /api/service-requests/ --------------> (status: "open", workerId: null)
     |
     +--- (Optional) POST /api/service-requests/:id/pre-photos --> Upload Before Photos
     |
[ Worker ]   --- GET /api/service-requests/available --------> Browse Open Requests
     |
[ Worker ]   --- PATCH /api/service-requests/:id/accept -----> (status: "accepted", workerId: assigned)
     |
[ Worker ]   --- PATCH /api/service-requests/:id/start ------> (status: "in_progress")
     |
     +--- (Optional) POST /api/service-requests/:id/post-photos -> Upload After Photos
     |
[ Worker ]   --- PATCH /api/service-requests/:id/complete ----> (status: "completed")
```

### Lifecycle Steps with API Requests

1. **Creation (`open`)**:
   - Customer submits a service request via `POST /api/service-requests/`.
   - Validates `serviceId`, `scheduledAt`, `title`, `description`, and location/address (falling back to customer defaults if omitted).
   - Initial state: `status: "open"`, `workerId: null`, `preServicePhotos: []`, `postServicePhotos: []`.

2. **Pre-Service Photos (`pre-photos`)**:
   - Customer uploads initial before-service images via `POST /api/service-requests/:id/pre-photos`.
   - Multipart form-data images are handled via Multer and uploaded to Cloudinary, with returned URLs saved in `preServicePhotos`.

3. **Job Discovery & Acceptance (`accepted`)**:
   - Workers view open requests via `GET /api/service-requests/available`.
   - A worker accepts an open request via `PATCH /api/service-requests/:id/accept`.
   - The worker is assigned (`workerId = worker._id`), and status transitions from `"open"` to `"accepted"`.

4. **Service Execution (`in_progress`)**:
   - The assigned worker starts the job via `PATCH /api/service-requests/:id/start`.
   - Status transitions from `"accepted"` to `"in_progress"`.

5. **Post-Service Photos (`post-photos`)**:
   - The worker uploads proof-of-work images via `POST /api/service-requests/:id/post-photos`.
   - Images are uploaded to Cloudinary and added to `postServicePhotos`.

6. **Job Completion (`completed`)**:
   - The worker completes the job via `PATCH /api/service-requests/:id/complete`.
   - Status transitions from `"in_progress"` to `"completed"`.

7. **Cancellation (`cancelled`)**:
   - Customer can cancel their request via `PATCH /api/service-requests/:id/cancel` at any point prior to completion.
   - Requests in `"completed"` or `"cancelled"` state cannot be cancelled.

---

## API Endpoints

### Health Check

#### `GET /health`

Returns server status.

**Response `200`**

```json
{
  "status": "ok"
}
```

---

### Cooperative

#### `POST /cooperative/register`

Register a new cooperative.

**Request Body**

```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "mobileNumber": "string",
  "registrationNumber": "string",
  "address": {
    "city": "string",
    "state": "string",
    "pinCode": "string"
  }
}
```

**Response `201`**

```json
{
  "message": "Cooperative registered successfully",
  "cooperative": {
    "_id": "ObjectId",
    "userId": "ObjectId",
    "name": "string",
    "registrationNumber": "string",
    "address": {
      "city": "string",
      "state": "string",
      "pinCode": "string"
    },
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

#### `POST /cooperative/login`

Login as a cooperative.

**Request Body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response `200`**

```json
{
  "message": "Login successful",
  "user": {/* User object */}
}
```

---

#### `GET /cooperative/`

List all cooperatives.

**Response `200`**

```json
{
  "success": true,
  "cooperatives": [/* Array of Cooperative objects */]
}
```

---

#### `GET /cooperative/names`

Get all cooperatives ID (`_id`) and name (`name`) without authentication.

🔓 **Public** — no authentication required.

**Response `200`**

```json
{
  "success": true,
  "cooperatives": [
    {
      "_id": "ObjectId",
      "name": "string"
    }
  ]
}
```

---

### Worker

#### `POST /worker/register`

Register a new worker.

**Request Body**

```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "mobileNumber": "string",
  "cooperativeId": "ObjectId | null",
  "skills": ["string"],
  "experience": 0,
  "certifications": ["string"],
  "address": "string"
}
```

**Response `201`**

```json
{
  "message": "Worker registered successfully",
  "worker": {
    "_id": "ObjectId",
    "userId": "ObjectId",
    "cooperativeId": "ObjectId | null",
    "skills": ["string"],
    "experience": 0,
    "certifications": ["string"],
    "verification": "pending",
    "address": "string",
    "rating": 0,
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

#### `POST /worker/login`

Login as a worker.

**Request Body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response `200`**

```json
{
  "message": "Login successful",
  "user": {/* User object */}
}
```

---

#### `GET /worker/`

List workers belonging to the authenticated cooperative.

🔒 **Protected** — requires `user-id` header + `cooperative` role.

**Response `200`**

```json
{
  "success": true,
  "workers": [/* Array of Worker objects */]
}
```

---

#### `GET /worker/:id`

Get worker details by Worker `_id` or User `userId`.

🔒 **Protected** — requires `user-id` header + `worker` or `cooperative` role.

> **Access Control**: A Worker can ONLY view their own profile. A Cooperative can ONLY view workers registered under their cooperative.

**URL Parameters**

| Param | Type     | Description                                      |
| ----- | -------- | ------------------------------------------------ |
| `id`  | ObjectId | The `_id` of the Worker or the Worker's `userId` |

**Response `200`**

```json
{
  "success": true,
  "worker": {
    "_id": "ObjectId",
    "userId": {
      "_id": "ObjectId",
      "name": "string",
      "email": "string",
      "mobileNumber": "string"
    },
    "cooperativeId": {
      "_id": "ObjectId",
      "name": "string"
    },
    "skills": ["string"],
    "experience": 0,
    "certifications": ["string"],
    "verification": "verified",
    "address": "string",
    "rating": 0,
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error `403`**

```json
{
  "success": false,
  "message": "Access denied: You are not authorized to view this worker's profile"
}
```

---

#### `POST /worker/register-by-cooperative`

Register a worker directly under the authenticated cooperative (automatically verified).

🔒 **Protected** — requires `user-id` header + `cooperative` role.

---

#### `PUT /worker/:id`

Update a worker belonging to the authenticated cooperative.

🔒 **Protected** — requires `user-id` header + `cooperative` role.

---

#### `DELETE /worker/:id`

Delete a worker belonging to the authenticated cooperative.

🔒 **Protected** — requires `user-id` header + `cooperative` role.

---

#### `PATCH /worker/:id/verify`

Update verification status of a worker.

🔒 **Protected** — requires `user-id` header + `cooperative` role.

---

### Customer

#### `POST /customer/register`

Register a new customer.

---

#### `POST /customer/login`

Login as a customer.

---

### Service Requests (`/api/service-requests`)

#### Authorized Roles Table

| Endpoint           | Method  | Authorized Roles    | Description                                            |
| ------------------ | ------- | ------------------- | ------------------------------------------------------ |
| `/`                | `POST`  | Customer            | Create service request (`status: "open"`)              |
| `/my`              | `GET`   | Customer            | Get customer's requests                                |
| `/available`       | `GET`   | Worker              | Get open requests available for workers                |
| `/:id`             | `GET`   | Customer*/ Worker* | Get request details (owner or assigned worker)         |
| `/:id/pre-photos`  | `POST`  | Customer            | Upload before-service photos                           |
| `/:id/post-photos` | `POST`  | Worker              | Upload after-service photos                            |
| `/:id/accept`      | `PATCH` | Worker              | Worker accepts request (`open` ➔ `accepted`)           |
| `/:id/start`       | `PATCH` | Worker              | Worker starts service (`accepted` ➔ `in_progress`)     |
| `/:id/complete`    | `PATCH` | Worker              | Worker completes service (`in_progress` ➔ `completed`) |
| `/:id/cancel`      | `PATCH` | Customer            | Customer cancels request                               |

---

#### `POST /api/service-requests/`

Create a new service request.

🔒 **Protected** — requires `user-id` header + `customer` role.

**Request Body**

```json
{
  "serviceId": "ObjectId",
  "title": "Leaking Pipe Repair",
  "description": "Fix main kitchen sink pipe leak",
  "scheduledAt": "2026-09-15T10:00:00.000Z",
  "address": "123 Main St, City (optional, defaults to customer address)",
  "location": {
    "type": "Point",
    "coordinates": [77.5946, 12.9716]
  }
}
```

**Response `201`**

```json
{
  "success": true,
  "message": "Service request created successfully",
  "serviceRequest": {
    "_id": "ObjectId",
    "customerId": "ObjectId",
    "serviceId": "ObjectId",
    "workerId": null,
    "title": "Leaking Pipe Repair",
    "description": "Fix main kitchen sink pipe leak",
    "address": "123 Main St, City",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716]
    },
    "scheduledAt": "2026-09-15T10:00:00.000Z",
    "preServicePhotos": [],
    "postServicePhotos": [],
    "status": "open",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

#### `GET /api/service-requests/my`

Get all service requests created by the authenticated customer.

🔒 **Protected** — requires `user-id` header + `customer` role.

**Response `200`**

```json
{
  "success": true,
  "serviceRequests": [/* Array of ServiceRequest objects */]
}
```

---

#### `GET /api/service-requests/available`

Get all open service requests available for workers.

🔒 **Protected** — requires `user-id` header + `worker` role.

**Response `200`**

```json
{
  "success": true,
  "serviceRequests": [/* Array of open ServiceRequest objects */]
}
```

---

#### `GET /api/service-requests/worker/:id/ongoing`

Get currently ongoing service requests (`accepted`, `in_progress`) for a worker by Worker `_id` or User `userId`.

🔒 **Protected** — requires `user-id` header + `worker` or `cooperative` role.

> **Access Control**: A Worker can view their own ongoing services. A Cooperative can view ongoing services of workers under their cooperative.

**URL Parameters**

| Param | Type     | Description                                      |
| ----- | -------- | ------------------------------------------------ |
| `id`  | ObjectId | The `_id` of the Worker or the Worker's `userId` |

**Response `200`**

```json
{
  "success": true,
  "count": 1,
  "ongoingServices": [/* Array of ongoing ServiceRequest objects */]
}
```

---

#### `GET /api/service-requests/worker/:id/previous`

Get past/previous service requests (`completed`, `cancelled`) for a worker by Worker `_id` or User `userId`.

🔒 **Protected** — requires `user-id` header + `worker` or `cooperative` role.

> **Access Control**: A Worker can view their own previous services. A Cooperative can view previous services of workers under their cooperative.

**URL Parameters**

| Param | Type     | Description                                      |
| ----- | -------- | ------------------------------------------------ |
| `id`  | ObjectId | The `_id` of the Worker or the Worker's `userId` |

**Response `200`**

```json
{
  "success": true,
  "count": 2,
  "previousServices": [/* Array of completed/cancelled ServiceRequest objects */]
}
```

---

#### `GET /api/service-requests/:id`

Get service request details by ID.

🔒 **Protected** — requires `user-id` header + `customer` or `worker` role.

> **Access Control**: A Customer can view requests they own. A Worker can view any request with status `"open"`, or any request assigned to them (`workerId`).

**URL Parameters**

| Param | Type     | Description                     |
| ----- | -------- | ------------------------------- |
| `id`  | ObjectId | The `_id` of the ServiceRequest |

**Response `200`**

```json
{
  "success": true,
  "serviceRequest": {/* Populated ServiceRequest object */}
}
```

---

#### `POST /api/service-requests/:id/pre-photos`

Upload before-service photos.

🔒 **Protected** — requires `user-id` header + `customer` role.

**Content-Type**: `multipart/form-data`

| Field    | Type    | Description                           |
| -------- | ------- | ------------------------------------- |
| `photos` | File(s) | Image file(s) to upload to Cloudinary |

**Response `200`**

```json
{
  "success": true,
  "message": "Pre-service photos uploaded successfully",
  "serviceRequest": {/* Updated ServiceRequest object */}
}
```

---

#### `POST /api/service-requests/:id/post-photos`

Upload after-service photos.

🔒 **Protected** — requires `user-id` header + `worker` role (must be assigned worker).

**Content-Type**: `multipart/form-data`

| Field    | Type    | Description                           |
| -------- | ------- | ------------------------------------- |
| `photos` | File(s) | Image file(s) to upload to Cloudinary |

**Response `200`**

```json
{
  "success": true,
  "message": "Post-service photos uploaded successfully",
  "serviceRequest": {/* Updated ServiceRequest object */}
}
```

---

#### `PATCH /api/service-requests/:id/accept`

Worker accepts an open service request (`open` ➔ `accepted`).

🔒 **Protected** — requires `user-id` header + `worker` role.

**Response `200`**

```json
{
  "success": true,
  "message": "Service request accepted successfully",
  "serviceRequest": {/* Updated ServiceRequest object */}
}
```

---

#### `PATCH /api/service-requests/:id/start`

Worker starts the service (`accepted` ➔ `in_progress`).

🔒 **Protected** — requires `user-id` header + `worker` role (must be assigned worker).

**Response `200`**

```json
{
  "success": true,
  "message": "Service request started successfully",
  "serviceRequest": {/* Updated ServiceRequest object */}
}
```

---

#### `PATCH /api/service-requests/:id/complete`

Worker completes the service (`in_progress` ➔ `completed`).

🔒 **Protected** — requires `user-id` header + `worker` role (must be assigned worker).

**Response `200`**

```json
{
  "success": true,
  "message": "Service request completed successfully",
  "serviceRequest": {/* Updated ServiceRequest object */}
}
```

---

#### `PATCH /api/service-requests/:id/cancel`

Customer cancels the service request (`open`/`accepted`/`in_progress` ➔ `cancelled`).

🔒 **Protected** — requires `user-id` header + `customer` role (must be request owner).

**Response `200`**

```json
{
  "success": true,
  "message": "Service request cancelled successfully",
  "serviceRequest": {/* Updated ServiceRequest object */}
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

| Status Code | Meaning                            |
| ----------- | ---------------------------------- |
| `401`       | Invalid credentials / Unauthorized |
| `403`       | Missing required role / Forbidden  |
| `404`       | Resource not found                 |
| `500`       | Internal server error              |

---

## Endpoint Summary Table

| Method   | Endpoint                                | Authorized Roles     | Description                                       |
| -------- | --------------------------------------- | -------------------- | ------------------------------------------------- |
| `GET`    | `/health`                               | Public               | Health check                                      |
| `GET`    | `/cooperative/`                         | Public               | List all cooperatives                             |
| `GET`    | `/cooperative/names`                    | Public               | Get all cooperative IDs and names                 |
| `POST`   | `/cooperative/register`                 | Public               | Register a cooperative                            |
| `POST`   | `/cooperative/login`                    | Public               | Login as cooperative                              |
| `GET`    | `/worker/`                              | Cooperative          | List cooperative's workers 🔒                     |
| `GET`    | `/worker/:id`                           | Worker / Cooperative | Get worker details by worker ID or user ID (owner/coop only) 🔒 |
| `POST`   | `/worker/register`                      | Public               | Register a worker                                 |
| `POST`   | `/worker/login`                         | Public               | Login as worker                                   |
| `PUT`    | `/worker/:id`                           | Cooperative          | Update a worker 🔒                                |
| `DELETE` | `/worker/:id`                           | Cooperative          | Delete a worker 🔒                                |
| `PATCH`  | `/worker/:id/verify`                    | Cooperative          | Verify a worker 🔒                                |
| `POST`   | `/worker/register-by-cooperative`       | Cooperative          | Register worker under cooperative 🔒              |
| `POST`   | `/customer/register`                    | Public               | Register a customer                               |
| `POST`   | `/customer/login`                       | Public               | Login as customer                                 |
| `POST`   | `/api/service-requests/`                | Customer             | Create service request 🔒                         |
| `GET`    | `/api/service-requests/my`              | Customer             | Get customer's requests 🔒                        |
| `GET`    | `/api/service-requests/available`       | Worker               | Get open requests available for workers 🔒        |
| `GET`    | `/api/service-requests/worker/:id/ongoing` | Worker / Cooperative | Get ongoing services by worker ID or user ID 🔒   |
| `GET`    | `/api/service-requests/worker/:id/previous` | Worker / Cooperative | Get previous services by worker ID or user ID 🔒  |
| `GET`    | `/api/service-requests/:id`             | Customer / Worker    | Get request details (owner or assigned worker) 🔒 |
| `POST`   | `/api/service-requests/:id/pre-photos`  | Customer             | Upload before-service photos 🔒                   |
| `POST`   | `/api/service-requests/:id/post-photos` | Worker               | Upload after-service photos 🔒                    |
| `PATCH`  | `/api/service-requests/:id/accept`      | Worker               | Accept open service request 🔒                    |
| `PATCH`  | `/api/service-requests/:id/start`       | Worker               | Start service 🔒                                  |
| `PATCH`  | `/api/service-requests/:id/complete`    | Worker               | Complete service 🔒                               |
| `PATCH`  | `/api/service-requests/:id/cancel`      | Customer             | Cancel service request 🔒                         |
