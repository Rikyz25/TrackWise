<?php
require_once 'cors.php';
require_once '../config/Database.php';
require_once '../config/jwt_helper.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->email) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }

    $db = (new Database())->getConnection();
    
    $stmt = $db->prepare("SELECT id, name, email, password_hash, role, allowance FROM users WHERE email = :email");
    $stmt->execute(['email' => $data->email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if($user && password_verify($data->password, $user['password_hash'])) {
        $token = jwt_encode([
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name']
        ]);

        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'allowance' => (float)$user['allowance']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
