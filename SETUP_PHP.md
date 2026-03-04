# PHP/MySQL Setup Guide

## Quick Start

### 1. Install MySQL

Make sure MySQL is installed and running on your system.

### 2. Create Database

```bash
mysql -u root -p < database/schema.sql
```

Or manually:
```sql
mysql -u root -p
CREATE DATABASE safari_stays;
USE safari_stays;
SOURCE database/schema.sql;
```

### 3. Configure Database

Edit `config/database.php` and update:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'safari_stays');
define('DB_USER', 'root');        // Your MySQL username
define('DB_PASS', '');            // Your MySQL password
```

### 4. Migrate Existing Data (Optional)

If you have existing JSON data, import it:
```bash
php database/migrate_from_json.php
```

### 5. Start PHP Server

**Option A: PHP Built-in Server (Development)**
```bash
php -S localhost:8000
```

**Option B: Apache (Production)**
- Place project in web server directory
- Ensure mod_rewrite is enabled
- Access via: `http://localhost/AIRBNB-WEB-APP/`

### 6. Update Frontend

Edit `api.js` and change:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

Or for Apache:
```javascript
const API_BASE_URL = '/api';
```

## Testing the API

### Test Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"booker"}'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Get Properties
```bash
curl http://localhost:8000/api/properties
```

## Troubleshooting

### "Database connection failed"
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `config/database.php`
- Ensure database exists: `SHOW DATABASES;`

### "404 Not Found" on API endpoints
- For PHP built-in server: Use `api/index.php` as router
- For Apache: Check `.htaccess` is present and mod_rewrite is enabled

### CORS errors
- Check CORS headers in `config/database.php`
- Verify `.htaccess` CORS settings

## File Structure

```
├── api/
│   ├── auth.php          # Authentication
│   ├── properties.php    # Properties CRUD
│   ├── bookings.php      # Bookings
│   ├── host.php          # Host dashboard
│   └── index.php         # Router (for PHP server)
├── config/
│   └── database.php      # Database config
├── includes/
│   ├── jwt.php           # JWT handling
│   └── helpers.php       # Helper functions
├── database/
│   ├── schema.sql        # Database schema
│   └── migrate_from_json.php  # Migration script
└── .htaccess             # Apache rewrite rules
```

## Next Steps

1. ✅ Database created
2. ✅ Data migrated (if needed)
3. ✅ PHP server running
4. ✅ Frontend API URL updated
5. 🎉 Test the application!

