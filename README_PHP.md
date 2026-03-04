# Safari Stays - PHP/MySQL Version

This is the PHP/MySQL version of the Safari Stays Airbnb-style web application.

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher (or MariaDB 10.2+)
- Apache web server with mod_rewrite enabled
- PDO MySQL extension

## Installation

### 1. Database Setup

1. Create the database and tables:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. Update database credentials in `config/database.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'safari_stays');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   ```

### 2. Web Server Configuration

#### Option A: Using Apache (Recommended)

1. Place the project in your web server directory (e.g., `htdocs`, `www`, or `/var/www/html`)
2. Ensure `.htaccess` is enabled in Apache configuration
3. Access via: `http://localhost/AIRBNB-WEB-APP/`

#### Option B: Using PHP Built-in Server (Development)

```bash
php -S localhost:8000
```

Then access: `http://localhost:8000`

### 3. Import Sample Data

The schema includes sample users. To add sample properties, you can:

1. Use the registration endpoint to create a host account
2. Use the property creation endpoint to add properties
3. Or manually insert data into the database

### 4. Update Frontend API Base URL

Update `api.js` to point to your PHP API:

```javascript
const API_BASE_URL = 'http://localhost:8000/api'; // or your Apache URL
```

## API Endpoints

All endpoints return JSON and follow the same structure as the Node.js version:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/{id}` - Get single property
- `POST /api/properties` - Create property (Host only)
- `PUT /api/properties/{id}` - Update property (Host only)
- `DELETE /api/properties/{id}` - Delete property (Host only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create booking (Booker only)

### Host Dashboard
- `GET /api/host/stats` - Get host statistics

## File Structure

```
AIRBNB-WEB-APP/
├── api/
│   ├── auth.php          # Authentication endpoints
│   ├── properties.php    # Property endpoints
│   ├── bookings.php      # Booking endpoints
│   └── host.php          # Host dashboard endpoints
├── config/
│   └── database.php      # Database configuration
├── includes/
│   ├── jwt.php           # JWT token handling
│   └── helpers.php       # Helper functions
├── database/
│   └── schema.sql        # Database schema
├── .htaccess             # Apache rewrite rules
└── README_PHP.md         # This file
```

## Features

- ✅ MySQL database with proper relationships
- ✅ JWT authentication
- ✅ Password hashing with PHP password_hash()
- ✅ RESTful API endpoints
- ✅ CORS support
- ✅ Location-based search with fuzzy matching
- ✅ Property CRUD operations
- ✅ Booking management
- ✅ Host dashboard statistics

## Security Notes

1. **Change JWT Secret**: Update `JWT_SECRET` in `config/database.php`
2. **Database Credentials**: Never commit real credentials to version control
3. **Password Hashing**: Uses PHP's `password_hash()` with bcrypt
4. **SQL Injection**: All queries use prepared statements
5. **CORS**: Currently allows all origins - restrict in production

## Migration from Node.js Version

The PHP version maintains API compatibility with the Node.js version, so the frontend should work with minimal changes (just update the API base URL).

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `config/database.php`
- Ensure database exists: `CREATE DATABASE safari_stays;`

### 404 Errors on API Endpoints
- Ensure mod_rewrite is enabled in Apache
- Check `.htaccess` file is present
- Verify file paths are correct

### CORS Issues
- Check `.htaccess` CORS headers
- Verify `config/database.php` CORS settings

## Development

For development, you can use PHP's built-in server:

```bash
php -S localhost:8000
```

Then update `api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Production Deployment

1. Use a production web server (Apache/Nginx)
2. Enable HTTPS
3. Update database credentials
4. Change JWT secret
5. Restrict CORS to your domain
6. Set proper file permissions
7. Disable error display in production

