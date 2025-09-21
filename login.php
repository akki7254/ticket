<?php
// login.php

// This MUST be the very first line in the file.
session_start();

// Check if the form was submitted via POST and if the email is not empty
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['email'])) {
    
    // Store the user's email in the session variable
    $_SESSION['user_email'] = $_POST['email'];
    
    // Redirect the user to the ticket page
    header('Location: ticket.html');
    exit(); // Important to stop the script after redirecting

} else {
    // If something went wrong, send them back to the login page
    header('Location: index.html');
    exit();
}