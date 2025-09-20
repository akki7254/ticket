// admin/admin-script.js

let allTickets = []; // This will store a copy of all tickets from the server
let currentTicketId = null; // To track which ticket is open in the modal

document.addEventListener('DOMContentLoaded', function() {
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Attach event listeners for filtering and searching
    statusFilter.addEventListener('change', renderTickets);
    searchButton.addEventListener('click', renderTickets);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            renderTickets();
        }
    });

    // Initial fetch of all tickets when the page loads
    fetchAndRenderTickets();
});

async function fetchAndRenderTickets() {
    const tableBody = document.getElementById('ticket-queue-body');
    tableBody.innerHTML = '<tr><td colspan="6" class="info-message">Loading tickets...</td></tr>';

    try {
        const response = await fetch('fetch_all_tickets.php');
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        allTickets = await response.json(); // Store the master list of tickets
        renderTickets(); // Render the tickets based on default filters
    } catch (error) {
        console.error("Error fetching tickets:", error);
        tableBody.innerHTML = '<tr><td colspan="6" class="info-message" style="color: red;">Failed to load tickets.</td></tr>';
    }
}

function renderTickets() {
    const tableBody = document.getElementById('ticket-queue-body');
    const noTicketsMessage = document.getElementById('no-tickets-message');
    const statusFilter = document.getElementById('status-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    tableBody.innerHTML = ''; // Clear existing rows

    // Start with the full list and apply filters
    let filteredTickets = allTickets;

    // 1. Apply Status Filter
    if (statusFilter !== 'All') {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
    }

    // 2. Apply Search Filter
    if (searchTerm) {
        filteredTickets = filteredTickets.filter(ticket =>
            ticket.id.toString().includes(searchTerm) ||
            ticket.subject.toLowerCase().includes(searchTerm) ||
            ticket.email.toLowerCase().includes(searchTerm)
        );
    }

    // 3. Display the results
    if (filteredTickets.length > 0) {
        noTicketsMessage.style.display = 'none';
        filteredTickets.forEach(ticket => {
            const row = document.createElement('tr');
            const date = new Date(ticket.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
            row.innerHTML = `
                <td>#${ticket.id}</td>
                <td>${ticket.subject}</td>
                <td>${ticket.email}</td>
                <td>${date}</td>
                <td><span class="status status-${ticket.status.toLowerCase().replace(/\s/g, '-')}">${ticket.status}</span></td>
                <td><button class="action-btn view-ticket-btn" data-ticket-id="${ticket.id}">View</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners to the new "View" buttons
        document.querySelectorAll('.view-ticket-btn').forEach(button => {
            button.addEventListener('click', () => {
                const ticketId = button.dataset.ticketId;
                openTicketDetailModal(ticketId);
            });
        });

    } else {
        noTicketsMessage.style.display = 'block';
    }
}


async function openTicketDetailModal(ticketId) {
    currentTicketId = ticketId;
    const modal = document.getElementById('ticket-detail-modal');
    modal.style.display = 'flex';
    
    // Display a loading message
    modal.querySelector('#modal-ticket-id').textContent = 'Loading...';
    modal.querySelector('#modal-conversation-history').innerHTML = '';
    
    try {
        const response = await fetch(`fetch_ticket_details.php?id=${ticketId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch ticket details.');
        }
        
        const data = await response.json();
        const { ticket, comments } = data;

        // Populate the modal with the fetched data
        modal.querySelector('#modal-ticket-id').textContent = `Ticket #${ticket.id} Details`;
        
        const statusDisplay = modal.querySelector('#modal-status-display');
        statusDisplay.textContent = ticket.status;
        statusDisplay.className = `status status-${ticket.status.toLowerCase().replace(/\s/g, '-')}`;

        modal.querySelector('#modal-requester').textContent = ticket.name;
        modal.querySelector('#modal-email').textContent = ticket.email;
        modal.querySelector('#modal-phone').textContent = ticket.phone;
        modal.querySelector('#modal-date').textContent = new Date(ticket.created_at).toLocaleString('en-IN');
        modal.querySelector('#modal-subject').textContent = ticket.subject;

        modal.querySelector('#modal-conversation-history').innerHTML = renderComments(comments);
        
        const statusSelect = modal.querySelector('#modal-change-status');
        const updateButton = modal.querySelector('#modal-update-button');
        const closingCommentSection = modal.querySelector('#closing-comment-section');

        statusSelect.value = ticket.status;
        
        // --- THIS FUNCTION CALL FIXES THE LOGIC ---
        updateModalUI(statusSelect.value); // Set initial state of comment box and button

        statusSelect.onchange = () => updateModalUI(statusSelect.value);
        updateButton.onclick = () => handleUpdateTicket();
        modal.querySelector('.close-button').onclick = () => modal.style.display = 'none';

    } catch (error) {
        console.error("Error opening modal:", error);
        modal.querySelector('#modal-ticket-id').textContent = 'Error';
        modal.querySelector('#modal-conversation-history').innerHTML = '<p style="color:red;">Could not load ticket details.</p>';
    }
}

function updateModalUI(status) {
    const modal = document.getElementById('ticket-detail-modal');
    const closingCommentSection = modal.querySelector('#closing-comment-section');
    const updateButton = modal.querySelector('#modal-update-button');

    if (status === 'Closed') {
        closingCommentSection.style.display = 'block';
        updateButton.textContent = 'Add Comment & Close';
    } else {
        closingCommentSection.style.display = 'none';
        updateButton.textContent = 'Update Status';
    }
}

function renderComments(comments) {
    if (!comments || comments.length === 0) return '<p class="info-message">No conversation history.</p>';
    return comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="author">${comment.author_email}</span> on ${new Date(comment.created_at).toLocaleString('en-IN')}
            </div>
            <div class="comment-body">${comment.comment_text.replace(/\n/g, '<br>')}</div>
            ${comment.attachment_path ? 
                `<a href="../${comment.attachment_path}" target="_blank" class="attachment-link">Download Attachment</a>` : ''}
        </div>
    `).join('');
}


async function handleUpdateTicket() {
    const modal = document.getElementById('ticket-detail-modal');
    const newStatus = modal.querySelector('#modal-change-status').value;
    const closingComment = modal.querySelector('#modal-closing-comment').value.trim();
    const updateButton = modal.querySelector('#modal-update-button');

    if (newStatus === 'Closed' && !closingComment) {
        alert('A closing comment is required to close the ticket.');
        return;
    }

    updateButton.disabled = true;
    updateButton.textContent = 'Updating...';

    const formData = new FormData();
    formData.append('ticket_id', currentTicketId);
    formData.append('status', newStatus);
    formData.append('reply_text', newStatus === 'Closed' ? closingComment : 'Status updated by admin.');
    
    try {
        const response = await fetch('admin_reply.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Server error.');
        
        alert('Ticket updated successfully!');
        modal.style.display = 'none';
        fetchAndRenderTickets();

    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        updateButton.disabled = false;
        // Button text will be reset when modal is next opened
    }
}