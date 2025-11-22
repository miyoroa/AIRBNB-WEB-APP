# Safari Stays - Airbnb-Style Web App

An Airbnb-style web application for booking authentic African safari accommodations.

## Features

### Users can:
- ✅ **Browse rental listings** - View featured safari lodges, camps, and villas
- ✅ **View property details** - See images, pricing, amenities, and descriptions
- ✅ **Search and filter** - Filter by price range, property type, and ratings
- ✅ **Make bookings** - Complete booking process with date selection and guest count
- ✅ **User authentication** - Login/Signup for both Bookers and Hosts
- ✅ **Host dashboard** - View earnings, bookings, and manage properties

## Tech Stack

### Frontend
- HTML5
- CSS3 (Custom CSS + Tailwind CSS)
- JavaScript (Vanilla JS)
- Responsive Design

### Backend
- Node.js
- Express.js
- JWT Authentication
- JSON File-based Database (easily migratable to MongoDB/PostgreSQL)

## Project Structure

```
AIRBNB-WEB-APP/
├── server.js              # Express server with API endpoints
├── api.js                  # Frontend API utility functions
├── package.json            # Node.js dependencies
├── data/                   # JSON database files (auto-created)
│   ├── users.json
│   ├── properties.json
│   └── bookings.json
├── index.html              # Homepage
├── search.html             # Search page with filters
├── property-detail.html    # Property details and booking
├── login.html              # User authentication
├── signup.html             # User registration
├── booking.html            # Host dashboard and bookings
├── search-app.js           # Search functionality
├── booking-app.js          # Booking management
└── styles.css              # Main stylesheet
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

The server will automatically create the `data/` directory and initialize sample properties.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Booker or Host)
- `POST /api/auth/login` - Login user

### Properties
- `GET /api/properties` - Get all properties (with optional filters)
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (Host only)
- `PUT /api/properties/:id` - Update property (Host only)
- `DELETE /api/properties/:id` - Delete property (Host only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking (Booker only)

### Host Dashboard
- `GET /api/host/stats` - Get host dashboard statistics

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens are stored in `localStorage` and automatically included in API requests.

## Database

Currently uses JSON files for data storage. To migrate to a real database:

1. Replace file read/write operations in `server.js` with database queries
2. Update the data models as needed
3. The API structure remains the same

## Environment Variables

Create a `.env` file for production:
```
PORT=3000
JWT_SECRET=your-secret-key-here
```

## Development

- The server runs on port 3000 by default
- Static files (HTML, CSS, images) are served from the root directory
- API endpoints are prefixed with `/api`
- CORS is enabled for all origins (configure for production)

## Features Implemented

- ✅ RESTful API with Express
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Property CRUD operations
- ✅ Booking management
- ✅ Search and filtering
- ✅ Host dashboard with statistics
- ✅ Responsive UI
- ✅ Error handling

## Future Enhancements

- [ ] Add real database (MongoDB/PostgreSQL)
- [ ] Add image upload functionality
- [ ] Add payment integration
- [ ] Add email notifications
- [ ] Add reviews and ratings system
- [ ] Add wishlist functionality
- [ ] Add messaging system
- [ ] Add admin dashboard
