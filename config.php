<?php
// config.php

// --- Azure MySQL Database Credentials ---
define('DB_HOST', 'anan.mysql.database.azure.com');
define('DB_NAME', 'ticket');
define('DB_USER', 'Akash');
define('DB_PASS', 'main@25802580'); // <-- YOUR CORRECT PASSWORD
define('DB_PORT', '3306');

/**
 * Creates and returns a new PDO database connection object.
 * @return PDO
 */
function getDbConnection() {
    try {
        // --- SECURE SSL Options for Azure ---
        $ssl_options = [
            PDO::MYSQL_ATTR_SSL_CA => __DIR__ . '/DigiCertGlobalRootG2.crt.pem',
            PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true,
        ];
        
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME,
            DB_USER,
            DB_PASS,
            $ssl_options
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}