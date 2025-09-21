<?php
// admin/fetch_ticket_details.php
session_start();
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Admin not logged in.']);
    exit();
}

// --- Centralized Database Connection ---
// The path goes UP one directory to the root where config.php is
require_once '../config.php';
$pdo = getDbConnection();

// --- General Config ---
header('Content-Type: application/json');

$ticketId = $_GET['id'] ?? 0;
if (!$ticketId) {
    http_response_code(400);
    echo json_encode(['error' => 'Ticket ID is required.']);
    exit();
}

// --- Fetch Data (from the 'tickets' table ONLY) ---
try {
    // This query now only selects from the tickets table
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ?");
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        http_response_code(404);
        echo json_encode(['error' => 'Ticket not found.']);
        exit();
    }
    
    // The response is now much simpler and doesn't include a 'comments' array
    echo json_encode(['ticket' => $ticket]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}