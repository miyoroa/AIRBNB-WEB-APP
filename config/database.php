<?php
/**
 * Database Configuration
 * Safari Stays - Airbnb-style Web App
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'safari_stays');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// JWT Secret (should match Node.js version or update)
define('JWT_SECRET', 'safari-stays-secret-key-change-in-production');

// CORS settings
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Get database connection
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}

/**
 * Send JSON response
 */
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    sendJSON(['error' => $message], $statusCode);
}

/**
 * Get request body as JSON
 */
function getRequestBody() {
    $json = file_get_contents('php://input');
    return json_decode($json, true);
}

/**
 * Get authorization token from header
 */
function getAuthToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

