<?php
// admin/fetch_all_tickets.php
session_start();
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Admin not logged in.']);
    exit();
}

// --- Database Configuration ---
$dbHost = 'localhost';
$dbName = 'tickets';
$dbUser = 'root';
$dbPass = '';
header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Fetch all tickets, sorting by status first, then by the newest date
    $stmt = $pdo->query("
        SELECT * FROM tickets 
        ORDER BY 
            FIELD(status, 'Open', 'In Progress', 'Closed'), 
            created_at DESC
    ");
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($tickets);

} catch (PDOException $e) {
    http_response_code(500);
    // For debugging, you can be more specific:
    echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()]);
}