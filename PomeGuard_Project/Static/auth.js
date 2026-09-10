document.addEventListener('DOMContentLoaded', () => {
    
    // --- UTILITY: Display Messages ---
    function showMessage(type, text) {
        const messageBox = document.getElementById('message');
        if (!messageBox) return;
        
        messageBox.textContent = text;
        messageBox.className = ''; 
        messageBox.classList.add(type); 
        
        if (type === 'error') {
            setTimeout(() => {
                messageBox.style.display = 'none';
                messageBox.className = '';
            }, 6000);
        } else {
            messageBox.style.display = 'block';
        }
    }

    // ==========================================
    // 1. REGISTRATION LOGIC
    // ==========================================
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const phone_number = document.getElementById('phone_number').value;
            const password = document.getElementById('password').value;
            const submitBtn = registerForm.querySelector('button[type="submit"]');

            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://127.0.0.1:8001/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        phone_number: phone_number,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('success', '✅ Account created successfully! Redirecting to login...');
                    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                } else {
                    // --- BULLETPROOF ERROR EXTRACTOR ---
                    let errorMsg = "Registration failed.";
                    if (data && data.detail) {
                        if (typeof data.detail === 'string') {
                            errorMsg = data.detail;
                        } else if (Array.isArray(data.detail)) {
                            errorMsg = data.detail.map(err => err.msg).join(', ');
                        } else {
                            errorMsg = JSON.stringify(data.detail);
                        }
                    } else if (data && data.error) {
                        errorMsg = data.error;
                    }
                    
                    showMessage('error', `❌ ${errorMsg}`);
                    submitBtn.textContent = 'Register Now';
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Registration Error:', error);
                showMessage('error', '❌ Server Connection Error. Is FastAPI running?');
                submitBtn.textContent = 'Register Now';
                submitBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // 2. LOGIN LOGIC
    // ==========================================
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const identifier = document.getElementById('username').value; 
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            submitBtn.textContent = 'Authenticating...';
            submitBtn.disabled = true;

            const formData = new URLSearchParams();
            formData.append('username', identifier);
            formData.append('password', password);

            try {
                const response = await fetch('http://127.0.0.1:8001/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('success', '✅ Login successful! Loading dashboard...');
                    localStorage.setItem('pomoGuardToken', data.access_token);
                    setTimeout(() => { window.location.href = 'Home.html'; }, 1000);
                } else {
                    // --- BULLETPROOF ERROR EXTRACTOR ---
                    let errorMsg = "Incorrect credentials.";
                    if (data && data.detail) {
                        if (typeof data.detail === 'string') {
                            errorMsg = data.detail;
                        } else if (Array.isArray(data.detail)) {
                            errorMsg = data.detail.map(err => err.msg).join(', ');
                        } else {
                            errorMsg = JSON.stringify(data.detail);
                        }
                    }
                    showMessage('error', `❌ ${errorMsg}`);
                    submitBtn.textContent = 'Sign In';
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Login Error:', error);
                showMessage('error', '❌ Server Connection Error. Is FastAPI running?');
                submitBtn.textContent = 'Sign In';
                submitBtn.disabled = false;
            }
        });
    }
});