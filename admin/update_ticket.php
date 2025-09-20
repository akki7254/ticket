<?php
// admin/update_ticket.php
session_start();
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Admin not logged in.']);
    exit();
}

$dbHost = 'localhost';
$dbName = 'ticket';
$dbUser = 'root';
$dbPass = '';
header('Content-Type: application/json');

// --- Receive Data ---
$ticketId = $_POST['ticket_id'] ?? 0;
$newStatus = $_POST['status'] ?? '';
$commentText = $_POST['reply_text'] ?? '';

if (empty($ticketId) || empty($newStatus)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit();
}

// --- Database Connection ---
try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // --- Update the ticket in the database ---
    $sql = "UPDATE tickets SET status = ?, admin_comment = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    
    // Only save the comment if the status is 'Closed'
    // If the status is not 'Closed', keep the existing comment
    $commentToSave = ($newStatus === 'Closed') ? $commentText : null; 
    
    // If you want to PRESERVE old comments when changing to a non-closed status,
    // you would need an extra query. This version clears the comment if not closing.

    $stmt->execute([$newStatus, $commentToSave, $ticketId]);

    echo json_encode(['success' => true, 'message' => 'Ticket updated successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}