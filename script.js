// This global variable is needed to store ticket data for the modal
let userTickets = []; 

// --- Main execution block that runs when the page is ready ---
document.addEventListener('DOMContentLoaded', function() {
    populateCountryCodes();
    fetchTicketHistory();
    setupFormSubmitHandler();
    fetchAndSetUserEmail(); 
});

/**
 * Fetches the logged-in user's email from the session via a PHP script
 * and populates and locks the email field.
 */
async function fetchAndSetUserEmail() {
    try {
        const response = await fetch('get_user_email.php'); 
        const data = await response.json();
        if (data.email) {
            const emailInput = document.getElementById('email');
            emailInput.value = data.email;
            emailInput.disabled = true;
        } else {
            // If no email in session, user is not logged in, redirect
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Could not fetch user session.', error);
        window.location.href = 'index.html'; // Redirect on error
    }
}

/**
 * Fetches ticket history from the backend and populates the table.
 */
async function fetchTicketHistory() {
    const ticketTableBody = document.getElementById('ticket-history-body');
    const noTicketsMessage = document.getElementById('no-tickets-message');
    
    try {
        const response = await fetch('fetch_tickets.php'); 
        if (!response.ok) throw new Error('Network response was not ok');
        
        userTickets = await response.json(); 
        
        ticketTableBody.innerHTML = '';

        if (userTickets.length === 0) {
            noTicketsMessage.style.display = 'block';
        } else {
            noTicketsMessage.style.display = 'none';
            userTickets.forEach(ticket => {
                const row = document.createElement('tr');
                const ticketDate = new Date(ticket.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });

                row.innerHTML = `
                    <td>#${ticket.id}</td>
                    <td>${ticket.subject}</td>
                    <td>${ticketDate}</td>
                    <td><span class="status status-${ticket.status.toLowerCase()}">${ticket.status}</span></td>
                    <td><button class="view-btn" data-ticket-id="${ticket.id}">View</button></td>
                `;
                ticketTableBody.appendChild(row);
            });

            document.querySelectorAll('.view-btn').forEach(button => {
                button.addEventListener('click', function() {
                    openUserTicketModal(this.dataset.ticketId);
                });
            });
        }
    } catch (error) {
        console.error("Error fetching ticket history:", error);
        ticketTableBody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Could not load ticket history.</td></tr>`;
    }
}

/**
 * Opens a modal to show the details of a specific ticket.
 * @param {string} ticketId - The ID of the ticket to view.
 */
function openUserTicketModal(ticketId) {
    const ticket = userTickets.find(t => t.id == ticketId);
    if (!ticket) return;

    const modal = document.getElementById('user-ticket-modal');
    
    modal.querySelector('#modal-ticket-id').textContent = `Ticket #${ticket.id}`;
    
    const statusDisplay = modal.querySelector('#modal-status-display');
    statusDisplay.textContent = ticket.status;
    statusDisplay.className = `status status-${ticket.status.toLowerCase().replace(/\s/g, '-')}`;

    modal.querySelector('#modal-requester').textContent = ticket.name;
    modal.querySelector('#modal-email').textContent = ticket.email;
    modal.querySelector('#modal-phone').textContent = ticket.phone;
    modal.querySelector('#modal-date').textContent = new Date(ticket.created_at).toLocaleString('en-IN');
    modal.querySelector('#modal-subject').textContent = ticket.subject;

    const descriptionArea = modal.querySelector('#modal-description-area');
    descriptionArea.innerHTML = `<div class="comment-body">${ticket.description.replace(/\n/g, '<br>')}</div>`;
    
    const attachmentArea = modal.querySelector('#modal-attachment-area');
    if (ticket.attachment_path) {
        attachmentArea.innerHTML = `<a href="${ticket.attachment_path}" target="_blank" class="attachment-link">Download Attachment</a>`;
    } else {
        attachmentArea.innerHTML = `<p class="info-message">No attachment was provided.</p>`;
    }

    const adminCommentArea = modal.querySelector('#modal-admin-comment-area');
    if (ticket.admin_comment) {
        adminCommentArea.innerHTML = `<div class="comment-body">${ticket.admin_comment.replace(/\n/g, '<br>')}</div>`;
    } else {
        adminCommentArea.innerHTML = `<p class="info-message">No admin comment has been added yet.</p>`;
    }

    modal.style.display = 'block';

    modal.querySelector('.close-button').onclick = function() {
        modal.style.display = 'none';
    }
}

/**
 * Fetches country codes from an API.
 */
async function populateCountryCodes() {
    const selectElement = document.getElementById('country-code');
    selectElement.innerHTML = '<option>Loading...</option>';
    try {
        const geoResponse = await fetch('http://ip-api.com/json/?fields=countryCode');
        const geoData = await geoResponse.json();
        const userCountryCode = geoData.countryCode;

        const countriesResponse = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2');
        let countries = await countriesResponse.json();
        selectElement.innerHTML = '';

        countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

        countries.forEach(country => {
            if (country.idd && country.idd.root) {
                const dialCode = country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '');
                if (dialCode === '') return;
                const option = document.createElement('option');
                option.value = dialCode;
                option.textContent = `${country.cca2} (${dialCode})`;
                if (country.cca2 === userCountryCode) {
                    option.selected = true;
                }
                selectElement.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Error populating country codes:", error);
        selectElement.innerHTML = `<option value="+91">IN (+91)</option>`;
    }
}

/**
 * Handles the form submission.
 */
function setupFormSubmitHandler() {
    const ticketForm = document.getElementById('ticket-form');
    const successMessageDiv = document.getElementById('success-message');

    ticketForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const submitButton = ticketForm.querySelector('.submit-btn');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        const emailInput = document.getElementById('email');
        emailInput.disabled = false;
        const formData = new FormData(ticketForm);
        emailInput.disabled = true;

        try {
            const response = await fetch('create_ticket.php', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({ message: 'Server responded with an error.' }));
                throw new Error(errorResult.message);
            }

            const result = await response.json();
            
            fetchTicketHistory(); // Refresh history

            ticketForm.style.display = 'none';
            successMessageDiv.style.display = 'block';

            successMessageDiv.innerHTML = `
                <h3 style="text-align: center; color: #067647;">Ticket Submitted Successfully!</h3>
                <p style="text-align: center; margin-top: 10px;">
                    Your Ticket ID is <strong>#${result.ticketId}</strong>. 
                    Our support team will get back to you as soon as possible.
                </p>
                <button id="submit-another-btn" class="submit-btn" style="margin-top: 20px;">Submit Another Ticket</button>
            `;
            
            document.getElementById('submit-another-btn').addEventListener('click', () => {
                successMessageDiv.style.display = 'none';
                ticketForm.style.display = 'block';
                ticketForm.reset();
                fetchAndSetUserEmail();
                populateCountryCodes();
            });

        } catch (error) {
            alert(`Failed to submit ticket: ${error.message}`);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Ticket';
        }
    });
}