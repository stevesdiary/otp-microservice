# OTP Microservice

A modern, scalable, and production-ready OTP (One-Time Password) microservice built with TypeScript, Node.js, Express, MongoDB, and Redis.

## 🚀 Features

- **OTP Generation & Verification**: Secure OTP generation and verification with configurable expiry
- **Multi-Channel Support**: Email (via Brevo/SMTP) and SMS (via Twilio)
- **Redis Caching**: Fast OTP validation with Redis cache
- **MongoDB Logging**: Persistent audit trail of all OTP operations
- **Rate Limiting**: Protection against abuse with configurable limits
- **Security**: Client authentication, helmet, CORS, request validation
- **Health Checks**: Built-in health endpoints for monitoring and orchestration
- **Docker Support**: Production-ready Docker and Docker Compose configuration
- **Testing**: Comprehensive unit and integration tests
- **Logging**: Structured logging with Winston
- **Type Safety**: Full TypeScript implementation with strict type checking

## 📋 Architecture

```
src/
├── config/              # Configuration and database connections
├── controllers/         # HTTP request handlers
├── dto/                 # Data Transfer Objects with validation
├── middleware/          # Express middleware (auth, validation, error handling)
├── models/              # Mongoose schemas and models
├── repositories/        # Data access layer (MongoDB, Redis)
├── routes/              # Route definitions
├── services/            # Business logic layer
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
└── index.ts            # Application entry point
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Cache**: Redis
- **Email**: Nodemailer (Brevo SMTP)
- **SMS**: Twilio
- **Validation**: class-validator, class-transformer, Joi
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Redis >= 6.0
- npm >= 9.0.0

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/stevesdiary/otp-microservice.git
   cd otp-microservice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server
   PORT=3000
   NODE_ENV=development

   # MongoDB
   MONGO_URI=mongodb://localhost:27017/otp_service_db

   # Redis
   REDIS_URI=redis://localhost:6379

   # Security
   CLIENT_SECRET_KEY=your-secret-key-here

   # Email (Brevo)
   BREVO_SMTP_HOST=smtp-relay.brevo.com
   BREVO_SMTP_PORT=587
   BREVO_SMTP_USER=your_brevo_user
   BREVO_SMTP_PASS=your_brevo_password
   SENDER_EMAIL=noreply@yourdomain.com

   # SMS (Twilio)
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890

   # OTP Configuration
   OTP_LENGTH=6
   OTP_EXPIRY_SECONDS=300
   OTP_EXPIRY_MINUTES=60
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services (OTP service, MongoDB, Redis)
docker-compose up -d

# View logs
docker-compose logs -f otp-service

# Stop all services
docker-compose down
```

### Using Docker Only

```bash
# Build image
docker build -t otp-microservice .

# Run container
docker run -p 3000:3000 --env-file .env otp-microservice
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All OTP endpoints require the `X-Client-Secret` header:
```
X-Client-Secret: your-secret-key
```

### Endpoints

#### 1. Generate OTP
```http
POST /api/v1/otp/generate
```

**Request Body:**
```json
{
  "recipient": "user@example.com",
  "type": "email"
}
```

**Response:**
```json
{
  "message": "OTP successfully sent to user@example.com via email",
  "verificationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### 2. Verify OTP
```http
POST /api/v1/otp/verify
```

**Request Body:**
```json
{
  "verificationId": "550e8400-e29b-41d4-a716-446655440000",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verification successful",
  "recipient": "user@example.com"
}
```

#### 3. Health Check
```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

#### 4. Detailed Health Check
```http
GET /api/v1/health/detailed
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
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

## 🧪 Testing

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration
```

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server with hot-reload
npm run start:dev        # Start using ts-node

# Build
npm run build            # Compile TypeScript to JavaScript

# Production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## 🏗️ Project Structure Details

### Configuration Layer (`config/`)
- Environment variable validation
- Database connection management
- Redis client configuration

### Controllers (`controllers/`)
- HTTP request/response handling
- Input validation
- Business logic delegation

### Services (`services/`)
- Core business logic
- OTP generation and verification
- Email and SMS sending

### Repositories (`repositories/`)
- Data access abstraction
- MongoDB operations
- Redis cache operations

### Middleware (`middleware/`)
- Authentication
- Request validation
- Error handling
- Request logging

## 🔐 Security Features

- **Client Secret Authentication**: All endpoints protected with shared secret
- **Rate Limiting**: Configurable request limits per IP
- **Helmet**: Security headers protection
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Request DTO validation with class-validator
- **Replay Attack Prevention**: OTPs deleted from cache after verification
- **Secure OTP Generation**: Cryptographically secure random numbers

## 📊 Monitoring & Logging

### Health Checks
- `/api/v1/health` - Basic health status
- `/api/v1/health/detailed` - Detailed service status
- `/api/v1/health/ready` - Kubernetes readiness probe
- `/api/v1/health/live` - Kubernetes liveness probe

### Logging
Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)
- `logs/exceptions.log` (uncaught exceptions)

## 🚀 Production Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Use strong `CLIENT_SECRET_KEY`
- Configure proper `MONGO_URI` with authentication
- Set `NODE_ENV=production`
- Configure `ALLOWED_ORIGINS` for CORS

### Kubernetes Deployment
The service includes health check endpoints compatible with Kubernetes:
- Liveness probe: `/api/v1/health/live`
- Readiness probe: `/api/v1/health/ready`

### Performance Considerations
- Redis cache reduces database load for OTP verification
- MongoDB TTL indexes automatically clean up expired OTPs
- Connection pooling for database connections
- Graceful shutdown handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

ISC

## 👤 Author

**Stephen Oyeyemi**

- GitHub: [@stevesdiary](https://github.com/stevesdiary)

## 🙏 Acknowledgments

- Express.js community
- TypeScript team
- MongoDB and Redis teams
- All contributors

---

**Made with ❤️ using TypeScript and Node.js**
