<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Login</title>
    <link rel="stylesheet" href="admin-style.css">
</head>
<body>
    <div class="login-container">
        <main class="card">
            <h1>Admin Login</h1>
            <?php if (isset($_GET['error'])): ?>
                <p class="error-message">Invalid username or password.</p>
            <?php endif; ?>
            <form action="login.php" method="POST">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="submit-btn">Login</button>
            </form>
        </main>
    </div>
</body>
</html>