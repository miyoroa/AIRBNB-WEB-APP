<?php
/**
 * Authentication API Endpoints
 */

require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

// Get the action from URL path or query parameter
$path = $_SERVER['PATH_INFO'] ?? $_SERVER['REQUEST_URI'] ?? '';
$action = '';

if (strpos($path, '/register') !== false || isset($_GET['action']) && $_GET['action'] === 'register') {
    $action = 'register';
} elseif (strpos($path, '/login') !== false || isset($_GET['action']) && $_GET['action'] === 'login') {
    $action = 'login';
}

switch ($method) {
    case 'POST':
        if ($action === 'register') {
            registerUser($pdo);
        } elseif ($action === 'login') {
            loginUser($pdo);
        } else {
            sendError('Invalid action. Use /api/auth/register or /api/auth/login', 400);
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

/**
 * Register a new user
 */
function registerUser($pdo) {
    $data = getRequestBody();
    
    // Validation
    if (empty($data['email']) || empty($data['password']) || empty($data['name']) || empty($data['role'])) {
        sendError('All fields are required');
    }
    
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format');
    }
    
    if (strlen($data['password']) < 6) {
        sendError('Password must be at least 6 characters');
    }
    
    if (!in_array($data['role'], ['booker', 'host'])) {
        sendError('Invalid role. Must be "booker" or "host"');
    }
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        sendError('Email already registered', 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert user
    $stmt = $pdo->prepare("
        INSERT INTO users (email, password, name, role) 
        VALUES (?, ?, ?, ?)
    ");
    
    try {
        $stmt->execute([$data['email'], $hashedPassword, $data['name'], $data['role']]);
        $userId = $pdo->lastInsertId();
        
        // Generate JWT token
        $token = generateJWT([
            'id' => $userId,
            'email' => $data['email'],
            'role' => $data['role']
        ]);
        
        sendJSON([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $data['email'],
                'name' => $data['name'],
                'role' => $data['role']
            ]
        ], 201);
    } catch (PDOException $e) {
        sendError('Registration failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Login user
 */
function loginUser($pdo) {
    $data = getRequestBody();
    
    if (empty($data['email']) || empty($data['password'])) {
        sendError('Email and password are required');
    }
    
    // Find user
    $stmt = $pdo->prepare("SELECT id, email, password, name, role FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($data['password'], $user['password'])) {
        sendError('Invalid email or password', 401);
    }
    
    // Generate JWT token
    $token = generateJWT([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);
    
    sendJSON([
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role']
        ]
    ]);
}

