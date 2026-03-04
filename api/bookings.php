<?php
/**
 * Bookings API Endpoints
 */

require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

switch ($method) {
    case 'GET':
        getBookings($pdo);
        break;
        
    case 'POST':
        createBooking($pdo);
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

/**
 * Get user's bookings
 */
function getBookings($pdo) {
    $user = requireAuth($pdo);
    
    $query = "SELECT b.*, p.name as property_name, p.location, p.image 
              FROM bookings b 
              JOIN properties p ON b.property_id = p.id 
              WHERE b.user_id = ? 
              ORDER BY b.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$user['id']]);
    $bookings = $stmt->fetchAll();
    
    $formatted = array_map(function($b) {
        return [
            'id' => (int)$b['id'],
            'propertyId' => (int)$b['property_id'],
            'propertyName' => $b['property_name'],
            'location' => $b['location'],
            'image' => $b['image'],
            'checkIn' => $b['check_in'],
            'checkOut' => $b['check_out'],
            'guests' => (int)$b['guests'],
            'totalPrice' => (float)$b['total_price'],
            'status' => $b['status'],
            'createdAt' => $b['created_at']
        ];
    }, $bookings);
    
    sendJSON($formatted);
}

/**
 * Create new booking (Booker only)
 */
function createBooking($pdo) {
    $user = requireRole($pdo, 'booker');
    $data = getRequestBody();
    
    // Validation
    $required = ['propertyId', 'checkIn', 'checkOut', 'guests'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            sendError("Field '$field' is required");
        }
    }
    
    // Get property
    $stmt = $pdo->prepare("SELECT * FROM properties WHERE id = ? AND available = 1");
    $stmt->execute([$data['propertyId']]);
    $property = $stmt->fetch();
    
    if (!$property) {
        sendError('Property not found or not available', 404);
    }
    
    // Check dates
    $checkIn = new DateTime($data['checkIn']);
    $checkOut = new DateTime($data['checkOut']);
    $now = new DateTime();
    
    if ($checkIn < $now) {
        sendError('Check-in date must be in the future');
    }
    
    if ($checkOut <= $checkIn) {
        sendError('Check-out date must be after check-in date');
    }
    
    // Check guests
    if ($data['guests'] > $property['max_guests']) {
        sendError("Maximum guests allowed is {$property['max_guests']}");
    }
    
    // Calculate total price
    $nights = $checkIn->diff($checkOut)->days;
    $totalPrice = $property['price'] * $nights;
    
    // Create booking
    $stmt = $pdo->prepare("
        INSERT INTO bookings (property_id, user_id, check_in, check_out, guests, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    ");
    
    try {
        $stmt->execute([
            $data['propertyId'],
            $user['id'],
            $data['checkIn'],
            $data['checkOut'],
            $data['guests'],
            $totalPrice
        ]);
        
        $bookingId = $pdo->lastInsertId();
        
        sendJSON([
            'message' => 'Booking created successfully',
            'bookingId' => (int)$bookingId,
            'totalPrice' => $totalPrice,
            'nights' => $nights
        ], 201);
    } catch (PDOException $e) {
        sendError('Failed to create booking: ' . $e->getMessage(), 500);
    }
}

