<?php
// Always start the session at the very top of the file
session_start();

// Check if the form was submitted and if the email is not empty
if (isset($_POST['email']) && !empty($_POST['email'])) {
    
    // Store the user's email in the session
    $_SESSION['user_email'] = $_POST['email'];
    
    // Redirect the user to the ticket page
    header('Location: ticket.html');
    exit(); // Important to stop the script after redirecting

} else {
    // If no email was submitted, send them back to the login page
    header('Location: index.html');
    exit();
}