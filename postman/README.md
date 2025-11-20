# Postman Collection Usage Guide

This guide will help you get started with testing the OTP Microservice API using Postman.

---

## 📦 What's Included

- **Collection:** `OTP-Microservice.postman_collection.json` - Complete API endpoints
- **Environment:** `OTP-Microservice.postman_environment.json` - Development configuration

---

## 🚀 Quick Start

### Step 1: Import Collection

1. Open **Postman**
2. Click **Import** (top-left corner)
3. Drag and drop or select:
   - `postman/OTP-Microservice.postman_collection.json`
   - `postman/OTP-Microservice.postman_environment.json`
4. Click **Import**

### Step 2: Configure Environment

1. Click the **Environment dropdown** (top-right)
2. Select **OTP Microservice - Development**
3. Click the **eye icon** 👁️ to view variables
4. Click **Edit** and update:
   - `CLIENT_SECRET`: Your actual client secret from `.env` file
   - `BASE_URL`: Keep as `http://localhost:3000` for local testing
5. Click **Save**

### Step 3: Start the Service

Make sure your OTP microservice is running:

```bash
# Start dependencies
docker-compose up -d

# Start the service
npm run dev
```

### Step 4: Test the API

1. Open the **OTP Microservice API** collection
2. Start with **Health Checks** → **Basic Health Check**
3. Click **Send**
4. You should see a `200 OK` response

---

## 📋 Collection Structure

### 1. Health Checks
- **Basic Health Check** - Quick service status
- **Detailed Health Check** - Full dependency status (MongoDB, Redis, memory)
- **Readiness Check** - Kubernetes readiness probe
- **Liveness Check** - Kubernetes liveness probe

### 2. OTP Operations
- **Generate Email OTP** - Send OTP via email
- **Generate SMS OTP** - Send OTP via SMS
- **Verify OTP** - Verify the OTP code
- **Get OTP Status** - Check verification status

### 3. Error Examples
- **Missing Client Secret** - Authentication error example
- **Invalid Email Format** - Validation error example
- **Invalid OTP Format** - OTP validation error example

---

## 🔄 Automated Workflow

The collection includes **test scripts** that automate the workflow:

### Generate OTP → Verify OTP Flow

1. **Run "Generate Email OTP"**
   - Automatically saves `verificationId` to environment variable
   - Check console for: `Verification ID saved: 507f1f77bcf86cd799439011`

2. **Check Your Email**
   - You'll receive an email with the OTP code

3. **Run "Verify OTP"**
   - Automatically uses the saved `verificationId`
   - Just update the `otp` field with the code from your email
   - Click **Send**

4. **Run "Get OTP Status"** (Optional)
   - View detailed verification information
   - Automatically uses the saved `verificationId`

---

## 🔧 Environment Variables

The collection uses these variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `BASE_URL` | API base URL | `http://localhost:3000` |
| `CLIENT_SECRET` | Authentication secret | `your-client-secret-key` |
| `VERIFICATION_ID` | Auto-saved from generate endpoint | (empty) |

### How to Update Variables

**Method 1: Via Environment Editor**
1. Click environment dropdown → **OTP Microservice - Development**
2. Click **Edit**
3. Update values
4. Click **Save**

**Method 2: Via Quick Look**
1. Click the **eye icon** 👁️ (top-right)
2. Click **Edit** next to the variable
3. Update value
4. Press Enter

---

## 📝 Testing Scenarios

### Scenario 1: Email OTP Flow

```
1. Generate Email OTP
   POST /api/v1/otp/generate
   Body: {
     "recipient": "your-email@example.com",
     "type": "email",
     "subject": "Your Verification Code"
   }
   
2. Check email for OTP code

3. Verify OTP
   POST /api/v1/otp/verify
   Body: {
     "verificationId": "{{VERIFICATION_ID}}",
     "otp": "123456"
   }
```

### Scenario 2: SMS OTP Flow

```
1. Generate SMS OTP
   POST /api/v1/otp/generate
   Body: {
     "recipient": "+1234567890",
     "type": "sms"
   }
   
2. Check phone for OTP code

3. Verify OTP
   POST /api/v1/otp/verify
   Body: {
     "verificationId": "{{VERIFICATION_ID}}",
     "otp": "123456"
   }
```

### Scenario 3: Error Handling

Test error scenarios using the **Error Examples** folder:

1. **Missing Client Secret**
   - Remove authentication header
   - Expect: `401 Unauthorized`

2. **Invalid Email Format**
   - Use invalid email: `"invalid-email"`
   - Expect: `400 Bad Request` with validation error

3. **Invalid OTP Format**
   - Use non-numeric OTP: `"abc123"`
   - Expect: `400 Bad Request` with validation error

---

## 🎯 Tips & Tricks

### 1. Use the Console
- Open **Postman Console** (bottom-left, Console icon)
- View test script outputs
- Debug variable assignments

### 2. Save Responses as Examples
- After a successful request, click **Save Response**
- Click **Save as Example**
- Helps document expected responses

### 3. Use Pre-request Scripts
The collection already includes test scripts. You can add pre-request scripts for:
- Generating dynamic data
- Setting timestamps
- Creating test emails

Example:
```javascript
// Generate random email
pm.environment.set("TEST_EMAIL", `test${Date.now()}@example.com`);
```

### 4. Run Collection
- Click the collection name
- Click **Run**
- Select requests to run
- Click **Run OTP Microservice API**
- View results in Collection Runner

### 5. Export Results
- After running collection
- Click **Export Results**
- Save as JSON or CSV for reporting

---

## 🐛 Troubleshooting

### Issue: "Could not get response"
**Solution:**
- Ensure the service is running: `npm run dev`
- Check `BASE_URL` is correct: `http://localhost:3000`
- Verify MongoDB and Redis are running: `docker-compose ps`

### Issue: "401 Unauthorized"
**Solution:**
- Check `CLIENT_SECRET` environment variable
- Ensure it matches the value in your `.env` file
- Verify the header `x-client-secret` is being sent

### Issue: "Verification ID not found"
**Solution:**
- Run "Generate OTP" first
- Check console for "Verification ID saved" message
- Manually copy `verificationId` from response if auto-save fails

### Issue: "Invalid or expired OTP"
**Solution:**
- OTPs expire after 5 minutes (default)
- Generate a new OTP
- Ensure you're using the correct OTP code from email/SMS

### Issue: "429 Too Many Requests"
**Solution:**
- Rate limit exceeded (100 requests per 15 minutes)
- Wait for the rate limit window to reset
- Or restart the service to reset counters

---

## 📊 Response Examples

### Successful OTP Generation
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

### Successful OTP Verification
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "verified": true
  }
}
```

### Validation Error
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

### Authentication Error
```json
{
  "success": false,
  "message": "Client secret is required"
}
```

---

## 🔐 Security Notes

1. **Never commit** the environment file with real secrets
2. **Use separate environments** for development, staging, and production
3. **Rotate secrets** regularly
4. **Don't share** your `CLIENT_SECRET` publicly

---

## 📚 Additional Resources

- **Full API Documentation:** `docs/API.md`
- **Project README:** `README.md`
- **Environment Example:** `.env.example`

---

## 🆘 Need Help?

If you encounter issues:
1. Check the **Postman Console** for errors
2. Review the **API Documentation** (`docs/API.md`)
3. Check service logs: `logs/combined.log`
4. Verify dependencies are running: `docker-compose ps`

---

**Happy Testing! 🚀**
