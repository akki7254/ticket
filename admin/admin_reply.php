<?php
// admin/update_ticket.php - A simplified version

session_start();
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Admin not logged in.']);
    exit();
}

// --- Configuration ---
$dbHost = 'localhost';
$dbName = 'ticket';
$dbUser = 'root';
$dbPass = '';
header('Content-Type: application/json');

// --- Database Connection ---
try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

// --- Receive and Validate Data ---
$ticketId = $_POST['ticket_id'] ?? 0;
$newStatus = $_POST['status'] ?? '';
// Note: your JS sends the comment as 'reply_text'
$commentText = $_POST['reply_text'] ?? '';

if (empty($ticketId) || empty($newStatus)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit();
}

// --- Update Database ---
try {
    $sql = "UPDATE tickets SET status = ?, admin_comment = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    
    // Only save the comment if the status is 'Closed'.
    // If not, we set the admin_comment to its current value to avoid overwriting it.
    $commentToSave = null;
    if ($newStatus === 'Closed') {
        $commentToSave = $commentText;
    } else {
        // Find the existing comment to preserve it
        $currentTicketStmt = $pdo->prepare("SELECT admin_comment FROM tickets WHERE id = ?");
        $currentTicketStmt->execute([$ticketId]);
        $currentTicket = $currentTicketStmt->fetch(PDO::FETCH_ASSOC);
        $commentToSave = $currentTicket['admin_comment'];
    }
    
    $stmt->execute([$newStatus, $commentToSave, $ticketId]);

    echo json_encode(['success' => true, 'message' => 'Ticket updated successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit();
}