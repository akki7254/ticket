<?php
// config.php

// --- Database Credentials ---
define('DB_HOST', 'localhost');
define('DB_NAME', 'ticket');
define('DB_USER', 'root');
define('DB_PASS', '');

// --- Error Reporting (Useful for development) ---
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * Creates and returns a new PDO database connection object.
 * @return PDO
 */
function getDbConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
            DB_USER,
            DB_PASS
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        // For a real application, you would log this error and show a generic message.
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
        exit();
    }
}