<?php
/**
 * Properties API Endpoints
 */

require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();
$path = $_SERVER['PATH_INFO'] ?? $_GET['path'] ?? '';

switch ($method) {
    case 'GET':
        if (empty($path) || $path === '/') {
            getAllProperties($pdo);
        } else {
            $id = (int)trim($path, '/');
            getPropertyById($pdo, $id);
        }
        break;
        
    case 'POST':
        createProperty($pdo);
        break;
        
    case 'PUT':
        $id = (int)trim($path, '/');
        updateProperty($pdo, $id);
        break;
        
    case 'DELETE':
        $id = (int)trim($path, '/');
        deleteProperty($pdo, $id);
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

/**
 * Get all properties with filters
 */
function getAllProperties($pdo) {
    $location = $_GET['location'] ?? '';
    $minPrice = $_GET['minPrice'] ?? null;
    $maxPrice = $_GET['maxPrice'] ?? null;
    $type = $_GET['type'] ?? '';
    $minRating = $_GET['minRating'] ?? null;
    
    // Debug logging
    if ($location) {
        error_log("=== SEARCH REQUEST ===");
        error_log("Raw location parameter: " . ($_GET['location'] ?? ''));
        $decodedLocation = urldecode($location);
        error_log("Decoded location: " . $decodedLocation);
    }
    
    // Get all available properties first (don't filter by location in SQL)
    $query = "SELECT * FROM properties WHERE available = 1";
    $params = [];
    
    if ($minPrice !== null) {
        $query .= " AND price >= ?";
        $params[] = (float)$minPrice;
    }
    
    if ($maxPrice !== null) {
        $query .= " AND price <= ?";
        $params[] = (float)$maxPrice;
    }
    
    if ($type && $type !== 'All Types') {
        $query .= " AND type = ?";
        $params[] = $type;
    }
    
    if ($minRating !== null) {
        $query .= " AND rating >= ?";
        $params[] = (float)$minRating;
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $properties = $stmt->fetchAll();
    
    if ($location) {
        error_log("Total properties before location filter: " . count($properties));
    }
    
    // Apply precise location matching (PHP-side for better control)
    if ($location) {
        $decodedLocation = urldecode($location);
        $beforeFilter = count($properties);
        $properties = array_filter($properties, function($prop) use ($decodedLocation) {
            $matches = matchLocation($prop['location'], $decodedLocation);
            if ($matches) {
                error_log("  ✓ Property {$prop['id']} '{$prop['name']}' - MATCH: '{$prop['location']}'");
            }
            return $matches;
        });
        $properties = array_values($properties); // Re-index array
        error_log("After location filter: " . count($properties) . " properties (removed " . ($beforeFilter - count($properties)) . ")");
        error_log("=== END SEARCH ===\n");
    }
    
    // Format properties
    $formatted = array_map('formatProperty', $properties);
    
    // Load reviews for each property
    foreach ($formatted as &$property) {
        $stmt = $pdo->prepare("SELECT * FROM reviews WHERE property_id = ? ORDER BY date DESC");
        $stmt->execute([$property['id']]);
        $reviews = $stmt->fetchAll();
        $property['reviews'] = array_map(function($r) {
            return [
                'id' => (int)$r['id'],
                'userId' => (int)$r['user_id'],
                'userName' => $r['user_name'],
                'rating' => (int)$r['rating'],
                'comment' => $r['comment'],
                'date' => $r['date']
            ];
        }, $reviews);
    }
    
    sendJSON($formatted);
}

/**
 * Get property by ID
 */
function getPropertyById($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM properties WHERE id = ?");
    $stmt->execute([$id]);
    $property = $stmt->fetch();
    
    if (!$property) {
        sendError('Property not found', 404);
    }
    
    $formatted = formatProperty($property);
    
    // Load reviews
    $stmt = $pdo->prepare("SELECT * FROM reviews WHERE property_id = ? ORDER BY date DESC");
    $stmt->execute([$id]);
    $reviews = $stmt->fetchAll();
    $formatted['reviews'] = array_map(function($r) {
        return [
            'id' => (int)$r['id'],
            'userId' => (int)$r['user_id'],
            'userName' => $r['user_name'],
            'rating' => (int)$r['rating'],
            'comment' => $r['comment'],
            'date' => $r['date']
        ];
    }, $reviews);
    
    sendJSON($formatted);
}

/**
 * Create new property (Host only)
 */
function createProperty($pdo) {
    $user = requireRole($pdo, 'host');
    $data = getRequestBody();
    
    // Validation
    $required = ['name', 'location', 'price', 'type', 'description'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            sendError("Field '$field' is required");
        }
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO properties (
            name, location, price, type, rating, image, description, amenities,
            host_id, host_name, max_guests, checkin_time, checkout_time,
            location_description, cancellation_policy, available
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    try {
        $stmt->execute([
            $data['name'],
            $data['location'],
            (float)$data['price'],
            $data['type'],
            (float)($data['rating'] ?? 0),
            $data['image'] ?? null,
            $data['description'],
            json_encode($data['amenities'] ?? []),
            $user['id'],
            $user['name'],
            (int)($data['maxGuests'] ?? 4),
            $data['checkinTime'] ?? null,
            $data['checkoutTime'] ?? null,
            $data['locationDescription'] ?? null,
            $data['cancellationPolicy'] ?? null,
            (bool)($data['available'] ?? true)
        ]);
        
        $id = $pdo->lastInsertId();
        getPropertyById($pdo, $id);
    } catch (PDOException $e) {
        sendError('Failed to create property: ' . $e->getMessage(), 500);
    }
}

/**
 * Update property (Host only)
 */
function updateProperty($pdo, $id) {
    $user = requireRole($pdo, 'host');
    $data = getRequestBody();
    
    // Check if property exists and belongs to user
    $stmt = $pdo->prepare("SELECT host_id FROM properties WHERE id = ?");
    $stmt->execute([$id]);
    $property = $stmt->fetch();
    
    if (!$property) {
        sendError('Property not found', 404);
    }
    
    if ($property['host_id'] != $user['id']) {
        sendError('You can only update your own properties', 403);
    }
    
    // Build update query dynamically
    $updates = [];
    $params = [];
    
    $fields = [
        'name', 'location', 'price', 'type', 'rating', 'image', 'description',
        'amenities', 'max_guests', 'checkin_time', 'checkout_time',
        'location_description', 'cancellation_policy', 'available'
    ];
    
    foreach ($fields as $field) {
        $key = str_replace('_', '', ucwords($field, '_'));
        $key[0] = strtolower($key[0]);
        
        if (isset($data[$key])) {
            $updates[] = "$field = ?";
            if ($field === 'amenities') {
                $params[] = json_encode($data[$key]);
            } elseif ($field === 'price' || $field === 'rating') {
                $params[] = (float)$data[$key];
            } elseif ($field === 'max_guests') {
                $params[] = (int)$data[$key];
            } elseif ($field === 'available') {
                $params[] = (bool)$data[$key];
            } else {
                $params[] = $data[$key];
            }
        }
    }
    
    if (empty($updates)) {
        sendError('No fields to update');
    }
    
    $params[] = $id;
    $query = "UPDATE properties SET " . implode(', ', $updates) . " WHERE id = ?";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    getPropertyById($pdo, $id);
}

/**
 * Delete property (Host only)
 */
function deleteProperty($pdo, $id) {
    $user = requireRole($pdo, 'host');
    
    // Check if property exists and belongs to user
    $stmt = $pdo->prepare("SELECT host_id FROM properties WHERE id = ?");
    $stmt->execute([$id]);
    $property = $stmt->fetch();
    
    if (!$property) {
        sendError('Property not found', 404);
    }
    
    if ($property['host_id'] != $user['id']) {
        sendError('You can only delete your own properties', 403);
    }
    
    $stmt = $pdo->prepare("DELETE FROM properties WHERE id = ?");
    $stmt->execute([$id]);
    
    sendJSON(['message' => 'Property deleted successfully']);
}

