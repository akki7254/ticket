<?php
// admin/login.php

// --- Hardcoded Admin Credentials ---
// You can change these to whatever you like
$correct_username = 'admin';
$correct_password = 'password123';

// --- Start Session ---
session_start();

// --- Check if the form was submitted ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit();
}

// --- Get the data from the form ---
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// --- Verify Credentials ---
if ($username === $correct_username && $password === $correct_password) {
    // Credentials are correct! Start the session.
    session_regenerate_id(); // Security measure
    $_SESSION['admin_id'] = 1; // Assign a static ID
    $_SESSION['admin_username'] = $username;
    
    // Redirect to the dashboard
    header('Location: dashboard.php');
    exit();
} else {
    // Invalid credentials, redirect back to login with an error
    header('Location: index.php?error=1');
    exit();
}