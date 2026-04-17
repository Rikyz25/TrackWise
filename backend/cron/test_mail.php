<?php
require_once __DIR__ . '/../helpers/MailHelper.php';

echo "Testing Gmail SMTP Connection...\n";

$to = 'adminm677@gmail.com';
$subject = "SMTP Test from TrackWise";
$message = "<h1>Success!</h1><p>This is a test email to verify your Gmail SMTP configuration.</p><p>Time: " . date('Y-m-d H:i:s') . "</p>";

$sent = MailHelper::send($to, $subject, $message);

if ($sent) {
    echo "SUCCESS: Test email has been sent to $to. Please check your inbox (and Spam folder).\n";
} else {
    echo "ERROR: Failed to send test email. Check your App Password and ensure your project allows outbound connections on port 587.\n";
}
?>
