# Sentinel AI - Intelligent Threat Detection System Backend

A production-ready Node.js backend for detecting cyber threats from network traffic using machine learning and rule-based detection.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Network Log Ingestion**: Real-time processing of network traffic logs
- **Threat Detection**: Rule-based and ML-powered threat analysis
- **Alert System**: Automated alert generation with escalation
- **Reporting**: Comprehensive security reports and analytics
- **Notifications**: Multi-channel notifications (Email, SMS, Slack, Webhook)
- **Data Simulation**: Generate realistic network traffic for testing

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validation**: Express Validator
- **ML Integration**: REST API ready for Python ML models

## Project Structure

```
backend/
├── config/
│   └── db.js                    # Database configuration
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── networkLogController.js  # Network log management
│   ├── threatController.js      # Threat management
│   ├── alertController.js      # Alert management
│   ├── reportController.js      # Report generation
│   └── mlController.js          # ML integration
├── models/
│   ├── User.js                  # User model
│   ├── NetworkLog.js           # Network log model
│   ├── Threat.js               # Threat model
│   ├── Alert.js                # Alert model
│   ├── Report.js               # Report model
│   └── Notification.js         # Notification model
├── routes/
│   ├── authRoutes.js           # Auth endpoints
│   ├── networkLogRoutes.js     # Network log endpoints
│   ├── threatRoutes.js         # Threat endpoints
│   ├── alertRoutes.js          # Alert endpoints
│   ├── reportRoutes.js         # Report endpoints
│   └── mlRoutes.js             # ML endpoints
├── middleware/
│   ├── authMiddleware.js       # Authentication middleware
│   └── errorHandler.js         # Error handling
├── services/
│   ├── threatDetectionService.js # Threat detection logic
│   ├── mlService.js            # ML integration service
│   ├── alertService.js         # Alert management
│   └── notificationService.js  # Notification delivery
├── utils/
│   └── severityCalculator.js   # Severity calculation utilities
├── scripts/
│   └── generateSimulatedLogs.js # Data generation script
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
├── server.js                   # Main server file
└── README.md                   # This file
```

## Installation

### Prerequisites

- Node.js 16.0 or higher
- MongoDB 4.4 or higher
- npm or yarn

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sentinel-ai/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:
   - MongoDB connection string
   - JWT secrets
   - Email/SMS credentials
   - ML service URL

4. **Create necessary directories**

   ```bash
   mkdir -p logs uploads
   ```

5. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Environment Variables

Key environment variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/sentinel-ai

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# ML Service
PYTHON_ML_SERVICE_URL=http://localhost:5000

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Network Logs

- `POST /api/logs` - Create network log
- `POST /api/logs/bulk` - Bulk create logs
- `GET /api/logs` - Get logs with pagination
- `GET /api/logs/stats` - Get log statistics
- `GET /api/logs/:id` - Get specific log

### Threats

- `GET /api/threats` - Get threats
- `GET /api/threats/stats` - Get threat statistics
- `GET /api/threats/:id` - Get specific threat
- `PUT /api/threats/:id/assign` - Assign threat
- `PUT /api/threats/:id/resolve` - Resolve threat
- `PUT /api/threats/:id/false-positive` - Mark as false positive

### Alerts

- `GET /api/alerts` - Get alerts
- `GET /api/alerts/stats` - Get alert statistics
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/alerts/:id/resolve` - Resolve alert
- `POST /api/alerts/bulk-resolve` - Bulk resolve alerts

### Reports

- `GET /api/reports/threat-summary` - Generate threat summary
- `GET /api/reports/security-stats` - Generate security statistics
- `POST /api/reports/custom` - Create custom report
- `GET /api/reports` - Get reports

### Machine Learning

- `POST /api/ml/predict` - Predict threat for log
- `POST /api/ml/predict-batch` - Batch prediction
- `POST /api/ml/train` - Train ML model
- `GET /api/ml/health` - Check ML service health

## Data Generation

Generate simulated network data for testing:

```bash
# Generate 20,000 logs with 10% suspicious activity
npm run generate-data

# Generate 50,000 logs with 20% suspicious activity
node scripts/generateSimulatedLogs.js 50000 0.2

# Generate test patterns (DDoS, brute force, SQL injection)
node scripts/generateSimulatedLogs.js --test-patterns

# Clean up generated data
node scripts/generateSimulatedLogs.js --cleanup
```

## Testing with Postman

### Example Requests

#### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "security_admin",
  "email": "admin@company.com",
  "password": "SecurePass123",
  "department": "IT Security",
  "role": "admin"
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "SecurePass123"
}
```

#### 3. Create Network Log

```http
POST /api/logs
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "sourceIP": "192.168.1.100",
  "destinationIP": "10.0.0.1",
  "protocol": "TCP",
  "packetSize": 1500,
  "action": "ALLOW",
  "status": "SUCCESS",
  "sourcePort": 12345,
  "destinationPort": 80
}
```

#### 4. Get Threats

```http
GET /api/threats?page=1&limit=20&severityLevel=High
Authorization: Bearer <your-jwt-token>
```

#### 5. Generate Report

```http
GET /api/reports/threat-summary?startDate=2023-01-01&endDate=2023-12-31
Authorization: Bearer <your-jwt-token>
```

## ML Integration

The backend is ready to integrate with Python ML models:

### Python ML Service Expected Endpoints:

```python
# Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    features = data['features']
    # Your ML model prediction logic
    return {
        'threat_type': 'DDoS',
        'confidence_score': 85.5,
        'severity_level': 'High'
    }

# Health check
@app.route('/health', methods=['GET'])
def health():
    return {'status': 'healthy'}
```

### Feature Extraction

The system automatically extracts features from network logs:

- Packet size, ports, protocols
- Time-based features (hour, day of week)
- Protocol encoding (one-hot)
- IP classification (private/public)
- Composite features

## Security Features

- **Authentication**: JWT with expiration
- **Authorization**: Role-based access control
- **Rate Limiting**: Configurable per-endpoint limits
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable cross-origin policy
- **Password Security**: bcrypt with salt rounds

## Monitoring & Logging

- **Winston Logging**: Structured logging with levels
- **Error Tracking**: Comprehensive error handling
- **Health Checks**: `/health` endpoint
- **Metrics**: Request logging and performance tracking
- **Background Tasks**: Alert escalations and notifications

## Deployment

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Setup

1. **Production Environment Variables**:
   - Set `NODE_ENV=production`
   - Use strong secrets for JWT
   - Configure proper database URL
   - Set up monitoring and logging

2. **Database Setup**:
   - MongoDB cluster with replica set
   - Proper indexing for performance
   - Backup strategy

3. **Load Balancing**:
   - Use nginx or cloud load balancer
   - Configure SSL/TLS
   - Health check endpoints

## Performance Considerations

- **Database Indexing**: Optimized indexes for queries
- **Pagination**: All list endpoints support pagination
- **Caching**: Redis for frequently accessed data
- **Background Jobs**: Queue system for notifications
- **Connection Pooling**: MongoDB connection pooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Email: support@sentinel-ai.com
- Documentation: [Link to docs]

## Changelog

### v1.0.0

- Initial release
- Core threat detection functionality
- Authentication and authorization
- Alert system with notifications
- Reporting and analytics
- ML integration framework
