Project Setup and Deployment Guide

Overview
- Monorepo with three parts:
  - backend: Node.js/Express API (MongoDB, JWT auth)
  - frontend: Next.js app (App Router)
  - python: report generator (CSV/SQLite output under reports/)

Prerequisites
- Node.js 18+
- npm 9+
- Python 3.10+
- MongoDB Atlas URI (or local MongoDB)

Directory Structure
```
backend/
frontend/
python/
reports/            # generated CSV/DB/JSON reports
```

Environment Variables
Create a .env file in backend/ with:
```
PORT=5000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<a_secure_random_string>
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Create a .env.local file in frontend/ (optional):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Local Development
1) Install dependencies
```
cd backend && npm install
cd ../frontend && npm install
```

2) Run backend
```
cd backend
npm start
# server on http://localhost:5000
```

3) Run frontend
```
cd frontend
npm run dev
# app on http://localhost:3000
```

Authentication Notes
- Cookies are set with httpOnly and secure only in production.
- Frontend axios is configured for withCredentials and 401 redirect handling.

Python Reports
Location
- Scripts live in python/ and write outputs to reports/ (already in repo root).

Virtual Environment
```
cd python
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate
```

Dependencies
```
pip install -r requirements.txt  # if present
# If no requirements.txt, typical deps:
pip install pandas sqlite-utils
```

Run the script
```
cd python
python report_generator.py
# outputs saved to ../reports/
```

Deployment
Backend (Render)
1) Create a new Web Service
- Build Command: npm install
- Start Command: node index.js (run from backend/)
- Root Directory: backend
- Environment: Node 18

2) Environment variables (Render)
- PORT: 10000 (Render provides; your app will read process.env.PORT)
- MONGODB_URI: <Atlas connection string>
- JWT_SECRET: <secure string>
- CORS_ORIGIN: https://<your-vercel-domain>
- NODE_ENV: production

3) Health
- After deploy, API base URL will be like https://<service>.onrender.com/api

Frontend (Vercel)
1) Import the repo on Vercel and set Root Directory to frontend
2) Environment Variable
- NEXT_PUBLIC_API_BASE_URL=https://<your-render-domain>/api
3) Build/Output
- Framework: Next.js
- Build Command: npm install && npm run build
- Output Directory: . (Next.js defaults)
4) Domains
- Assign a domain; ensure CORS_ORIGIN on Render matches this domain

Python Reports in Production
- Option A: Run locally and upload outputs somewhere (S3, etc.)
- Option B: Host a separate job (e.g., GitHub Actions/Render Cron) that runs python/report_generator.py and writes to a storage bucket
- This repo assumes local runs produce outputs to reports/

Common Issues
- Budgets not showing on Profile: ensure you re-create budgets after 2025-09 schema fix and that cookies are set; backend must be on 5000 locally, frontend on 3000.
- Duplicate email error: backend returns message and frontend shows it on Register page.

FAQ
- Where should .venv live? In python/.venv (not committed). The reports/ folder stays in repo root; the script writes there by default.


