<?php
session_start();
// --- Centralized Database Connection ---
require_once 'config.php';
$pdo = getDbConnection();

// --- General Config ---
header('Content-Type: application/json');
$uploadDir = 'attachment/';
$attachmentPath = null;

// --- Security Check: Use session email ---
if (!isset($_SESSION['user_email'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not authenticated.']);
    exit();
}
$email = $_SESSION['user_email']; // Use the secure session email

// --- Receive and Validate Data ---
$name = $_POST['name'] ?? '';
$subject = $_POST['subject'] ?? '';
$description = $_POST['description'] ?? '';
$fullPhone = ($_POST['country-code'] ?? '') . ($_POST['phone'] ?? '');

if (empty($name) || empty($subject) || empty($description)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit();
}

// --- Handle File Upload ---
if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    if (!is_dir($uploadDir)) { mkdir($uploadDir, 0755, true); }
    $fileTmpPath = $_FILES['attachment']['tmp_name'];
    $fileName = basename($_FILES['attachment']['name']);
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
    $destPath = $uploadDir . $newFileName;

    if ($_FILES['attachment']['size'] > 2097152) { // 2MB
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File is too large. Max 2MB.']);
        exit();
    }
    if(move_uploaded_file($fileTmpPath, $destPath)) {
        $attachmentPath = $destPath;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error moving uploaded file.']);
        exit();
    }
}

// --- Store in Database ---
$sql = "INSERT INTO tickets (name, email, phone, subject, description, attachment_path) VALUES (?, ?, ?, ?, ?, ?)";
try {
    $stmt = $pdo->prepare($sql);
    // Use the secure session email for the insert query
    $stmt->execute([$name, $email, $fullPhone, $subject, $description, $attachmentPath]);
    $newTicketId = $pdo->lastInsertId();
    $formattedTicketId = sprintf('%05d', $newTicketId);

    // Send a success response back to the frontend
    echo json_encode(['success' => true, 'ticketId' => $formattedTicketId]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create ticket in database.']);
}