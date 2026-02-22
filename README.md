##🧩 CMS Admin Dashboard — Modular SPA

A production-style Content Management System (CMS) built with Vanilla JavaScript (ES Modules), TailwindCSS v4, and JSON-Server, powered by Vite 7.

This project demonstrates how to architect a scalable Single Page Application (SPA) without frameworks, focusing on clean structure, modularity, and maintainability.

🚀 Tech Stack
Core

Vite 7 — Development server & bundler

Vanilla JavaScript (ES Modules) — Modular architecture

TailwindCSS v4 — Utility-first styling

JSON-Server — Mock REST API

Additional Libraries

html2pdf.js — Invoice PDF generation

iziToast — Toast notifications

moment-jalaali — Jalali date handling

#✨ Features

📊 Dashboard overview

📦 Product management (CRUD)

👤 User management (CRUD)

🎟 Discount code management (CRUD)

🛒 Orders system:

Create order

Delete order

Download invoice (PDF)

🌙 Dark mode support

🔁 Custom client-side routing

📑 Pagination system

🔎 Debounced search

🔔 Toast notification system

📅 Jalali date formatting

🏗 Architecture

##The project follows a modular and scalable structure:

src/
├── api/        → API layer
├── layouts/    → Layout components
├── pages/      → SPA pages
├── ui/         → Reusable UI components
├── utils/      → Utilities (pagination, debounce, toast, date, etc.)
├── router.js   → Custom SPA router
├── app.js
├── input.css
└── main.js
Engineering Highlights

SPA architecture without frameworks

Clean separation of concerns

Modular ES-based structure

Reusable utilities

Designed for easy migration to React or TypeScript

##⚙️ Setup & Development
Install dependencies
npm install
Run Vite dev server
npm run dev
Run mock API server(json-server)
npm run server

##📦 Available Scripts
Script	Description
npm run dev	Start development server
npm run build	Build for production
npm run preview	Preview production build
npm run server	Start JSON-Server

##🎯 What This Project Demonstrates

Strong JavaScript fundamentals

SPA routing without libraries

RESTful API interaction

Modular architecture design

Clean UI engineering with TailwindCSS

PDF generation in frontend

Date handling (Jalali)

## 👨‍💻 Author

**Amirmahdi Naderi**  
Frontend Developer  
GitHub: https://github.com/amirmahdi-dev
