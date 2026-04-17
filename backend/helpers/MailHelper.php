<?php
require_once __DIR__ . '/../config/mail_config.php';

class MailHelper {
    public static function send($to, $subject, $message) {
        $host = SMTP_HOST;
        $port = SMTP_PORT;
        $user = SMTP_USER;
        $pass = SMTP_PASS;
        $from = SMTP_FROM;
        $fromName = SMTP_FROM_NAME;

        try {
            $socket = stream_socket_client("tcp://$host:$port", $errno, $errstr, 15);
            if (!$socket) throw new Exception("Could not connect: $errstr ($errno)");

            self::getResponse($socket); // 220

            $serverName = $_SERVER['SERVER_NAME'] ?? gethostname() ?? 'localhost';
            self::sendCommand($socket, "EHLO " . $serverName);
            self::sendCommand($socket, "STARTTLS");
            
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new Exception("Could not enable TLS");
            }

            $serverName = $_SERVER['SERVER_NAME'] ?? gethostname() ?? 'localhost';
            self::sendCommand($socket, "EHLO " . $serverName);
            self::sendCommand($socket, "AUTH LOGIN");
            self::sendCommand($socket, base64_encode($user));
            self::sendCommand($socket, base64_encode($pass));

            self::sendCommand($socket, "MAIL FROM:<$from>");
            self::sendCommand($socket, "RCPT TO:<$to>");
            self::sendCommand($socket, "DATA");

            $headers = [
                "MIME-Version: 1.0",
                "Content-Type: text/html; charset=UTF-8",
                "From: $fromName <$from>",
                "To: <$to>",
                "Subject: $subject",
                "Date: " . date('r')
            ];

            $data = implode("\r\n", $headers) . "\r\n\r\n" . $message . "\r\n.";
            self::sendCommand($socket, $data);
            self::sendCommand($socket, "QUIT");

            fclose($socket);
            return true;
        } catch (Exception $e) {
            error_log("Mail Error: " . $e->getMessage());
            return false;
        }
    }

    private static function sendCommand($socket, $command) {
        fwrite($socket, $command . "\r\n");
        return self::getResponse($socket);
    }

    private static function getResponse($socket) {
        $response = "";
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) == " ") break;
        }
        return $response;
    }
}
?>
