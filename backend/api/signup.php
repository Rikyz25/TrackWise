<?php
require_once 'cors.php';
require_once '../config/Database.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->name) || !isset($data->email) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Name, email, and password are required']);
        exit;
    }

    $db = (new Database())->getConnection();
    
    // Check if email already exists
    $checkStmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $checkStmt->execute(['email' => $data->email]);
    if ($checkStmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'Email already registered']);
        exit;
    }

    $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
    // Role is always 'employee' by default as per requirement
    $role = 'employee';
    $allowance = 10000.00; // default starting allowance

    $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, role, allowance) VALUES (:name, :email, :pass, :role, :allowance)");
    
    if($stmt->execute([
        'name' => $data->name,
        'email' => $data->email,
        'pass' => $hashed_password,
        'role' => $role,
        'allowance' => $allowance
    ])) {
        http_response_code(201);
        echo json_encode(['message' => 'Employee registered successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to register employee']);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
