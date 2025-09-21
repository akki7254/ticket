<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard - Support Tickets</title>
    <link rel="stylesheet" href="admin-style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="dashboard-container">
        <header>
            <h1>Admin Dashboard</h1>
            <p class="subtitle">Live overview of all support tickets.</p>
            <span class="welcome-message">Welcome, <?php echo htmlspecialchars($_SESSION['admin_username']); ?>! <a href="logout.php" class="logout-link">Logout</a></span>
        </header>

        <main class="card">
            <div class="filter-search-bar">
                <div class="filter-group">
                    <label for="status-filter">Filter by Status:</label>
                    <select id="status-filter" class="filter-select">
                        <option value="All">All Tickets</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
                <div class="search-group">
                    <input type="text" id="search-input" placeholder="Search by ID, subject, or requester">
                    <button id="search-button" class="search-btn">Search</button>
                </div>
            </div>

            <div class="ticket-queue">
                <table>
                    <thead>
                        <tr>
                            <th>TICKET ID</th>
                            <th>SUBJECT</th>
                            <th>REQUESTER</th>
                            <th>DATE CREATED</th>
                            <th>STATUS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody id="ticket-queue-body">
                    </tbody>
                </table>
                <p id="no-tickets-message" class="info-message" style="display: none;">No tickets found matching your criteria.</p>
            </div>
        </main>
    </div>

    <div id="ticket-detail-modal" class="modal">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <div id="modal-header">
                <h2 id="modal-ticket-id">Ticket #XXXXX Details</h2>
                <span id="modal-status-display" class="status"></span>
            </div>

            <div class="modal-body">
                <div class="ticket-info-grid">
                    <p><strong>Requester:</strong> <span id="modal-requester"></span></p>
                    <p><strong>Email:</strong> <span id="modal-email"></span></p>
                    <p><strong>Phone:</strong> <span id="modal-phone"></span></p>
                    <p><strong>Date Created:</strong> <span id="modal-date"></span></p>
                </div>
                <p class="ticket-subject"><strong>Subject:</strong> <span id="modal-subject"></span></p>

                <h3 class="history-title">Original Description:</h3>
                <div id="modal-description-area">
                </div>

                <h3 class="history-title">Attachment:</h3>
                <div id="modal-attachment-area">
                </div>

                <div id="closing-comment-section" class="form-group">
                    <label for="modal-closing-comment">Closing Comment (Required):</label>
                    <textarea id="modal-closing-comment" name="comment_text" rows="4" placeholder="Add a final comment before closing..."></textarea>
                </div>

                <div class="form-group action-group">
                    <label for="modal-change-status">Set New Status:</label>
                    <select id="modal-change-status" name="status" class="filter-select">
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <button id="modal-update-button" class="action-btn">Update Status</button>
                </div>
            </div>
        </div>
    </div>

    <script src="admin-script.js"></script>
</body>

</html>