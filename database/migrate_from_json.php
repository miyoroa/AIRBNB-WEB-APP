<?php
/**
 * Migration Script: Import JSON data to MySQL database
 * 
 * This script imports data from the JSON files (users.json, properties.json, bookings.json)
 * into the MySQL database.
 * 
 * Usage: php database/migrate_from_json.php
 */

require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();

echo "Starting migration from JSON to MySQL...\n\n";

// Import users
echo "Importing users...\n";
$usersFile = __DIR__ . '/../data/users.json';
if (file_exists($usersFile)) {
    $users = json_decode(file_get_contents($usersFile), true);
    $stmt = $pdo->prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=email");
    
    foreach ($users as $user) {
        $stmt->execute([
            $user['id'],
            $user['email'],
            $user['password'], // Already hashed
            $user['name'],
            $user['role']
        ]);
    }
    echo "  ✓ Imported " . count($users) . " users\n";
} else {
    echo "  ⚠ users.json not found, skipping...\n";
}

// Import properties
echo "\nImporting properties...\n";
$propertiesFile = __DIR__ . '/../data/properties.json';
if (file_exists($propertiesFile)) {
    $properties = json_decode(file_get_contents($propertiesFile), true);
    $stmt = $pdo->prepare("
        INSERT INTO properties (
            id, name, location, price, type, rating, image, description, amenities,
            host_id, host_name, max_guests, checkin_time, checkout_time,
            location_description, cancellation_policy, available
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name)
    ");
    
    $count = 0;
    foreach ($properties as $prop) {
        try {
            $stmt->execute([
                $prop['id'],
                $prop['name'],
                $prop['location'],
                $prop['price'],
                $prop['type'],
                $prop['rating'] ?? 0,
                $prop['image'] ?? null,
                $prop['description'],
                json_encode($prop['amenities'] ?? []),
                $prop['hostId'],
                $prop['hostName'],
                $prop['maxGuests'] ?? 4,
                $prop['checkinTime'] ?? null,
                $prop['checkoutTime'] ?? null,
                $prop['locationDescription'] ?? null,
                $prop['cancellationPolicy'] ?? null,
                $prop['available'] ?? true
            ]);
            $count++;
            
            // Import reviews for this property
            if (!empty($prop['reviews'])) {
                $reviewStmt = $pdo->prepare("
                    INSERT INTO reviews (property_id, user_id, user_name, rating, comment, date)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE comment=VALUES(comment)
                ");
                
                foreach ($prop['reviews'] as $review) {
                    $reviewStmt->execute([
                        $prop['id'],
                        $review['userId'],
                        $review['userName'],
                        $review['rating'],
                        $review['comment'],
                        $review['date']
                    ]);
                }
            }
        } catch (PDOException $e) {
            echo "  ⚠ Error importing property {$prop['id']}: " . $e->getMessage() . "\n";
        }
    }
    echo "  ✓ Imported $count properties\n";
} else {
    echo "  ⚠ properties.json not found, skipping...\n";
}

// Import bookings
echo "\nImporting bookings...\n";
$bookingsFile = __DIR__ . '/../data/bookings.json';
if (file_exists($bookingsFile)) {
    $bookings = json_decode(file_get_contents($bookingsFile), true);
    $stmt = $pdo->prepare("
        INSERT INTO bookings (id, property_id, user_id, check_in, check_out, guests, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status=VALUES(status)
    ");
    
    $count = 0;
    foreach ($bookings as $booking) {
        try {
            $stmt->execute([
                $booking['id'],
                $booking['propertyId'],
                $booking['userId'],
                $booking['checkIn'],
                $booking['checkOut'],
                $booking['guests'],
                $booking['totalPrice'],
                $booking['status'] ?? 'pending'
            ]);
            $count++;
        } catch (PDOException $e) {
            echo "  ⚠ Error importing booking {$booking['id']}: " . $e->getMessage() . "\n";
        }
    }
    echo "  ✓ Imported $count bookings\n";
} else {
    echo "  ⚠ bookings.json not found, skipping...\n";
}

echo "\n✓ Migration completed!\n";
echo "\nNext steps:\n";
echo "1. Update api.js to point to PHP API: const API_BASE_URL = 'http://localhost:8000/api';\n";
echo "2. Start PHP server: php -S localhost:8000\n";
echo "3. Or configure Apache to serve the application\n";

