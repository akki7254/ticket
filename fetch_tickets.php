<?php
// --- Database Configuration for XAMPP ---
$dbHost = 'localhost';
$dbName = 'ticket';
$dbUser = 'root';
$dbPass = ''; // Default XAMPP password is an empty string

// --- Response Headers ---
header('Content-Type: application/json');

// --- Create a new PDO database connection ---
try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// --- Get Email from Query Parameter ---
$email = $_GET['email'] ?? '';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email parameter is required.']);
    exit();
}

// --- Prepare and Execute SQL Query ---
// We select `created_at` and rename it to `date` so it matches what the JavaScript expects.
$sql = "SELECT id, subject, status, created_at AS date FROM tickets WHERE email = ? ORDER BY created_at DESC";

try {
    // Use a prepared statement to prevent SQL injection
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email]);

    // Fetch all matching tickets
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Send the results back to the frontend
    echo json_encode($tickets);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch tickets: ' . $e->getMessage()]);
}