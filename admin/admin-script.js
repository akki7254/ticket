// admin/admin-script.js

let allTickets = []; // Store all fetched tickets
let currentFilters = {
    status: 'All',
    search: ''
};

document.addEventListener('DOMContentLoaded', function() {
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Attach event listeners for filter and search
    statusFilter.addEventListener('change', () => {
        currentFilters.status = statusFilter.value;
        renderTickets();
    });

    searchButton.addEventListener('click', () => {
        currentFilters.search = searchInput.value.toLowerCase();
        renderTickets();
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchButton.click(); // Trigger search on Enter key
        }
    });

    // Initial fetch of tickets when the page loads
    fetchAndRenderTickets();
});

async function fetchAndRenderTickets() {
    const tableBody = document.getElementById('ticket-queue-body');
    const noTicketsMessage = document.getElementById('no-tickets-message');
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Loading tickets...</td></tr>';
    noTicketsMessage.style.display = 'none';

    try {
        const response = await fetch('fetch_all_tickets.php');
        if (!response.ok) throw new Error('Network response was not ok.');
        allTickets = await response.json(); // Store all tickets
        renderTickets(); // Render with initial filters (All Tickets, empty search)
    } catch (error) {
        console.error("Error fetching tickets:", error);
        tableBody.innerHTML = '<tr><td colspan="6" style="color: red; text-align: center; padding: 20px;">Failed to load tickets.</td></tr>';
    }
}

function renderTickets() {
    const tableBody = document.getElementById('ticket-queue-body');
    const noTicketsMessage = document.getElementById('no-tickets-message');
    tableBody.innerHTML = ''; // Clear existing rows

    let filteredTickets = allTickets;

    // Apply status filter
    if (currentFilters.status !== 'All') {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === currentFilters.status);
    }

    // Apply search filter
    if (currentFilters.search) {
        const searchTerm = currentFilters.search;
        filteredTickets = filteredTickets.filter(ticket =>
            ticket.id.toString().includes(searchTerm) ||
            ticket.subject.toLowerCase().includes(searchTerm) ||
            ticket.email.toLowerCase().includes(searchTerm)
        );
    }

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

        // Attach event listeners to the new "View" buttons
        document.querySelectorAll('.view-ticket-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const ticketId = event.target.dataset.ticketId;
                openTicketDetailModal(ticketId);
            });
        });

    } else {
        noTicketsMessage.style.display = 'block';
    }
}


// Function to open the modal (we will build this out in the next step)
function openTicketDetailModal(ticketId) {
    alert(`Opening modal for ticket ID: ${ticketId}`);
    // This is where you would fetch detailed info for the specific ticket
    // and populate the modal.
}