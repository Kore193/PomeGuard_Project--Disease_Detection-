# PomeGuard_Project-(Disease_Detection)
My Final Year (B.Tech-CSE) Major Project - Disease Detection For Pomegranate Fruit Using Advanced AI Techniques


# 🍎 PomeGuard: AI-Powered Pomegranate Disease Detection & Decision Support System

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
