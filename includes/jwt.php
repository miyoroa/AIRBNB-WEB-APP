<?php
/**
 * JWT Token Handling
 */

/**
 * Generate JWT token
 */
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + (7 * 24 * 60 * 60); // 7 days
    $payload = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Verify and decode JWT token
 */
function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignatureCheck = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if ($base64UrlSignature !== $base64UrlSignatureCheck) {
        return null;
    }
    
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

/**
 * Get current user from token
 */
function getCurrentUser($pdo) {
    $token = getAuthToken();
    if (!$token) {
        return null;
    }
    
    $payload = verifyJWT($token);
    if (!$payload) {
        return null;
    }
    
    $stmt = $pdo->prepare("SELECT id, email, name, role FROM users WHERE id = ?");
    $stmt->execute([$payload['id']]);
    return $stmt->fetch();
}

/**
 * Require authentication
 */
function requireAuth($pdo) {
    $user = getCurrentUser($pdo);
    if (!$user) {
        sendError('Authentication required', 401);
    }
    return $user;
}

/**
 * Require specific role
 */
function requireRole($pdo, $requiredRole) {
    $user = requireAuth($pdo);
    if ($user['role'] !== $requiredRole) {
        sendError('Insufficient permissions', 403);
    }
    return $user;
}

