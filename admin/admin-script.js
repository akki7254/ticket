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

function openTicketDetailModal(ticketId) {
    currentTicketId = ticketId;
    const modal = document.getElementById('ticket-detail-modal');
    // Find the ticket data from the master list we already fetched
    const ticket = allTickets.find(t => t.id == ticketId);

    if (!ticket) {
        alert('Could not find ticket details.');
        return;
    }

    modal.style.display = 'flex';
    
    // Populate the modal with data
    document.getElementById('modal-ticket-id').textContent = `Ticket #${ticket.id} Details`;
    
    const statusDisplay = document.getElementById('modal-status-display');
    statusDisplay.textContent = ticket.status;
    statusDisplay.className = `status status-${ticket.status.toLowerCase().replace(/\s/g, '-')}`;

    document.getElementById('modal-requester').textContent = ticket.name;
    document.getElementById('modal-email').textContent = ticket.email;
    document.getElementById('modal-phone').textContent = ticket.phone;
    document.getElementById('modal-date').textContent = new Date(ticket.created_at).toLocaleString('en-IN');
    document.getElementById('modal-subject').textContent = ticket.subject;

    // Populate the description and attachment area
    const descriptionArea = document.getElementById('modal-description-area');
    const attachmentArea = document.getElementById('modal-attachment-area');

    descriptionArea.innerHTML = `<div class="comment-body">${ticket.description.replace(/\n/g, '<br>')}</div>`;

    if (ticket.attachment_path) {
        attachmentArea.innerHTML = `<a href="../${ticket.attachment_path}" target="_blank" class="attachment-link">Download Attachment</a>`;
    } else {
        attachmentArea.innerHTML = `<p class="info-message" style="font-size: 0.9em;">No attachment provided.</p>`;
    }

    // Logic for the conditional comment box
    const statusSelect = document.getElementById('modal-change-status');
    const closingCommentSection = document.getElementById('closing-comment-section');
    const updateButton = document.getElementById('modal-update-button');
    const closingCommentTextarea = document.getElementById('modal-closing-comment');

    statusSelect.value = ticket.status;
    closingCommentTextarea.value = ticket.admin_comment || '';

    const updateUI = () => {
        if (statusSelect.value === 'Closed') {
            closingCommentSection.style.display = 'block';
            updateButton.textContent = 'Add Comment & Close';
        } else {
            closingCommentSection.style.display = 'none';
            updateButton.textContent = 'Update Status';
        }
    };
    
    updateUI(); // Set initial state
    statusSelect.onchange = updateUI;
    
    // Attach event listeners
    document.querySelector('.close-button').onclick = () => modal.style.display = 'none';
    updateButton.onclick = () => handleUpdateTicket();
}

async function handleUpdateTicket() {
    const newStatus = document.getElementById('modal-change-status').value;
    const closingComment = document.getElementById('modal-closing-comment').value.trim();
    const updateButton = document.getElementById('modal-update-button');

    if (newStatus === 'Closed' && !closingComment) {
        alert('A closing comment is required to close the ticket.');
        return;
    }

    updateButton.disabled = true;
    updateButton.textContent = 'Updating...';

    const formData = new FormData();
    formData.append('ticket_id', currentTicketId);
    formData.append('status', newStatus);
    formData.append('comment', closingComment);
    
    try {
        const response = await fetch('update_ticket.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Server error.');
        
        alert('Ticket updated successfully!');
        document.getElementById('ticket-detail-modal').style.display = 'none';
        
        // Update the master list locally to avoid a full refresh
        const ticketIndex = allTickets.findIndex(t => t.id == currentTicketId);
        if (ticketIndex > -1) {
            allTickets[ticketIndex].status = newStatus;
            allTickets[ticketIndex].admin_comment = newStatus === 'Closed' ? closingComment : allTickets[ticketIndex].admin_comment;
        }
        renderTickets(); // Re-render the table with the updated local data

    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        updateButton.disabled = false;
    }
}