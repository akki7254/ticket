<?php
require_once 'config.php'; // Correct path
$pdo = getDbConnection();

session_start();
if (!isset($_SESSION['user_email'])) {
    http_response_code(401);
    exit();
}
$email = $_SESSION['user_email'];

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE email = ? ORDER BY created_at DESC");
    $stmt->execute([$email]);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($tickets);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}