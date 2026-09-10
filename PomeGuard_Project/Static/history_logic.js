document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CHECK FOR LOGIN ---
    const token = localStorage.getItem('pomoGuardToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // --- 2. GET ELEMENTS ---
    const historyContainer = document.getElementById('history-container');
    const loader = document.getElementById('history-loader');
    // --- NEW: Get the delete button ---
    const deleteBtn = document.getElementById('delete-history-btn');

    // --- NEW: Add click listener for the delete button ---
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteHistory);
    }

    // --- 3. FETCH HISTORY FROM BACKEND ---
    async function fetchHistory() {
        try {
            const response = await fetch('http://127.0.0.1:8001/history', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }

            const data = await response.json();
            displayHistory(data.history);

        } catch (error) {
            console.error('Error fetching history:', error);
            loader.textContent = 'Could not load history.';
            loader.style.color = 'red';
        }
    }

    // --- 4. DISPLAY HISTORY ON THE PAGE (with the % fix) ---
    function displayHistory(historyItems) {
        loader.style.display = 'none';

        if (historyItems.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">You have no prediction history yet.</p>';
            // Disable delete button if there's no history
            if(deleteBtn) deleteBtn.disabled = true;
            return;
        }

        // Enable delete button
        if(deleteBtn) deleteBtn.disabled = false;

        let tableHTML = `
            <table id="history-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Predicted Disease</th>
                        <th>Confidence</th>
                    </tr>
                </thead>
                <tbody>
        `;

        historyItems.forEach(item => {
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleString('en-IN', { 
                day: 'numeric', month: 'short', year: 'numeric', 
                hour: 'numeric', minute: '2-digit', hour12: true 
            });

            const confidencePercent = (item.confidence * 100).toFixed(2);

            tableHTML += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${item.disease_name}</td>
                    <td>${confidencePercent}%</td> 
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        historyContainer.innerHTML = tableHTML;
    }

    // --- NEW: Function to handle the delete button click ---
    async function handleDeleteHistory() {
        // Ask for confirmation
        if (!confirm('Are you sure you want to delete all your prediction history? This cannot be undone.')) {
            return; // Stop if the user clicks "Cancel"
        }

        try {
            const response = await fetch('http://127.0.0.1:8001/history', {
                method: 'DELETE', // Use the DELETE method
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to delete history');
            }

            // Success!
            // We just need to clear the table from the screen.
            displayHistory([]); // Call displayHistory with an empty array

        } catch (error) {
            console.error('Error deleting history:', error);
            alert('Could not delete history. Please try again.');
        }
    }

    // --- 5. RUN THE FUNCTION ---
    fetchHistory();
});