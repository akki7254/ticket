<?php
// --- Database Configuration for XAMPP ---
$dbHost = 'localhost';
$dbName = 'ticket';
$dbUser = 'root';
$dbPass = '';

// --- General Config ---
header('Content-Type: application/json');
$uploadDir = 'uploads/';
$attachmentPath = null;

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
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$subject = $_POST['subject'] ?? '';
$description = $_POST['description'] ?? '';
$fullPhone = ($_POST['country-code'] ?? '') . ($_POST['phone'] ?? '');

if (empty($name) || empty($email) || empty($subject) || empty($description)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit();
}

// --- Handle File Upload ---
if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    if (!is_dir($uploadDir)) { mkdir($uploadDir, 0755, true); }
    $fileTmpPath = $_FILES['attachment']['tmp_name'];
    $fileName = basename($_FILES['attachment']['name']);
    $fileSize = $_FILES['attachment']['size'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
    $destPath = $uploadDir . $newFileName;

    if ($fileSize > 2097152) { // 2MB
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
    $stmt->execute([$name, $email, $fullPhone, $subject, $description, $attachmentPath]);
    $newTicketId = $pdo->lastInsertId();

    // Send a success response back to the frontend
    echo json_encode(['success' => true, 'ticketId' => $newTicketId]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create ticket in database: ' . $e->getMessage()]);
}