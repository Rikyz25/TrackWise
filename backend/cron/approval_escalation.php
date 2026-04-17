<?php
// Increase memory and timeout for cron tasks
set_time_limit(0);
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/jwt_helper.php';
require_once __DIR__ . '/../helpers/MailHelper.php';

// BASE_URL should be the public URL of your backend
define('BASE_URL', getenv('BACKEND_URL') ?: 'https://trackwise-5x20.onrender.com/api/'); 
$db = (new Database())->getConnection();

// 1. Find pending expenses older than 1 minute that haven't been escalated
$query = "
    SELECT e.*, u.name as employee_name, u.email as employee_email, c.name as category_name
    FROM expenses e
    JOIN users u ON e.user_id = u.id
    JOIN categories c ON e.category_id = c.id
    WHERE e.status = 'pending' 
      AND e.escalated = FALSE
      AND e.created_at < (NOW() - INTERVAL '1 minute')
";

$stmt = $db->query($query);
$pending_expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($pending_expenses)) {
    echo "[" . date('Y-m-d H:i:s') . "] No expenses require escalation.\n";
    exit;
}

// 2. Get all managers who should receive the escalation
$mgr_stmt = $db->query("SELECT email, name FROM users WHERE role = 'manager'");
$managers = $mgr_stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($managers)) {
    echo "No managers found to receive escalation emails.\n";
    exit;
}

echo "Found " . count($pending_expenses) . " expenses to escalate.\n";

foreach ($pending_expenses as $expense) {
    foreach ($managers as $manager) {
        sendEscalationEmail($manager, $expense);
    }
    
    // 3. Mark as escalated
    $update = $db->prepare("UPDATE expenses SET escalated = TRUE WHERE id = :id");
    $update->execute(['id' => $expense['id']]);
    echo "Escalated expense ID: " . $expense['id'] . "\n";
}

function sendEscalationEmail($manager, $expense) {
    $expense_id = $expense['id'];
    
    // Generate secure tokens for approve/reject
    // These include the expense ID and the intended action
    $token_approve = jwt_encode(['expense_id' => $expense_id, 'action' => 'approved', 'exp' => time() + 3600*24]);
    $token_reject = jwt_encode(['expense_id' => $expense_id, 'action' => 'rejected', 'exp' => time() + 3600*24]);
    
    $approve_link = BASE_URL . "approve_direct.php?token=" . $token_approve;
    $reject_link = BASE_URL . "approve_direct.php?token=" . $token_reject;
    
    $subject = "Approval Required: Expense Submission from " . $expense['employee_name'];
    
    $message = "
    <html>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; padding: 20px;'>
        <div style='max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;'>
            <h2 style='color: #111827; margin-top: 0;'>Expense Approval Escalation</h2>
            <p>Hello {$manager['name']},</p>
            <p>An expense submitted by <strong>{$expense['employee_name']}</strong> has been pending for over an hour and requires your immediate attention.</p>
            
            <div style='background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;'>
                <table width='100%'>
                    <tr>
                        <td style='padding: 5px 0;'><strong>Employee:</strong></td>
                        <td>{$expense['employee_name']} ({$expense['employee_email']})</td>
                    </tr>
                    <tr>
                        <td style='padding: 5px 0;'><strong>Category:</strong></td>
                        <td>{$expense['category_name']}</td>
                    </tr>
                    <tr>
                        <td style='padding: 5px 0;'><strong>Amount:</strong></td>
                        <td style='color: #059669; font-weight: bold;'>₹" . number_format($expense['amount'], 2) . "</td>
                    </tr>
                    <tr>
                        <td style='padding: 5px 0; vertical-align: top;'><strong>Description:</strong></td>
                        <td>{$expense['description']}</td>
                    </tr>
                </table>
            </div>
            
            <p style='margin-bottom: 25px;'>You can approve or reject this submission directly using the buttons below:</p>
            
            <table width='100%'>
                <tr>
                    <td align='center'>
                        <a href='$approve_link' style='background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Approve Submission</a>
                    </td>
                    <td align='center'>
                        <a href='$reject_link' style='background-color: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Reject Submission</a>
                    </td>
                </tr>
            </table>
            
            <p style='font-size: 13px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; pt: 15px;'>
                Note: These links provide pre-authorized access to this specific action. Please do not forward this email.
            </p>
        </div>
    </body>
    </html>";

    // REAL EMAIL SENDING
    $sent = MailHelper::send($manager['email'], $subject, $message);
    
    if ($sent) {
        echo "Email sent successfully to: " . $manager['email'] . "\n";
    } else {
        echo "FAILED to send email to: " . $manager['email'] . "\n";
    }

    // Backup MOCK EMAIL LOGGING (Optional)
    $log_entry = "========================================\n";
    $log_entry .= "Date: " . date('Y-m-d H:i:s') . "\n";
    $log_entry .= "To: {$manager['email']} ({$manager['name']})\n";
    $log_entry .= "Subject: $subject\n";
    $log_entry .= "Status: " . ($sent ? "SENT" : "FAILED") . "\n";
    $log_entry .= "========================================\n\n";
    
    file_put_contents(__DIR__ . '/../mail_log.txt', $log_entry, FILE_APPEND);
}
?>
