<?php
// admin/login.php
session_start();

$correct_username = 'admin';
$correct_password = 'admin'; // You can change this

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username === $correct_username && $password === $correct_password) {
        $_SESSION['admin_id'] = 1;
        $_SESSION['admin_username'] = $username;
        header('Location: dashboard.php');
        exit();
    }
}
// If login fails or is not a POST request, redirect back
header('Location: index.php?error=1');
exit();