<?php
// admin/fetch_ticket_details.php
session_start();
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Admin not logged in.']);
    exit();
}

$dbHost = 'localhost';
$dbName = 'ticket'; // Make sure this is correct
$dbUser = 'root';
$dbPass = '';
header('Content-Type: application/json');

$ticketId = $_GET['id'] ?? 0;
if (!$ticketId) {
    http_response_code(400);
    echo json_encode(['error' => 'Ticket ID is required.']);
    exit();
}

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 1. Get main ticket details
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ?");
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Get all comments for that ticket
    $stmt = $pdo->prepare("SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC");
    $stmt->execute([$ticketId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Combine them into a single response
    $response = [
        'ticket' => $ticket,
        'comments' => $comments
    ];
    
    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' ' . $e->getMessage()]);
}