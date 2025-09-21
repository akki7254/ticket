<?php
// admin/update_ticket.php
session_start();
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Admin not logged in.']);
    exit();
}

// --- Centralized Database Connection ---
require_once '../config.php';
$pdo = getDbConnection();

// --- General Config ---
header('Content-Type: application/json');

// --- Receive and Validate Data ---
$ticketId = $_POST['ticket_id'] ?? 0;
$newStatus = $_POST['status'] ?? '';
// Note: This name must match what your JavaScript sends
$commentText = $_POST['comment'] ?? ''; 

if (empty($ticketId) || empty($newStatus)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit();
}

// --- Update Database ---
try {
    $sql = "UPDATE tickets SET status = ?, admin_comment = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    
    // Determine what to save in the admin_comment column
    $commentToSave = null;
    if ($newStatus === 'Closed') {
        // If closing, save the new comment.
        $commentToSave = $commentText;
    } else {
        // If not closing, preserve the existing comment (if any).
        $currentTicketStmt = $pdo->prepare("SELECT admin_comment FROM tickets WHERE id = ?");
        $currentTicketStmt->execute([$ticketId]);
        $currentTicket = $currentTicketStmt->fetch(PDO::FETCH_ASSOC);
        $commentToSave = $currentTicket['admin_comment'];
    }
    
    // Execute the final update
    $stmt->execute([$newStatus, $commentToSave, $ticketId]);

    echo json_encode(['success' => true, 'message' => 'Ticket updated successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}