<?php
/**
 * Router for PHP Built-in Server
 * 
 * Usage: php -S localhost:8000 router.php
 */

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Serve static files if they exist
if ($path !== '/' && file_exists(__DIR__ . $path) && !is_dir(__DIR__ . $path)) {
    return false; // Serve the file
}

// Route API requests
if (strpos($path, '/api/') === 0) {
    // Remove /api prefix and route
    $apiPath = substr($path, 4);
    
    if (preg_match('#^/auth/(register|login)$#', $apiPath, $matches)) {
        $_GET['action'] = $matches[1];
        require __DIR__ . '/api/auth.php';
        exit;
    } elseif (preg_match('#^/properties(?:/(\d+))?$#', $apiPath, $matches)) {
        if (isset($matches[1])) {
            $_SERVER['PATH_INFO'] = '/' . $matches[1];
        }
        require __DIR__ . '/api/properties.php';
        exit;
    } elseif ($apiPath === '/bookings') {
        require __DIR__ . '/api/bookings.php';
        exit;
    } elseif ($apiPath === '/host/stats') {
        $_SERVER['PATH_INFO'] = '/stats';
        require __DIR__ . '/api/host.php';
        exit;
    }
}

// Serve index.html for root and other routes
if ($path === '/' || !file_exists(__DIR__ . $path)) {
    if (file_exists(__DIR__ . '/index.html')) {
        require __DIR__ . '/index.html';
    } else {
        http_response_code(404);
        echo "File not found";
    }
    exit;
}

