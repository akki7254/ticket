<?php
// admin/fetch_ticket_details.php
session_start();
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    exit();
}

$dbHost = 'localhost';
$dbName = 'ticket';
$dbUser = 'root';
$dbPass = '';
header('Content-Type: application/json');

$ticketId = $_GET['id'] ?? 0;
if (!$ticketId) {
    http_response_code(400);
    exit();
}

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Only fetches from the 'tickets' table now
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ?");
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        http_response_code(404);
        exit();
    }
    
    // The response is now simpler
    echo json_encode(['ticket' => $ticket]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}