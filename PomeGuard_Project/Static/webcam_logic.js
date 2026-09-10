document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('pomoGuardToken');
    const guestBanner = document.getElementById('guestBanner');
    
    if (token && guestBanner) {
        guestBanner.style.display = 'none';
    }

    const videoElement = document.getElementById('webcamVideo');
    const capturedPreview = document.getElementById('capturedPreview');
    const captureBtn = document.getElementById('captureBtn');
    const canvas = document.getElementById('snapshotCanvas');
    const statusMessage = document.getElementById('statusMessage');
    const resultsContainer = document.getElementById('resultsContainer');
    const actionButtons = document.getElementById('actionButtons');
    const retryBtn = document.getElementById('retryBtn');
    let webcamStream = null;

    startWebcam();

    captureBtn.addEventListener('click', captureAndPredict);
    retryBtn.addEventListener('click', resetCamera);

    async function startWebcam() {
        try {
            webcamStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            videoElement.srcObject = webcamStream;
        } catch (err) {
            console.error("Camera Error: ", err);
            statusMessage.innerHTML = `<span style="color: #ef4444;">Could not access camera. Please check permissions.</span>`;
        }
    }

    async function captureAndPredict() {
        if (!webcamStream) return;

        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        videoElement.style.display = 'none';
        capturedPreview.src = imgDataUrl;
        capturedPreview.style.display = 'block';
        captureBtn.style.display = 'none';

        webcamStream.getTracks().forEach(track => track.stop());

        statusMessage.innerHTML = `<span style="color: var(--green-primary); font-weight: bold;">Analyzing...</span>`;
        resultsContainer.innerHTML = ""; 
        actionButtons.style.display = 'none'; 

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
        const formData = new FormData();
        formData.append('file', blob, 'capture.jpg');

        try {
            const response = await fetch('http://127.0.0.1:8001/predict', {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: formData
            });

            const data = await response.json();
            statusMessage.innerHTML = "";

            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            
            displayResults(data);

        } catch (error) {
            console.error("Backend Error:", error);
            statusMessage.innerHTML = "";
            resultsContainer.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px;">
                    <p style="color: #ef4444; font-weight: bold; margin-bottom: 5px;">⚠️ Connection Error</p>
                    <p style="color: #cbd5e1; font-size: 14px;">Could not reach the AI server. Is your FastAPI backend running on port 8001?</p>
                </div>`;
            actionButtons.style.display = 'flex';
        }
    }

    function resetCamera() {
        resultsContainer.innerHTML = "";
        actionButtons.style.display = 'none';
        capturedPreview.style.display = 'none';
        statusMessage.innerHTML = "";
        
        videoElement.style.display = 'block';
        captureBtn.style.display = 'block';

        startWebcam();
    }

    function displayResults(data) {
        if (data.status === "warning" || data.status === "error") {
            resultsContainer.innerHTML = `
                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 20px; border-radius: 12px; text-align: center; margin-top: 20px;">
                    <p style="color: #f59e0b; font-size: 18px; font-weight: bold;">${data.icon || '⚠️'} ${data.message}</p>
                </div>`;
            actionButtons.style.display = 'flex';
            return;
        }

        const formatList = (text) => {
            if (!text) return "No data available.";
            return text.split('\n')
                       .filter(line => line.trim() !== '')
                       .map(line => `<div style="margin-bottom: 8px; padding-left: 10px; border-left: 2px solid rgba(255,255,255,0.2);">${line}</div>`)
                       .join('');
        };

        const cleanOrganic = formatList(data.solution_organic);
        const cleanChemical = formatList(data.solution_chemical);
        
        // CHANGED: Restored back to your local files static guides directory setup
        const safeDiseaseName = data.disease.replace(/\s+/g, '_');
        const pdfLink = `guides/${safeDiseaseName}_Guide.pdf`;
        const buttonText = data.disease === 'Healthy' ? "Download Orchard Maintenance Guide" : `Download ${data.disease} Treatment Guide`;

        resultsContainer.innerHTML = `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 16px; padding: 24px; margin-top: 20px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <p style="color: var(--text-gray); font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Detected Pathogen</p>
                    <h2 style="font-size: 28px; font-weight: 800; color: var(--green-primary); margin: 8px 0;">${data.disease}</h2>
                    <p style="font-size: 15px; font-weight: bold; color: var(--text-white); margin-bottom: 12px;">Confidence: <span style="color: var(--green-primary);">${data.confidence}</span></p>
                    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; max-width: 90%; margin: 0 auto;">${data.description}</p>
                </div>
                
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 240px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-top: 3px solid var(--green-primary); padding: 16px; border-radius: 8px;">
                        <h4 style="color: var(--green-primary); margin-bottom: 12px; font-size: 15px; text-align: center;"> Organic</h4>
                        <div style="color: var(--text-white); font-size: 14px;">${cleanOrganic}</div>
                    </div>
                    
                    <div style="flex: 1; min-width: 240px; background: rgba(248, 113, 113, 0.05); border: 1px solid rgba(248, 113, 113, 0.2); border-top: 3px solid #f87171; padding: 16px; border-radius: 8px;">
                        <h4 style="color: #f87171; margin-bottom: 12px; font-size: 15px; text-align: center;"> Chemical</h4>
                        <div style="color: var(--text-white); font-size: 14px;">${cleanChemical}</div>
                    </div>
                </div>

                <div style="margin-top: 24px; text-align: center;">
                    <a href="${pdfLink}" target="_blank" download class="action-btn" style="padding: 12px 24px; color: var(--green-primary); text-decoration: none; border: 1px solid var(--green-primary); border-radius: 8px; display: inline-block;">
                        ${buttonText}
                    </a>
                </div>
            </div>
        `;
        actionButtons.style.display = 'flex';
    }
});