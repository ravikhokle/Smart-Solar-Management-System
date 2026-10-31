# HeliosFlow - Smart Solar Management System (Core MVP)

A professional enterprise B2B SaaS platform for orchestrating commercial and residential solar installations, site surveys, engineering permits, hardware inventory, and power generation performance.

---

## ☀️ Architecture & Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (custom curated solar B2B design system)
- **Routing:** React Router DOM (v7)
- **State Management:** Redux Toolkit & React-Redux
- **API Client:** Axios (with Bearer JWT interceptors)
- **Icons:** Lucide React
- **Data Visualization:** Recharts (Power generation vs benchmark area charts)

### Backend
- **Runtime:** Node.js & Express.js
- **Architecture:** MVC (Model - View/Response - Controller) with separated Service layer
- **Database:** MongoDB Atlas via Mongoose (with automated fallback store for local development)
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Security & Logging:** CORS, Morgan logger, centralized error handling middleware

---

## 🎨 Design System

Tailwind CSS has been configured with the brand color palette:

| Token | Hex | Role |
| :--- | :--- | :--- |
| **Primary** | `#123B35` | Deep Forest/Teal brand color, navigation header, brand cards |
| **Secondary** | `#16A36A` | Eco emerald accent, primary action buttons, active tabs |
| **Accent** | `#F4B740` | Warm solar gold, highlight badges, generation forecast |
| **Background** | `#F7F9F8` | Clean off-white canvas |
| **Surface** | `#FFFFFF` | Crisp card containers and modals |
| **Text** | `#1F2937` | High-contrast charcoal slate typography |
| **Border** | `#E5E7EB` | Subtle structural dividers |
| **Information** | `#2563EB` | Status pills, technical specs, alerts |
| **Warning** | `#DC6B35` | Procurement warnings, urgent priorities |

**Typography:** Google Inter with system sans-serif fallback.

---

## 📁 Repository Structure

```
Smart-Solar-Management-System/
├── package.json               # Unified dependencies and scripts
├── vite.config.js             # Vite configuration with /api reverse proxy
├── tailwind.config.js         # Design system tokens and brand colors
├── postcss.config.js          # Tailwind & Autoprefixer PostCSS config
├── index.html                 # App HTML with Inter typography & SEO metadata
├── .env.example               # Environment variables template
├── .env                       # Local environment variables
│
├── src/                       # Frontend Application
│   ├── assets/                # Static assets & icons
│   ├── components/
│   │   ├── common/            # Button, Badge, Card, Input, Select, Modal, Table, Skeleton, EmptyState
│   │   ├── navigation/        # Collapsible Sidebar & TopNavbar
│   │   ├── dashboard/         # StatCard, GenerationChart, PipelineFunnel
│   │   └── forms/             # ProjectForm, SurveyForm, CustomerForm, InventoryForm
│   ├── layouts/               # DashboardLayout & AuthLayout
│   ├── features/              # Redux slices (authSlice, projectSlice)
│   ├── pages/                 # DashboardPage, ProjectsPage, ProjectDetailsPage, SurveysPage, InventoryPage, CustomersPage, LoginPage, NotFoundPage
│   ├── services/              # Axios API clients (auth, project, customer, inventory, survey)
│   ├── store/                 # Redux Toolkit store setup
│   ├── routes/                # ProtectedRoute & AppRoutes
│   ├── utils/                 # Formatters & Constants
│   ├── App.jsx
│   └── main.jsx
│
└── server/                    # Backend Application (MVC Architecture)
    ├── config/                # Database connection (db.js)
    ├── controllers/           # auth, project, customer, inventory, survey controllers
    ├── models/                # User, Project, Customer, Inventory, Survey Mongoose models
    ├── routes/                # Express API routes
    ├── middleware/            # JWT auth, RBAC authorization, centralized errorHandler
    ├── services/              # Business logic services
    ├── validators/            # Auth and project input validators
    ├── utils/                 # Standard JSON response helper & initial seed data
    ├── jobs/                  # Background solar report jobs
    ├── app.js                 # Express app configuration
    └── server.js              # Server entry point & listener
```

---

## 🚀 How to Run the Application

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22)
- **npm** v9+

### 2. Environment Setup
The `.env` file is already created in the project root with defaults:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/solar_management
JWT_SECRET=heliosflow_solar_management_jwt_secret_key_2026
JWT_EXPIRE=7d
VITE_API_URL=/api
```
*(Note: If you have a MongoDB Atlas connection string, you can simply paste it into `MONGO_URI`. If not, the server will automatically fall back to its internal mock store so you can test all features immediately without any database setup!)*

### 3. Running the Server and Client

You can run both concurrently or in separate terminals:

#### Option A: Run Both Together (Recommended)
```bash
npm run dev:all
```

#### Option B: Run in Separate Terminals

**Terminal 1 (Backend Server):**
```bash
npm run server
```
Server runs at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

**Terminal 2 (Frontend Client):**
```bash
npm run dev
```
Client runs at `http://localhost:5173`.

---

## 🔑 Default Credentials

For quick testing, the login screen includes **one-click demo buttons** or you can log in with:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@heliosflow.com` | `password123` |
| **Project Manager** | `marcus@heliosflow.com` | `password123` |
| **Field Engineer** | `engineer@heliosflow.com` | `password123` |

---

## 📋 API Endpoints Summary

- **Authentication:**
  - `POST /api/auth/register` - Create account
  - `POST /api/auth/login` - Sign in & receive JWT
  - `GET /api/auth/me` - Profile of logged-in user
- **Projects:**
  - `GET /api/projects` - List all projects (supports `?status=...&priority=...&search=...`)
  - `GET /api/projects/metrics` - Dashboard telemetry & generation data
  - `GET /api/projects/:id` - Project details & milestones
  - `POST /api/projects` - Create new solar installation
  - `PUT /api/projects/:id` - Update status/milestones
  - `DELETE /api/projects/:id` - Delete project (Admin only)
- **Surveys:**
  - `GET /api/surveys` - List site audits
  - `POST /api/surveys` - Schedule roof & electrical assessment
- **Inventory:**
  - `GET /api/inventory` - Equipment catalog
  - `GET /api/inventory/alerts/low-stock` - Low stock reorder triggers
  - `POST /api/inventory` - Add equipment
- **Customers:**
  - `GET /api/customers` - Client directory
  - `POST /api/customers` - Add new client
- **Health:**
  - `GET /api/health` - Database & server uptime health monitor
