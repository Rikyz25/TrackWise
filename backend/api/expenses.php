<?php
require_once 'cors.php';
require_once '../config/Database.php';
require_once '../config/jwt_helper.php';

$auth = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER["REQUEST_METHOD"];

if ($method == "POST") {
    // Submit expense
    if ($auth['role'] !== 'employee') {
        http_response_code(403);
        echo json_encode(['error' => 'Only employees can submit expenses']);
        exit;
    }

    $amount = $_POST['amount'] ?? null;
    $category_id = $_POST['category_id'] ?? null;
    $description = $_POST['description'] ?? '';
    
    if (!$amount || !$category_id || !$description) {
        http_response_code(400);
        echo json_encode(['error' => 'Amount, category, and description are required']);
        exit;
    }

    // Handle File Upload
    $bill_path = null;
    if (isset($_FILES['bill']) && $_FILES['bill']['error'] == UPLOAD_ERR_OK) {
        $allowed_types = ['image/jpeg', 'image/png', 'application/pdf'];
        $file_type = mime_content_type($_FILES['bill']['tmp_name']);
        
        if (in_array($file_type, $allowed_types) && $_FILES['bill']['size'] < 5000000) { // 5MB limit
            $ext = pathinfo($_FILES['bill']['name'], PATHINFO_EXTENSION);
            $filename = uniqid('bill_') . '.' . $ext;
            $dest = '../uploads/' . $filename;
            
            if (move_uploaded_file($_FILES['bill']['tmp_name'], $dest)) {
                $bill_path = 'uploads/' . $filename;
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type or size exceeded']);
            exit;
        }
    }

    // Check Threshold for Auto-Approve logic
    $cat_stmt = $db->prepare("SELECT threshold FROM categories WHERE id = :id");
    $cat_stmt->execute(['id' => $category_id]);
    $category = $cat_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$category) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid category']);
        exit;
    }

    $status = ($amount <= $category['threshold']) ? 'auto_approved' : 'pending';

    $stmt = $db->prepare("INSERT INTO expenses (user_id, amount, category_id, description, bill_path, status) VALUES (:uid, :amt, :cid, :desc, :bill, :status)");
    $inserted = $stmt->execute([
        'uid' => $auth['id'],
        'amt' => $amount,
        'cid' => $category_id,
        'desc' => $description,
        'bill' => $bill_path,
        'status' => $status
    ]);

    if ($inserted) {
        http_response_code(201);
        echo json_encode(['message' => 'Expense submitted successfully', 'status' => $status]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }

} else if ($method == "GET") {
    // Get Expenses
    if (isset($_GET['user_id'])) {
        $user_id = $_GET['user_id'];
        if ($auth['role'] === 'employee' && $user_id != $auth['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'You can only view your own expenses']);
            exit;
        }

        $stmt = $db->prepare("
            SELECT e.*, c.name as category_name 
            FROM expenses e 
            JOIN categories c ON e.category_id = c.id 
            WHERE e.user_id = :uid 
            ORDER BY e.created_at DESC
        ");
        $stmt->execute(['uid' => $user_id]);
        $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate allowance dynamic
        $u_stmt = $db->prepare("SELECT allowance FROM users WHERE id = :uid");
        $u_stmt->execute(['uid' => $user_id]);
        $user_data = $u_stmt->fetch(PDO::FETCH_ASSOC);
        
        $total_approved = 0;
        foreach($expenses as &$exp) {
            $exp['amount'] = (float)$exp['amount'];
            if ($exp['status'] === 'approved' || $exp['status'] === 'auto_approved') {
                $total_approved += $exp['amount'];
            }
        }
        
        $allowance = (float)($user_data['allowance'] ?? 10000);
        $remaining = $allowance - $total_approved;

        echo json_encode([
            'expenses' => $expenses,
            'summary' => [
                'initial_allowance' => $allowance,
                'total_approved_spent' => $total_approved,
                'remaining_balance' => $remaining
            ]
        ]);
        
    } else if (isset($_GET['status']) && $_GET['status'] == 'pending') {
        if ($auth['role'] !== 'manager') {
            http_response_code(403);
            echo json_encode(['error' => 'Manager only']);
            exit;
        }

        $stmt = $db->query("
            SELECT e.*, u.name as employee_name, c.name as category_name 
            FROM expenses e 
            JOIN users u ON e.user_id = u.id 
            JOIN categories c ON e.category_id = c.id 
            WHERE e.status = 'pending' 
            ORDER BY e.created_at DESC
        ");
        
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

} else if ($method == "PUT") {
    // Approve / Reject
    if ($auth['role'] !== 'manager') {
        http_response_code(403);
        echo json_encode(['error' => 'Manager only']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->id) || !isset($data->status)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID or Status']);
        exit;
    }

    if (!in_array($data->status, ['approved', 'rejected'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status limit']);
        exit;
    }

    $stmt = $db->prepare("UPDATE expenses SET status = :status WHERE id = :id");
    if($stmt->execute(['status' => $data->status, 'id' => $data->id])) {
        echo json_encode(['message' => 'Status updated']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update']);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
