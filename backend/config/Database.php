<?php
class Database {
    private $host = '127.0.0.1';
    private $db_name = 'expense_management_system';
    private $username = 'root'; // default for local xampp/wamp
    private $password = 'IamRikyz25'; // default for local
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // For testing setup purposes just die, usually log it
            http_response_code(500);
            echo json_encode(['error' => "Connection error: " . $exception->getMessage()]);
            die();
        }
        return $this->conn;
    }
}
?>
