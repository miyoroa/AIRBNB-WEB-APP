<?php
/**
 * Host Dashboard API Endpoints
 */

require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();
$path = $_SERVER['PATH_INFO'] ?? '';

switch ($method) {
    case 'GET':
        if ($path === '/stats' || $path === '/stats/') {
            getHostStats($pdo);
        } else {
            sendError('Endpoint not found', 404);
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

/**
 * Get host statistics
 */
function getHostStats($pdo) {
    $user = requireRole($pdo, 'host');
    
    // Get property count
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM properties WHERE host_id = ?");
    $stmt->execute([$user['id']]);
    $propertyCount = $stmt->fetch()['count'];
    
    // Get total bookings
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM bookings b 
        JOIN properties p ON b.property_id = p.id 
        WHERE p.host_id = ?
    ");
    $stmt->execute([$user['id']]);
    $bookingCount = $stmt->fetch()['count'];
    
    // Get total revenue
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(b.total_price), 0) as revenue 
        FROM bookings b 
        JOIN properties p ON b.property_id = p.id 
        WHERE p.host_id = ? AND b.status = 'confirmed'
    ");
    $stmt->execute([$user['id']]);
    $revenue = $stmt->fetch()['revenue'];
    
    // Get average rating
    $stmt = $pdo->prepare("
        SELECT COALESCE(AVG(rating), 0) as avg_rating 
        FROM properties 
        WHERE host_id = ?
    ");
    $stmt->execute([$user['id']]);
    $avgRating = $stmt->fetch()['avg_rating'];
    
    sendJSON([
        'properties' => (int)$propertyCount,
        'bookings' => (int)$bookingCount,
        'revenue' => (float)$revenue,
        'averageRating' => round((float)$avgRating, 2)
    ]);
}

