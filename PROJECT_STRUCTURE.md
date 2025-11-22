# Safari Stays - Project Structure

## 📁 File Organization

```
AIRBNB-WEB-APP/
│
├── 📄 Backend Files
│   ├── server.js              # Express server & API endpoints
│   ├── api.js                 # Frontend API utility functions
│   ├── package.json           # Node.js dependencies
│   └── .gitignore             # Git ignore rules
│
├── 📄 Frontend Pages
│   ├── index.html             # Homepage with featured listings
│   ├── search.html             # Search page with filters
│   ├── property-detail.html   # Property details & booking form
│   ├── login.html              # User authentication (Booker/Host)
│   ├── signup.html             # User registration
│   └── booking.html            # Host dashboard & bookings
│
├── 📄 JavaScript Files
│   ├── search-app.js           # Search functionality
│   ├── booking-app.js          # Booking management
│   └── components/
│       └── Footer.js           # Footer component
│
├── 📄 Stylesheets
│   ├── styles.css              # Main stylesheet
│   ├── search.css              # Search page styles
│   ├── login.css               # Login page styles
│   └── booking.css             # Booking page styles
│
├── 📄 Assets
│   ├── lodge.jpg
│   ├── tree.jpg
│   ├── villa.jpg
│   ├── delta.jpg
│   ├── mountainView.jpg
│   ├── savanna.jpg
│   └── view.jpg
│
├── 📄 Documentation
│   ├── README.md               # Main documentation
│   └── PROJECT_STRUCTURE.md    # This file
│
└── 📁 data/                    # Auto-created by server
    ├── users.json              # User data
    ├── properties.json         # Property listings
    └── bookings.json           # Booking records
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 🔌 API Endpoints

All API endpoints are prefixed with `/api`

- **Auth:** `/api/auth/register`, `/api/auth/login`
- **Properties:** `/api/properties` (GET, POST, PUT, DELETE)
- **Bookings:** `/api/bookings` (GET, POST)
- **Host Stats:** `/api/host/stats` (GET)

## 📝 Key Features

✅ Full-stack application
✅ JWT authentication
✅ RESTful API
✅ Property search & filtering
✅ Booking system
✅ Host dashboard
✅ Responsive design

