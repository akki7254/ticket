<?php
// admin/fetch_all_tickets.php
session_start();
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Admin not logged in.']);
    exit();
}

// --- Centralized Database Connection ---
// The path must go UP one directory to the root where config.php is
require_once '../config.php';
$pdo = getDbConnection();

// --- General Config ---
header('Content-Type: application/json');

// --- Fetch Data ---
try {
    // Fetch all tickets, sorting by status first, then by the newest date
    $stmt = $pdo->query("SELECT * FROM tickets ORDER BY FIELD(status, 'Open', 'In Progress', 'Closed'), created_at DESC");
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($tickets);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}