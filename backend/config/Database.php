<?php

class Database {
    private $host = "db.efmwlwggluveqyrmidny.supabase.co";
    private $db_name = "postgres";
    private $username = "postgres";
    private $password = "IamRikyz@25";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "pgsql:host=" . $this->host . ";port=5432;dbname=" . $this->db_name,
                $this->username,
                $this->password
            );

            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        } catch(PDOException $exception) {
            echo json_encode(["error" => $exception->getMessage()]);
        }

        return $this->conn;
    }
}