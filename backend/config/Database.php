<?php

class Database {
    private $host = "aws-1-ap-northeast-1.pooler.supabase.com";
    private $db_name = "postgres";
    private $username = "postgres.efmwlwggluveyqrmidny";
    private $password = "IamRikyz@25";

    public function getConnection() {
        try {
            $conn = new PDO(
                "pgsql:host={$this->host};port=6543;dbname={$this->db_name}",
                $this->username,
                $this->password
            );

            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;

        } catch(PDOException $e) {
            echo json_encode(["error" => "Connection error: " . $e->getMessage()]);
            return null;
        }
    }
}