# Safari Stays - Setup Guide

## 📋 Prerequisites

- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- A code editor (VS Code recommended)

## 🚀 Installation Steps

### 1. Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This will install:
- express - Web server framework
- cors - Cross-origin resource sharing
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- body-parser - Request body parsing
- nodemon - Development auto-reload (dev dependency)

### 2. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
AIRBNB-WEB-APP/
├── server.js              # Backend Express server
├── api.js                  # Frontend API utilities
├── package.json           # Dependencies
├── index.html             # Homepage
├── search.html            # Search page
├── property-detail.html   # Property details
├── login.html             # Login page
├── signup.html            # Signup page
├── booking.html           # Host dashboard
└── data/                  # Auto-created database files
    ├── users.json
    ├── properties.json
    └── bookings.json
```

## 🔑 Default Behavior

- Server runs on **port 3000**
- Data is stored in JSON files in the `data/` folder
- Sample properties are automatically created on first run
- JWT tokens expire after 7 days

## 🧪 Testing the API

You can test the API using:
- Browser (for GET requests)
- Postman
- curl commands
- The frontend application

Example API test:
```bash
# Get all properties
curl http://localhost:3000/api/properties

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"booker"}'
```

## 🐛 Troubleshooting

**Port already in use:**
- Change PORT in server.js or set environment variable
- Kill the process using port 3000

**Module not found errors:**
- Run `npm install` again
- Delete `node_modules` and reinstall

**CORS errors:**
- Server has CORS enabled by default
- Check browser console for specific errors

## 📝 Next Steps

1. Create your first user account via signup page
2. Browse properties on the homepage
3. Search and filter properties
4. Make a test booking
5. View host dashboard (if logged in as host)

## 🔒 Security Notes

- Change JWT_SECRET in production
- Use environment variables for sensitive data
- Consider migrating to a real database for production
- Implement rate limiting for production use

