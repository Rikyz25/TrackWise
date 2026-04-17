<?php
// Gmail SMTP Configuration using Environment Variables
// It is recommended to set these in your hosting provider (Render/Vercel)
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'smtp.gmail.com');
define('SMTP_PORT', getenv('SMTP_PORT') ?: 587);
define('SMTP_USER', getenv('SMTP_USER') ?: 'adminm677@gmail.com');
define('SMTP_PASS', getenv('SMTP_PASS') ?: 'pcsa asef yenx kuzv'); // Fallback for local testing
define('SMTP_FROM', getenv('SMTP_FROM') ?: 'adminm677@gmail.com');
define('SMTP_FROM_NAME', getenv('SMTP_FROM_NAME') ?: 'TrackWise Notifications');
?>
