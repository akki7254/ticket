<?php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Admin not logged in.']);
    exit();
}

header('Content-Type: application/json');

$dbHost = 'localhost';
$dbName = 'ticket';
$dbUser = 'root';
$dbPass = '';

// --- THIS IS THE CORRECTED LINE ---
// The name of the parameter in the URL is 'id'
$ticketId = $_GET['id'] ?? 0;

if (!$ticketId) {
    http_response_code(400);
    echo json_encode(['error' => 'Ticket ID is required.']);
    exit();
}

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get main ticket details
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ?");
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get all comments for that ticket
    $stmt = $pdo->prepare("SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC");
    $stmt->execute([$ticketId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$ticket) {
        http_response_code(404);
        echo json_encode(['error' => 'No ticket found for ID ' . $ticketId]);
        exit();
    }

    // Combine ticket and comments into a single response
    $response = [
        'ticket' => $ticket,
        'comments' => $comments
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}