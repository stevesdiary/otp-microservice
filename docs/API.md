# OTP Microservice API Documentation

Complete API reference for the OTP (One-Time Password) Microservice - a secure, scalable solution for generating and verifying OTPs via Email and SMS.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Health Checks](#health-checks)
  - [OTP Operations](#otp-operations)
- [Error Handling](#error-handling)
- [Testing with Postman](#testing-with-postman)
- [Code Examples](#code-examples)

---

## 🌐 Overview

The OTP Microservice provides a robust API for:
- **Generating OTPs** via Email (Brevo/SendInBlue) or SMS (Twilio)
- **Verifying OTPs** with automatic expiration and attempt tracking
- **Monitoring OTP status** for debugging and auditing
- **Health checks** for service monitoring and orchestration

### Key Features
- ✅ Multi-channel delivery (Email & SMS)
- ✅ Configurable OTP length and expiration
- ✅ Rate limiting and security middleware
- ✅ Comprehensive validation with class-validator
- ✅ MongoDB persistence with Redis caching
- ✅ Structured logging with Winston
- ✅ Docker support with docker-compose

---

## 🔐 Authentication

All OTP operation endpoints require client authentication using a secret key.

### Header
```
x-client-secret: your-client-secret-key
```

### Configuration
Set your client secret in the `.env` file:
```bash
CLIENT_SECRET_KEY=your-secure-secret-key-here
```

> **Note:** Health check endpoints are public and do not require authentication.

---

## 🌍 Base URL

### Development
```
http://localhost:3000
```

### Production
```
https://your-domain.com
```

All endpoints are prefixed with `/api/v1`

---

## ⏱️ Rate Limiting

Default rate limits (configurable via environment variables):
- **Window:** 15 minutes (900,000 ms)
- **Max Requests:** 100 requests per window

Configure in `.env`:
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📡 Endpoints

### Health Checks

#### 1. Basic Health Check
Check if the service is running.

**Endpoint:** `GET /api/v1/health`  
**Authentication:** None  
**Rate Limit:** Not applied

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2025-11-20T17:21:25.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

---

#### 2. Detailed Health Check
Check service health including all dependencies.

**Endpoint:** `GET /api/v1/health/detailed`  
**Authentication:** None  
**Rate Limit:** Not applied

**Response (200 OK - All Healthy):**
```json
{
  "status": "OK",
  "timestamp": "2025-11-20T17:21:25.000Z",
  "uptime": 123.456,
  "environment": "development",
  "services": {
    "mongodb": "connected",
    "redis": "connected"
  },
  "memory": {
    "rss": "45MB",
    "heapTotal": "20MB",
    "heapUsed": "15MB"
  }
}
```

**Response (503 Service Unavailable - Degraded):**
```json
{
  "status": "DEGRADED",
  "timestamp": "2025-11-20T17:21:25.000Z",
  "uptime": 123.456,
  "environment": "development",
  "services": {
    "mongodb": "connected",
    "redis": "disconnected"
  },
  "memory": {
    "rss": "45MB",
    "heapTotal": "20MB",
    "heapUsed": "15MB"
  }
}
```

---

#### 3. Readiness Check
Kubernetes readiness probe endpoint.

**Endpoint:** `GET /api/v1/health/ready`  
**Authentication:** None  
**Rate Limit:** Not applied

**Response (200 OK):**
```json
{
  "status": "READY"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "NOT_READY",
  "mongodb": false,
  "redis": true
}
```

---

#### 4. Liveness Check
Kubernetes liveness probe endpoint.

**Endpoint:** `GET /api/v1/health/live`  
**Authentication:** None  
**Rate Limit:** Not applied

**Response (200 OK):**
```json
{
  "status": "ALIVE"
}
```

---

### OTP Operations

#### 1. Generate OTP
Generate and send an OTP to a recipient via Email or SMS.

**Endpoint:** `POST /api/v1/otp/generate`  
**Authentication:** Required (`x-client-secret`)  
**Rate Limit:** Applied

**Request Headers:**
```
Content-Type: application/json
x-client-secret: your-client-secret-key
```

**Request Body (Email):**
```json
{
  "recipient": "user@example.com",
  "type": "email",
  "subject": "Your Verification Code"
}
```

**Request Body (SMS):**
```json
{
  "recipient": "+1234567890",
  "type": "sms"
}
```

**Validation Rules:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `recipient` | string | Yes | Valid email (if type=email) or phone number (if type=sms) |
| `type` | string | Yes | Must be `"email"` or `"sms"` |
| `subject` | string | No | Optional email subject (only for email type) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "verificationId": "507f1f77bcf86cd799439011",
    "expiresAt": "2025-11-20T17:26:25.000Z"
  }
}
```

**Response Fields:**
- `verificationId`: Unique identifier for this OTP verification (use this to verify the OTP)
- `expiresAt`: ISO 8601 timestamp when the OTP expires

---

#### 2. Verify OTP
Verify an OTP code against a verification ID.

**Endpoint:** `POST /api/v1/otp/verify`  
**Authentication:** Required (`x-client-secret`)  
**Rate Limit:** Applied

**Request Headers:**
```
Content-Type: application/json
x-client-secret: your-client-secret-key
```

**Request Body:**
```json
{
  "verificationId": "507f1f77bcf86cd799439011",
  "otp": "123456"
}
```

**Validation Rules:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `verificationId` | string | Yes | Valid MongoDB ObjectId |
| `otp` | string | Yes | 4-10 digits, numbers only |

**Response (200 OK - Valid OTP):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "verified": true
  }
}
```

**Response (400 Bad Request - Invalid OTP):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

**Response (404 Not Found - Invalid Verification ID):**
```json
{
  "success": false,
  "message": "Verification ID not found"
}
```

---

#### 3. Get OTP Status
Retrieve the current status of an OTP verification (for debugging/monitoring).

**Endpoint:** `GET /api/v1/otp/status/:verificationId`  
**Authentication:** Required (`x-client-secret`)  
**Rate Limit:** Applied

**Request Headers:**
```
x-client-secret: your-client-secret-key
```

**URL Parameters:**
- `verificationId`: The verification ID returned from the generate endpoint

**Example:**
```
GET /api/v1/otp/status/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "verificationId": "507f1f77bcf86cd799439011",
    "recipient": "user@example.com",
    "type": "email",
    "verified": false,
    "attempts": 2,
    "expiresAt": "2025-11-20T17:26:25.000Z",
    "createdAt": "2025-11-20T17:21:25.000Z"
  }
}
```

**Response Fields:**
- `verificationId`: Unique identifier
- `recipient`: Email or phone number (partially masked for security)
- `type`: `"email"` or `"sms"`
- `verified`: Boolean indicating if OTP was successfully verified
- `attempts`: Number of verification attempts made
- `expiresAt`: When the OTP expires
- `createdAt`: When the OTP was generated

---

## ❌ Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "recipient",
      "message": "Invalid email address"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Validation error or invalid input |
| 401 | Unauthorized | Missing or invalid client secret |
| 404 | Not Found | Resource not found (e.g., invalid verification ID) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service degraded (dependencies down) |

### Common Error Scenarios

#### 1. Missing Authentication
**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"recipient": "user@example.com", "type": "email"}'
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Client secret is required"
}
```

---

#### 2. Invalid Email Format
**Request:**
```json
{
  "recipient": "invalid-email",
  "type": "email"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "emailValidation",
      "message": "Invalid email address"
    }
  ]
}
```

---

#### 3. Invalid OTP Format
**Request:**
```json
{
  "verificationId": "507f1f77bcf86cd799439011",
  "otp": "abc123"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "otp",
      "message": "OTP must contain only numbers"
    }
  ]
}
```

---

#### 4. Rate Limit Exceeded
**Response (429 Too Many Requests):**
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## 🧪 Testing with Postman

### Import Collection
1. Open Postman
2. Click **Import**
3. Select `postman/OTP-Microservice.postman_collection.json`
4. Import the environment file: `postman/OTP-Microservice.postman_environment.json`

### Configure Environment
1. Select the **OTP Microservice - Development** environment
2. Update the `CLIENT_SECRET` variable with your actual secret from `.env`
3. The `BASE_URL` is pre-configured for local development (`http://localhost:3000`)

### Automated Workflow
The collection includes test scripts that automatically:
- Save the `verificationId` from Generate OTP responses
- Use the saved `verificationId` in Verify OTP requests

### Testing Flow
1. **Generate Email OTP** → Saves `verificationId` automatically
2. Check your email for the OTP code
3. **Verify OTP** → Uses saved `verificationId`, just enter the OTP code
4. **Get OTP Status** → View verification details

---

## 💻 Code Examples

### JavaScript/Node.js (Axios)

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
const CLIENT_SECRET = 'your-client-secret-key';

// Generate Email OTP
async function generateEmailOTP(email) {
  try {
    const response = await axios.post(
      `${BASE_URL}/otp/generate`,
      {
        recipient: email,
        type: 'email',
        subject: 'Your Verification Code'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-secret': CLIENT_SECRET
        }
      }
    );
    
    console.log('Verification ID:', response.data.data.verificationId);
    console.log('Expires At:', response.data.data.expiresAt);
    return response.data.data.verificationId;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Verify OTP
async function verifyOTP(verificationId, otp) {
  try {
    const response = await axios.post(
      `${BASE_URL}/otp/verify`,
      {
        verificationId,
        otp
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-secret': CLIENT_SECRET
        }
      }
    );
    
    console.log('Verified:', response.data.data.verified);
    return response.data.data.verified;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return false;
  }
}

// Usage
(async () => {
  const verificationId = await generateEmailOTP('user@example.com');
  // User receives OTP via email
  const isValid = await verifyOTP(verificationId, '123456');
  console.log('OTP is valid:', isValid);
})();
```

---

### Python (Requests)

```python
import requests

BASE_URL = 'http://localhost:3000/api/v1'
CLIENT_SECRET = 'your-client-secret-key'

def generate_email_otp(email):
    """Generate and send OTP via email"""
    url = f'{BASE_URL}/otp/generate'
    headers = {
        'Content-Type': 'application/json',
        'x-client-secret': CLIENT_SECRET
    }
    payload = {
        'recipient': email,
        'type': 'email',
        'subject': 'Your Verification Code'
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Verification ID: {data['data']['verificationId']}")
        print(f"Expires At: {data['data']['expiresAt']}")
        return data['data']['verificationId']
    else:
        print(f"Error: {response.json()}")
        return None

def verify_otp(verification_id, otp):
    """Verify OTP code"""
    url = f'{BASE_URL}/otp/verify'
    headers = {
        'Content-Type': 'application/json',
        'x-client-secret': CLIENT_SECRET
    }
    payload = {
        'verificationId': verification_id,
        'otp': otp
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        return data['data']['verified']
    else:
        print(f"Error: {response.json()}")
        return False

# Usage
if __name__ == '__main__':
    verification_id = generate_email_otp('user@example.com')
    # User receives OTP via email
    is_valid = verify_otp(verification_id, '123456')
    print(f'OTP is valid: {is_valid}')
```

---

### cURL

```bash
# Generate Email OTP
curl -X POST http://localhost:3000/api/v1/otp/generate \
  -H "Content-Type: application/json" \
  -H "x-client-secret: your-client-secret-key" \
  -d '{
    "recipient": "user@example.com",
    "type": "email",
    "subject": "Your Verification Code"
  }'

# Response:
# {
#   "success": true,
#   "message": "OTP sent successfully",
#   "data": {
#     "verificationId": "507f1f77bcf86cd799439011",
#     "expiresAt": "2025-11-20T17:26:25.000Z"
#   }
# }

# Verify OTP
curl -X POST http://localhost:3000/api/v1/otp/verify \
  -H "Content-Type: application/json" \
  -H "x-client-secret: your-client-secret-key" \
  -d '{
    "verificationId": "507f1f77bcf86cd799439011",
    "otp": "123456"
  }'

# Get OTP Status
curl -X GET http://localhost:3000/api/v1/otp/status/507f1f77bcf86cd799439011 \
  -H "x-client-secret: your-client-secret-key"
```

---

### PHP

```php
<?php

$baseUrl = 'http://localhost:3000/api/v1';
$clientSecret = 'your-client-secret-key';

function generateEmailOTP($email) {
    global $baseUrl, $clientSecret;
    
    $url = "$baseUrl/otp/generate";
    $data = [
        'recipient' => $email,
        'type' => 'email',
        'subject' => 'Your Verification Code'
    ];
    
    $options = [
        'http' => [
            'header' => [
                "Content-Type: application/json",
                "x-client-secret: $clientSecret"
            ],
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    $response = json_decode($result, true);
    
    if ($response['success']) {
        echo "Verification ID: " . $response['data']['verificationId'] . "\n";
        return $response['data']['verificationId'];
    }
    
    return null;
}

function verifyOTP($verificationId, $otp) {
    global $baseUrl, $clientSecret;
    
    $url = "$baseUrl/otp/verify";
    $data = [
        'verificationId' => $verificationId,
        'otp' => $otp
    ];
    
    $options = [
        'http' => [
            'header' => [
                "Content-Type: application/json",
                "x-client-secret: $clientSecret"
            ],
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    $response = json_decode($result, true);
    
    return $response['data']['verified'] ?? false;
}

// Usage
$verificationId = generateEmailOTP('user@example.com');
// User receives OTP via email
$isValid = verifyOTP($verificationId, '123456');
echo "OTP is valid: " . ($isValid ? 'true' : 'false') . "\n";

?>
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Environment
NODE_ENV=development

# Server
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/otp-service

# Redis
REDIS_URI=redis://localhost:6379

# Security
CLIENT_SECRET_KEY=your-secure-secret-key-here

# Email (Brevo/SendInBlue)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-email
BREVO_SMTP_PASS=your-brevo-smtp-key
SENDER_EMAIL=noreply@yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_SECONDS=300
OTP_EXPIRY_MINUTES=60

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

---

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd otp-ms
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start Dependencies (Docker)
```bash
docker-compose up -d
```

### 4. Run the Service
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 5. Test the API
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Import Postman collection
# File: postman/OTP-Microservice.postman_collection.json
```

---

## 📊 Monitoring

### Health Endpoints
Use the health check endpoints for monitoring:

- **Liveness:** `GET /api/v1/health/live` - Is the app running?
- **Readiness:** `GET /api/v1/health/ready` - Is the app ready to serve traffic?
- **Detailed:** `GET /api/v1/health/detailed` - Full dependency status

### Kubernetes Example
```yaml
livenessProbe:
  httpGet:
    path: /api/v1/health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/v1/health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 📝 Best Practices

### Security
1. **Never expose your `CLIENT_SECRET_KEY`** in client-side code
2. **Use HTTPS** in production
3. **Rotate secrets** regularly
4. **Monitor rate limits** and adjust as needed
5. **Implement IP whitelisting** for production environments

### OTP Generation
1. **Use appropriate expiry times** - Default is 5 minutes (300 seconds)
2. **Limit verification attempts** - Service tracks attempts automatically
3. **Don't reuse verification IDs** - Generate a new OTP for each attempt

### Error Handling
1. **Always check the `success` field** in responses
2. **Handle rate limit errors** gracefully with exponential backoff
3. **Log verification failures** for security monitoring

---

## 🆘 Support

For issues, questions, or contributions:
- Create an issue in the repository
- Check the logs in `logs/` directory
- Review the detailed health check endpoint for service status

---

## 📄 License

[Your License Here]

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-20
