# EduHub Backend API

RESTful API service for the EduHub After-School Lessons platform, built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development
FRONTEND_URL=https://your-frontend-url.github.io
```

3. Start the server:
```bash
npm start        # Production
npm run dev      # Development (with nodemon)
```

## 📁 Project Structure

```
CST3144-Coursework-FullstackDev-BackEnd/
├── controllers/          # Business logic layer
│   ├── lessonController.js
│   └── orderController.js
├── models/              # Data access layer
│   ├── lessonModel.js
│   └── orderModel.js
├── routes/              # API endpoint definitions
│   ├── lessonRoutes.js
│   └── orderRoutes.js
├── middleware/          # Custom middleware
│   ├── errorHandler.js
│   └── validation.js
├── images/              # Static lesson images
├── index.js             # Application entry point
├── package.json
└── .env.example
```

## 🛡️ Key Features

### Security
- **Helmet.js** for security headers
- **CORS** configured for production
- **Rate limiting** (100 requests/15 min)
- **Input validation** with express-validator
- **Environment variables** for sensitive data

### Performance
- **Compression** for response optimization
- **Static asset caching**
- **Connection pooling** for MongoDB
- **Error recovery** with retry logic

### Database
- **MongoDB transactions** for order integrity
- **Flexible schema** supporting both `space` and `spaces` fields
- **Aggregation pipelines** for statistics

## 📡 API Endpoints

### Lessons
- `GET /api/lessons` - Get all lessons (with filters)
- `GET /api/lessons/:id` - Get single lesson
- `PUT /api/lessons/:id` - Update lesson
- `GET /api/lessons/stats/overview` - Lesson statistics

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/stats/overview` - Order statistics

### System
- `GET /api` - API documentation
- `GET /api/health` - Health check

## 🔧 Configuration

### Environment Variables
- `MONGODB_URI` - MongoDB connection string (required)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

### Database Schema

**Lesson Collection:**
```javascript
{
  _id: ObjectId,
  topic: String,
  location: String,
  price: Number,
  space: Number,  // or spaces
  image: String
}
```

**Order Collection:**
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String,
  lessons: [{
    lessonId: ObjectId,
    topic: String,
    location: String,
    price: Number,
    quantity: Number,
    amount: Number
  }],
  totalAmount: Number,
  status: String,
  paymentStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Render.com
1. Connect GitHub repository
2. Set environment variables
3. Deploy (auto-deploys on push)

### Local Development
```bash
npm run dev
```

## 📊 Monitoring

- Health endpoint: `/api/health`
- Request logging with Morgan
- Error tracking in console
- MongoDB connection status

## 🧪 Testing

```bash
# No tests configured yet
npm test
```

## 📝 License

MIT License - Educational Project