<?php
// Simple JWT Implementation for zero-dependency "Core PHP" requirement
define('JWT_SECRET', 'trackwise_super_secret_key_123!@#');

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

function jwt_encode($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (60 * 60 * 24); // 1 day expiration
    $payload_encoded = json_encode($payload);

    $base64_url_header = base64url_encode($header);
    $base64_url_payload = base64url_encode($payload_encoded);

    $signature = hash_hmac('sha256', $base64_url_header . "." . $base64_url_payload, JWT_SECRET, true);
    $base64_url_signature = base64url_encode($signature);

    return $base64_url_header . "." . $base64_url_payload . "." . $base64_url_signature;
}

function jwt_decode($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return false;

    list($header, $payload, $signature) = $parts;

    $valid_signature = base64url_encode(hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true));

    if (!hash_equals($valid_signature, $signature)) return false;

    $decoded_payload = json_decode(base64url_decode($payload), true);
    if (isset($decoded_payload['exp']) && $decoded_payload['exp'] < time()) {
        return false; // Expired
    }

    return $decoded_payload;
}

function get_bearer_token() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function require_auth() {
    $token = get_bearer_token();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication token required']);
        exit;
    }
    $decoded = jwt_decode($token);
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }
    return $decoded;
}
?>
