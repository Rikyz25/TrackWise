<?php
require_once 'cors.php';
require_once '../config/Database.php';
require_once '../config/jwt_helper.php';

$auth = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER["REQUEST_METHOD"];

if ($method == "POST") {

    // Only employees can submit
    if ($auth['role'] !== 'employee') {
        http_response_code(403);
        echo json_encode(['error' => 'Only employees can submit expenses']);
        exit;
    }

    // ✅ Read JSON input (FIXED)
    $data = json_decode(file_get_contents("php://input"), true);

    $amount = $data['amount'] ?? null;
    $category_id = $data['category_id'] ?? null;
    $description = $data['description'] ?? '';

    // ✅ Proper validation (FIXED)
    if ($amount === null || $category_id === null || $description === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Amount, category, and description are required']);
        exit;
    }

    // ❌ File upload removed (not compatible with JSON requests)
    $bill_path = null;

    // ✅ Get category threshold
    $cat_stmt = $db->prepare("SELECT threshold FROM categories WHERE id = :id");
    $cat_stmt->execute(['id' => $category_id]);
    $category = $cat_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$category) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid category']);
        exit;
    }

    // ✅ Status logic
    $status = ($amount <= $category['threshold']) ? 'auto_approved' : 'pending';

    // ✅ Insert expense
    $stmt = $db->prepare("
        INSERT INTO expenses (user_id, amount, category_id, description, bill_path, status) 
        VALUES (:uid, :amt, :cid, :desc, :bill, :status)
    ");

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
        echo json_encode([
            'message' => 'Expense submitted successfully',
            'status' => $status   // ✅ THIS FIXES "undefined"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }

} else if ($method == "GET") {

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

        // ✅ Calculate allowance
        $u_stmt = $db->prepare("SELECT allowance FROM users WHERE id = :uid");
        $u_stmt->execute(['uid' => $user_id]);
        $user_data = $u_stmt->fetch(PDO::FETCH_ASSOC);

        $total_approved = 0;
        foreach ($expenses as &$exp) {
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

    if ($auth['role'] !== 'manager') {
        http_response_code(403);
        echo json_encode(['error' => 'Manager only']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id']) || !isset($data['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID or Status']);
        exit;
    }

    if (!in_array($data['status'], ['approved', 'rejected'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status']);
        exit;
    }

    $stmt = $db->prepare("UPDATE expenses SET status = :status WHERE id = :id");

    if ($stmt->execute(['status' => $data['status'], 'id' => $data['id']])) {
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