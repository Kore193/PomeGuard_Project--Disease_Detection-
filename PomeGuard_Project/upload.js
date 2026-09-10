document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('pomoGuardToken');

    // UI Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    const statusMessage = document.getElementById('statusMessage');
    const resultsContainer = document.getElementById('resultsContainer');
    const postAnalysisButtons = document.getElementById('postAnalysisButtons');
    const newUploadBtn = document.getElementById('newUploadBtn');

    let selectedFile = null;

    // --- Drag & Drop Events ---
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // --- File Handling ---
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        selectedFile = file;
        
        // Read file for preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            dropZone.style.display = 'none';
            previewContainer.style.display = 'flex';
            
            // This forces the "Choose Another" and "Analyze" buttons to appear
            previewContainer.querySelector('.action-button-group').style.display = 'flex';
            
            resultsContainer.innerHTML = '';
            postAnalysisButtons.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    // --- Reset ---
    resetBtn.addEventListener('click', resetUploader);
    newUploadBtn.addEventListener('click', resetUploader);

    function resetUploader() {
        selectedFile = null;
        fileInput.value = '';
        imagePreview.src = '';
        
        previewContainer.style.display = 'none';
        resultsContainer.innerHTML = '';
        statusMessage.innerHTML = '';
        postAnalysisButtons.style.display = 'none';
        
        dropZone.style.display = 'flex';
    }

    // --- Analyze Image ---
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // Hide preview buttons, show loading state
        previewContainer.querySelector('.action-button-group').style.display = 'none';
        statusMessage.innerHTML = `<span style="color: var(--green-primary); font-weight: bold;">Uploading and Analyzing...</span>`;

        const formData = new FormData();
        formData.append('file', selectedFile);

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
                    <p style="color: #cbd5e1; font-size: 14px;">Could not reach the AI server.</p>
                </div>`;
            postAnalysisButtons.style.display = 'flex';
        }
    });

    // --- Display Results ---
    function displayResults(data) {
        if (data.status === "warning" || data.status === "error") {
            resultsContainer.innerHTML = `
                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 20px; border-radius: 12px; text-align: center; margin-top: 20px;">
                    <p style="color: #f59e0b; font-size: 18px; font-weight: bold;">${data.icon || '⚠️'} ${data.message}</p>
                </div>`;
            postAnalysisButtons.style.display = 'flex';
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
        
        // CHANGED: Reverted back to your local files layout mapping matrix structure
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
                        <h4 style="color: var(--green-primary); margin-bottom: 12px; font-size: 15px; text-align: center;">🌱 Organic</h4>
                        <div style="color: var(--text-white); font-size: 14px;">${cleanOrganic}</div>
                    </div>
                    
                    <div style="flex: 1; min-width: 240px; background: rgba(248, 113, 113, 0.05); border: 1px solid rgba(248, 113, 113, 0.2); border-top: 3px solid #f87171; padding: 16px; border-radius: 8px;">
                        <h4 style="color: #f87171; margin-bottom: 12px; font-size: 15px; text-align: center;">🧪 Chemical</h4>
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
        postAnalysisButtons.style.display = 'flex';
    }
});