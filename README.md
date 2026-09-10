# PomeGuard_Project-(Disease_Detection)
My Final Year (B.Tech-CSE) Major Project - Disease Detection For Pomegranate Fruit Using Advanced AI Techniques
Markdown# 🍎 PomeGuard: AI-Powered Pomegranate Disease Detection & Decision Support System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![ResNet34](https://img.shields.io/badge/Model-ResNet34-orange?style=flat)](https://roboflow.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**PomeGuard** is an automated agricultural diagnostic tool designed to help pomegranate farmers detect foliar and fruit pathologies in real time. Using a fine-tuned deep learning convolutional neural network (**ResNet34**), the platform classifies diseases from leaf and fruit imagery captured via live webcam feeds or manual uploads. It provides a dual-treatment matrix (Organic and Chemical remedies) and offers offline, downloadable treatment guides.

---

## 📌 Key Features

* **Real-time Webcam Capture & Upload Analysis:** Direct hardware video interfacing via browser `navigator.mediaDevices.getUserMedia` APIs and drag-and-drop file upload capabilities.
* **ResNet34 Deep Learning Architecture:** Deep residual learning model trained on local orchard samples, reaching **98.9% validation accuracy**.
* **Protective Guard Classes:** Includes a `Not_Pomegranate` negative baseline to filter out irrelevant imagery (e.g., non-plant items, backgrounds) and prevent erroneous database writes.
* **Dual Actionable Treatment Matrix:** Displays curated **Organic** (cultural practices, biocontrol) and **Chemical** (fungicide/bactericide dosages) treatment plans mapped from a relational database.
* **Offline PDF Guides:** Client-side routing to localized disease remediation guides (`guides/`) for field-readiness under low-connectivity conditions.
* **Stateless JWT Security & Password Hashing:** User accounts protected using **Bcrypt** cryptographic password salting and stateless **JSON Web Token (JWT)** session headers.
* **Scan History Audit Ledger:** Farmer scans and prediction telemetry are tracked dynamically in MySQL for historical analytics and farm management.

---

## 🏛️ System Architecture

PomeGuard utilizes a standard **Three-Tier Architecture** separating the client user interface, asynchronous application logic, and relational storage.

```text
[ Browser Client UI ]
  ├── HTML5 / Glassmorphic CSS3
  └── Vanilla JavaScript (Fetch API / getUserMedia / Canvas)
            │
      (HTTP POST + JWT Bearer Token)
            ▼
[ Application Logic Tier (FastAPI) ]
  ├── JWT Auth Middleware & Bcrypt Verification
  ├── Uvicorn ASGI Server (Port: 8001)
  └── InferenceHTTPClient ──(Cloud API)──► [ Hosted ResNet34 Model ]
            │                                  (98.9% Accuracy)
       (SQL Queries)
            ▼
[ Relational Storage Tier (MySQL) ]
  └── pomeguard_db (users, diseases, scan_history, contact_messages)
🔬 Pathogen Classification ScopePathogen ClassCausative Agent / TypeCharacteristic SymptomsBacterial BlightXanthomonas axonopodis pv. punicaeWater-soaked dark lesions on leaves, cracking on fruitsAnthracnoseColletotrichum gloeosporioidesCircular, dark brown to black sunken spots on leaves/rindAlternariaAlternaria alternataConcentric rings forming target-board-like leaf spotsCercosporaCercospora punicaeIrregular grayish-brown spots with prominent marginsHealthyN/A (Baseline Control)Normal vegetative leaf and fruit tissuesNot_PomegranateOutlier Filter ClassNon-agricultural or irrelevant images🛠️ Tech StackFrontend: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript (ES6+ Asynchronous Fetch, HTML5 Canvas API)Backend: FastAPI (Python), Uvicorn (ASGI Server), PydanticMachine Learning: ResNet34 (Residual Network), Roboflow Inference SDKDatabase: MySQL (MariaDB / XAMPP Stack), mysql-connector-pythonAuthentication & Security: Python-Jose (JWT), Passlib (Bcrypt)📁 Repository StructurePlaintextpomeguard/
│
├── guides/                             # Static disease treatment guides (PDFs)
│   ├── Bacterial_Blight_Guide.pdf
│   ├── Anthracnose_Guide.pdf
│   ├── Alternaria_Guide.pdf
│   ├── Cercospora_Guide.pdf
│   └── Healthy_Guide.pdf
│
├── templates/                          # Application pages
│   ├── index.html                      # Main landing & dashboard
│   ├── login.html                      # Authentication gateway
│   ├── webcam.html                     # Live video capture interface
│   └── upload.html                     # Drag-and-drop file upload interface
│
├── static/                             # Static UI assets (CSS, branding logos)
├── upload.js                           # Upload interface client logic
├── webcam.js                           # Hardware camera capture & canvas logic
├── main.py                             # Core FastAPI application & REST endpoints
├── database_setup.sql                  # Database schema definitions & seed rows
├── requirements.txt                    # Project Python dependencies
└── README.md                           # Project documentation
⚙️ Installation & Setup1. PrerequisitesPython 3.10+XAMPP (or a standalone MySQL server)Active internet connection for model inference calls2. Database InitializationStart Apache and MySQL through your XAMPP Control Panel.Open http://localhost/phpmyadmin in your browser.Create a new database named pomeguard_db.Import the provided database_setup.sql file (or run your initialization script) to configure the users, diseases, scan_history, and contact_messages tables.3. Clone Repository & Setup EnvironmentBash# Clone the repository
git clone [https://github.com/your-username/pomeguard.git](https://github.com/your-username/pomeguard.git)
cd pomeguard

# Create and activate a Python virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
(If you do not have a requirements.txt file yet, install directly:)Bashpip install fastapi uvicorn mysql-connector-python inference-sdk passlib jose[cryptography] pydantic
4. Running the Backend ServerLaunch the FastAPI application using Uvicorn:Bashpython main.py
The application backend will start and listen at http://127.0.0.1:8001.5. Launch the Client InterfaceOpen templates/index.html or templates/login.html directly in any modern browser, or serve the directory via an HTTP server extension (such as Live Server in VS Code).👥 Engineering Team & AcknowledgmentsThis project was built as a capstone engineering effort with distinct areas of responsibility:Domain Data Collector & Field Researcher: Field trips to commercial pomegranate orchards across the Solapur district to gather high-resolution raw leaf and fruit datasets; compiled master agricultural treatment records.AI & Computer Vision Engineer: Image pre-processing, augmentation pipeline design, hyperparameter tuning, model training, and integration of the ResNet34 classifier via Roboflow.Backend & Database Architect: System architecture, FastAPI REST API implementation, database schema modeling, JWT token flows, and Bcrypt security layers.Full-Stack Frontend Developer: Responsive glassmorphic UI engineering, asynchronous browser state management, camera hardware stream integration (getUserMedia), and client-side document routing.📄 LicenseThis project is licensed under the MIT License - see the LICENSE file for details.
