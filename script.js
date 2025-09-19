// --- Main execution block that runs when the page is ready ---
document.addEventListener('DOMContentLoaded', function() {
    // 1. Get user's email from the URL and pre-fill the form
    const params = new URLSearchParams(window.location.search);
    const userEmail = params.get('email');

    if (!userEmail) {
        window.location.href = 'index.html';
        return;
    }

    const emailInput = document.getElementById('email');
    emailInput.value = userEmail;
    
    // --- THIS LINE LOCKS THE FIELD ---
    // It visually grays out the field and makes it unclickable.
    emailInput.disabled = true;
    
    // 2. Asynchronously load data for the page
    populateCountryCodes();
    fetchTicketHistory(userEmail);

    // 3. Set up the form submission handler
    setupFormSubmitHandler();
});


/**
 * Fetches ticket history from the backend and populates the table.
 * @param {string} email - The user's email address.
 */
async function fetchTicketHistory(email) {
    const ticketTableBody = document.getElementById('ticket-history-body');
    const noTicketsMessage = document.getElementById('no-tickets-message');
    
    try {
        const response = await fetch(`fetch_tickets.php?email=${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const tickets = await response.json();
        
        ticketTableBody.innerHTML = '';

        if (tickets.length === 0) {
            noTicketsMessage.style.display = 'block';
        } else {
            noTicketsMessage.style.display = 'none';
            tickets.forEach(ticket => {
                const row = document.createElement('tr');
                const ticketDate = new Date(ticket.date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });

                row.innerHTML = `
                    <td>#${ticket.id}</td>
                    <td>${ticket.subject}</td>
                    <td>${ticketDate}</td>
                    <td><span class="status status-${ticket.status.toLowerCase()}">${ticket.status}</span></td>
                `;
                ticketTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error fetching ticket history:", error);
        ticketTableBody.innerHTML = `<tr><td colspan="4" style="color: red; text-align: center;">Could not load ticket history.</td></tr>`;
    }
}


/**
 * Fetches country codes from an API and populates the dropdown.
 */
async function populateCountryCodes() {
    // This function remains unchanged
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
 * Attaches an event listener to the main form to handle ticket submission.
 */
function setupFormSubmitHandler() {
    const ticketForm = document.querySelector('main.card form');
    const successMessageDiv = document.getElementById('success-message');

    ticketForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const submitButton = ticketForm.querySelector('.submit-btn');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // --- NEW LOGIC ADDED HERE ---
        // Temporarily re-enable the email field so its value is included in the form data
        const emailInput = document.getElementById('email');
        emailInput.disabled = false;

        const formData = new FormData(ticketForm);
        
        // Disable it again immediately after grabbing the data
        emailInput.disabled = true;
        // --- END NEW LOGIC ---

        try {
            const response = await fetch('create_ticket.php', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorResult = await response.json().catch(() => null);
                throw new Error(errorResult?.message || 'Server responded with an error.');
            }

            const result = await response.json();
            
            fetchTicketHistory(formData.get('email'));
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
                
                emailInput.value = new URLSearchParams(window.location.search).get('email');
                emailInput.disabled = true; // Re-lock the field
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