<?php
require_once 'cors.php';
require_once '../config/Database.php';
require_once '../config/jwt_helper.php';

$auth = require_auth();
$db = (new Database())->getConnection();

$method = $_SERVER["REQUEST_METHOD"];

if ($method == "GET") {
    // List all categories
    $stmt = $db->query("SELECT * FROM categories");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // cast numbers correctly
    foreach($categories as &$cat) {
        $cat['threshold'] = (float)$cat['threshold'];
        $cat['id'] = (int)$cat['id'];
    }
    
    echo json_encode($categories);
} 
else if ($method == "PUT") {
    // Only Manager
    if ($auth['role'] !== 'manager') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->id) || !isset($data->threshold)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing category ID or new threshold']);
        exit;
    }
    
    $stmt = $db->prepare("UPDATE categories SET threshold = :val WHERE id = :id");
    if($stmt->execute(['val' => $data->threshold, 'id' => $data->id])) {
        echo json_encode(['message' => 'Category updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update category']);
    }
} 
else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
