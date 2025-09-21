<?php
session_start();
if (!isset($_SESSION['user_email'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated.']);
    exit();
}
$email = $_SESSION['user_email'];

$dbHost = 'localhost';
$dbName = 'ticket';
$dbUser = 'root';
$dbPass = '';
header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Select all columns to ensure all data is available for the modal
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE email = ? ORDER BY created_at DESC");
    $stmt->execute([$email]);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($tickets);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}