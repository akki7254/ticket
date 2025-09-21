<?php
// get_user_email.php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_email'])) {
    echo json_encode(['email' => $_SESSION['user_email']]);
} else {
    echo json_encode(['email' => null]);
}