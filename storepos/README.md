<div align="center">

# 🏪 StorePOS

### A Modern Point of Sale System

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**A fast, intuitive, and offline-capable POS system designed for small to medium businesses.**

[Features](#-features) · [Screenshots](#-screenshots) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference)

</div>

---

## 📸 Screenshots

<div align="center">

### Dashboard
> Real-time sales overview with key business metrics and analytics at a glance.

<img src="img/Dashboard.png" alt="Dashboard - Sales overview and analytics" width="90%" />

---

### Sales Terminal
> Streamlined checkout with product grid, cart management, and instant payment processing.

<img src="img/Sale.png" alt="Sales Terminal - Product selection and cart" width="90%" />

---

### Checkout
> Quick and easy checkout flow supporting cash, card, and e-wallet payments.

<img src="img/Checkout.png" alt="Checkout - Payment processing" width="90%" />

---

### Products Management
> Full inventory control — add, edit, categorize, and track stock levels.

<img src="img/Products.png" alt="Products - Inventory management" width="90%" />

---

### Transactions
> Complete transaction history with search, filtering, and detailed views.

<img src="img/Transaction.png" alt="Transactions - Sales history" width="90%" />

---

### Reports & Analytics
> Actionable insights: sales summaries, top products, profit tracking, and more.

<img src="img/Reports.png" alt="Reports - Business analytics" width="90%" />

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🛒 Sales & Checkout
- Click-and-go checkout flow
- Multiple payment methods (cash, card, e-wallet)
- Real-time cart management
- Complete transaction history

</td>
<td width="50%">

### 📦 Inventory Management
- Product CRUD with categories
- Real-time stock updates
- Low-stock alerts
- Organized product grid

</td>
</tr>
<tr>
<td width="50%">

### 📊 Reports & Analytics
- Daily / weekly / monthly sales summaries
- Best-selling products tracking
- Profit margin monitoring
- Payment method breakdown

</td>
<td width="50%">

### 👥 User & Role Management
- **Admin** — Full system access
- **Manager** — Inventory & reports
- **Cashier** — Sales processing only
- Secure JWT authentication

</td>
</tr>
<tr>
<td colspan="2" align="center">

### 🔌 Offline-First Architecture
Works without internet · Auto-syncs when reconnected · SQLite local storage ensures zero data loss

</td>
</tr>
</table>

---

## 🛠 Tech Stack

<table>
<tr>
<th align="center">Frontend</th>
<th align="center">Backend</th>
<th align="center">DevOps</th>
</tr>
<tr>
<td>

- **React 18** — UI Framework
- **TypeScript** — Type Safety
- **Vite** — Build Tool
- **Tailwind CSS** — Styling
- **Zustand** — State Management
- **React Router** — Routing

</td>
<td>

- **Node.js + Express** — API Server
- **SQLite 3** — Database
- **JWT** — Authentication
- **bcryptjs** — Password Hashing

</td>
<td>

- **Concurrently** — Dev Scripts
- **ESLint** — Code Quality
- **Git** — Version Control

</td>
</tr>
</table>
