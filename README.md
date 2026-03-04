# Erl Jay Ramas — Project Portfolio

A collection of full-stack applications, security tools, and AI-powered utilities showcasing modern web development, systems design, and cybersecurity fundamentals.

---

## Projects

### 1. Freelancer Project Management Platform
> Full-stack project management system for freelancers, clients, and admins.

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 7 |
| Backend | FastAPI, SQLAlchemy, JWT |
| Database | PostgreSQL (SQLite fallback) |
| DevOps | Docker Compose, Nginx, Gunicorn |

**Features:**
- JWT authentication with role-based access control (Admin / Client / Freelancer)
- Project CRUD, proposals, task management
- Role-specific dashboards and admin panel
- One-click Docker deployment (`docker compose up --build -d`)
- Database seeding with demo accounts

---

### 2. AI Resume Analyzer
> Client-side resume analysis tool — no backend, no API keys, runs entirely in the browser.

| Tech | HTML, CSS, JavaScript |
|------|----------------------|

**Features:**
- NLP-based writing quality feedback
- Keyword matching against job descriptions
- 3 analysis modes: Balanced, Strict ATS, Creative Coach
- Weighted ATS scoring with semantic fit
- Priority gap detection and bullet rewrite suggestions
- PDF and TXT upload support
- ATS risk flags

---

### 3. StorePOS
> Modern point-of-sale system with offline-first architecture.

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS, Zustand |
| Backend | Node.js, Express, SQLite, JWT |

**Features:**
- Click-and-go checkout with real-time cart
- Multiple payment methods (Cash / Card / E-Wallet)
- Product CRUD with categories and low-stock alerts
- Daily, weekly, and monthly sales reports with profit monitoring
- Role management (Admin / Manager / Cashier)
- Offline-first with automatic sync

---

### 4. Web-Based Vulnerability Scanner
> Flask-powered web vulnerability scanning dashboard.

| Tech | Python, Flask, ReportLab, SQLite |
|------|----------------------------------|

**Features:**
- Target validation and scope guard (private/loopback restriction)
- Multi-threaded TCP port scanning
- Service detection and banner grabbing
- HTTP security header and TLS checks
- Risk scoring (Low / Medium / High)
- HTML and PDF report export
- Scan history stored in SQLite

---

### 5. Developer Portfolio
> Personal portfolio site with custom animations and interactive UI.

| Tech | HTML, CSS, JavaScript |
|------|----------------------|

**Features:**
- Animated loader and custom cursor
- Interactive background canvas
- Sections: Home, About, Skills, Works, Expertise, Contact
- Fully responsive design

---

## Tech Stack Overview

```
Frontend    → React, TypeScript, Vite, Tailwind CSS, Vanilla JS
Backend     → FastAPI, Flask, Node.js/Express
Databases   → PostgreSQL, SQLite
Auth        → JWT, bcrypt, RBAC
DevOps      → Docker Compose, Nginx, Gunicorn
Languages   → Python, JavaScript, TypeScript, HTML/CSS
```

---

## Getting Started

Each project lives in its own directory with its own README and setup instructions:

```
├── Freelancer Project Management Platform/   → docker compose up --build -d
├── Resume Analyzer/                          → Open index.html
├── storepos/                                 → See project README
├── Web-Based Vulnerability Scanner/          → pip install -r requirements.txt && python app.py
└── portfolio/                                → Open index.html
```

---

## Author

**Erl Jay Ramas**  
Full-stack developer — building systems, AI tools, and security dashboards.

---

## License

This repository is for portfolio and educational purposes.
