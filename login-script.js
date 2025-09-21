// login-script.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            // This is the old URL-based redirect logic
            // If you are using the session-based login, this form should
            // submit directly to login.php and this JS is not needed.
            // But if you're using the JS redirect, this is the correct way.
            event.preventDefault(); 
            const email = document.getElementById('email').value;
            if (email) {
                window.location.href = `ticket.html?email=${encodeURIComponent(email)}`;
            }
        });
    }
});