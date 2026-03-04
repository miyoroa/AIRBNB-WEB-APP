<?php
/**
 * API Router - Routes requests to appropriate endpoints
 * 
 * This file handles routing when using PHP built-in server
 * For Apache, use .htaccess instead
 */

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Route to appropriate endpoint
if (preg_match('#^/api/auth/(register|login)$#', $path, $matches)) {
    $_GET['action'] = $matches[1];
    require __DIR__ . '/auth.php';
} elseif (preg_match('#^/api/properties(?:/(\d+))?$#', $path, $matches)) {
    if (isset($matches[1])) {
        $_SERVER['PATH_INFO'] = '/' . $matches[1];
    }
    require __DIR__ . '/properties.php';
} elseif (preg_match('#^/api/bookings$#', $path)) {
    require __DIR__ . '/bookings.php';
} elseif (preg_match('#^/api/host/stats$#', $path)) {
    $_SERVER['PATH_INFO'] = '/stats';
    require __DIR__ . '/host.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}

