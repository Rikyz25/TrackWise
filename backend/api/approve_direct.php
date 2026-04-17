<?php
require_once '../config/Database.php';
require_once '../config/jwt_helper.php';

// Allow from any origin (minimal CORS for this endpoint)
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=UTF-8");

$token = $_GET['token'] ?? null;

if (!$token) {
    die("<h1>Invalid Request</h1><p>Missing token.</p>");
}

$payload = jwt_decode($token);

if (!$payload || !isset($payload['expense_id']) || !isset($payload['action'])) {
    die("<h1>Invalid or Expired Link</h1><p>The link might have expired or is incorrect.</p>");
}

$expense_id = $payload['expense_id'];
$action = $payload['action'];

if (!in_array($action, ['approved', 'rejected'])) {
    die("<h1>Invalid Action</h1>");
}

$db = (new Database())->getConnection();

// Check if already processed to avoid double clicking issues
$check_stmt = $db->prepare("SELECT status FROM expenses WHERE id = :id");
$check_stmt->execute(['id' => $expense_id]);
$expense = $check_stmt->fetch(PDO::FETCH_ASSOC);

if (!$expense) {
    die("<h1>Expense Not Found</h1>");
}

if ($expense['status'] !== 'pending') {
    $current_status = ucfirst($expense['status']);
    echo "
    <div style='font-family: sans-serif; text-align: center; margin-top: 50px;'>
        <h1 style='color: #666;'>Already $current_status</h1>
        <p>This expense has already been processed and is currently <strong>$current_status</strong>.</p>
        <div style='margin-top: 20px;'>
            <a href='#' onclick='window.close()' style='color: #2563eb; text-decoration: none;'>Close this window</a>
        </div>
    </div>";
    exit;
}

$update_stmt = $db->prepare("UPDATE expenses SET status = :status WHERE id = :id");
$success = $update_stmt->execute(['status' => $action, 'id' => $expense_id]);

if ($success) {
    $color = ($action === 'approved') ? '#059669' : '#dc2626';
    $icon = ($action === 'approved') ? '✅' : '❌';
    echo "
    <div style='font-family: sans-serif; text-align: center; margin-top: 50px; padding: 20px; border-radius: 12px; max-width: 400px; margin-left: auto; margin-right: auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #eee;'>
        <div style='font-size: 48px; margin-bottom: 20px;'>$icon</div>
        <h1 style='color: $color; margin-bottom: 10px;'>Expense " . ucfirst($action) . "</h1>
        <p style='color: #4b5563;'>The expense request has been successfully updated.</p>
        <div style='margin-top: 30px; border-top: 1px solid #eee; pt: 20px;'>
            <p style='font-size: 14px; color: #9ca3af;'>You can now close this tab.</p>
        </div>
    </div>";
} else {
    echo "<h1>Error</h1><p>Failed to update expense status. Please try again or login to the dashboard.</p>";
}
?>
