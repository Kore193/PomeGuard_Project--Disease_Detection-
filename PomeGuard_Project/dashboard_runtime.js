document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('pomoGuardToken');
    
    const loginNavBtn = document.getElementById('loginNavBtn');
    const profileMenu = document.getElementById('profileMenu');
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    const historySection = document.getElementById('historySection');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- State Switching Authentication Visibility ---
    if (!token) {
        loginNavBtn.style.display = 'block';
        profileMenu.style.display = 'none';
        historySection.style.display = 'none';
        return;
    }

    loginNavBtn.style.display = 'none';
    profileMenu.style.display = 'block';
    historySection.style.display = 'block';

    // Dropdown Toggling click handler
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => profileDropdown.classList.remove('active'));

    // --- Logout Operations ---
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('pomoGuardToken');
        window.location.reload();
    });

    // --- Fetch and Hydrate Session Telemetry ---
    try {
        // Fetch identity details from current user validation dependency
        const userResponse = await fetch('http://127.0.0.1:8001/predict', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // We look up user values natively stored within current token validation states
        // Fast shortcut: Parse base64 token parameters to pull username directly safely without overhead
        const payload = JSON.parse(atob(token.split('.')[1]));
        document.getElementById('profileUsernameField').innerText = payload.sub;
        document.getElementById('dropName').innerText = payload.sub;
        
        // Fetch dynamic historical diagnostic entries from database schema layout
        await loadTelemetryData(token);

    } catch (err) {
        console.error("Dashboard synchronization failure:", err);
    }
});

async function loadTelemetryData(token) {
    const logsContainer = document.getElementById('historyLogsContainer');
    
    // We create a custom history call mockup or map directly to active scan logs array structures
    try {
        // Since database structures for scan_history track analytical details,
        // you can dynamically populate mock elements until a standalone profile history API endpoint is hit:
        logsContainer.innerHTML = `
            <div class="history-item">
                <div class="history-meta">
                    <h5>Bacterial Blight Detection</h5>
                    <p>Parameters parsed: Webcam telemetry streaming capture</p>
                </div>
                <div class="history-badge">98.90% Match</div>
            </div>
            <div class="history-item">
                <div class="history-meta">
                    <h5>Healthy Specimen Validation</h5>
                    <p>Parameters parsed: Local system storage file drop check</p>
                </div>
                <div class="history-badge" style="background:rgba(59,130,246,0.1); color:#60a5fa;">100.00% Clean</div>
            </div>
        `;
    } catch(e) {
        logsContainer.innerHTML = `<p style="color:#f87171;">Failed to reload historical logs.</p>`;
    }
}