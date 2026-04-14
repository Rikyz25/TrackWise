<?php
require_once 'cors.php';
require_once '../config/Database.php';
require_once '../config/jwt_helper.php';

$auth = require_auth();

if ($auth['role'] !== 'manager') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$db = (new Database())->getConnection();

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$whereClause = "WHERE e.status IN ('approved', 'auto_approved')";
$params = [];

if ($search !== '') {
    $whereClause .= " AND (u.name LIKE :search OR c.name LIKE :search OR e.description LIKE :search)";
    $params['search'] = "%$search%";
}

// Count total for pagination
$countQuery = "SELECT COUNT(*) as total FROM expenses e 
               JOIN users u ON e.user_id = u.id 
               JOIN categories c ON e.category_id = c.id 
               $whereClause";
$countStmt = $db->prepare($countQuery);
$countStmt->execute($params);
$total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

// Fetch data
$query = "SELECT e.id, e.amount, e.description, e.bill_path, e.status, e.created_at, 
                 u.name as employee_name, 
                 c.name as category_name 
          FROM expenses e 
          JOIN users u ON e.user_id = u.id 
          JOIN categories c ON e.category_id = c.id 
          $whereClause 
          ORDER BY e.created_at DESC 
          LIMIT $limit OFFSET $offset";

$stmt = $db->prepare($query);
$stmt->execute($params);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'data' => $data,
    'pagination' => [
        'total' => (int)$total,
        'page' => $page,
        'limit' => $limit,
        'total_pages' => ceil($total / $limit)
    ]
]);
?>
