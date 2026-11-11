# 🏢 NexusHR — Full-Stack CRUD Employee Management System

A production-grade, modular CRUD Employee Management System web application engineered for HR administrators. Features a data-dense, responsive SaaS interface (designed with **UI/UX Pro Max** design system tokens & Framer-inspired layout clarity) built with **React.js (Vite)** and **Tailwind CSS**, connected to a modular **Node.js (Express.js)** RESTful API with persistent database support (**PostgreSQL** with zero-config **SQLite fallback**), and an exportable **Postman Collection v2.1**.

---

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Directory Structure](#-project-directory-structure)
- [⚙️ Prerequisites & Installation](#️-prerequisites--installation)
- [🔐 Environment Variables Configuration](#-environment-variables-configuration)
- [💾 Database Schema & Persistence](#-database-schema--persistence)
- [🚀 Running the Application](#-running-the-application)
- [📡 API Endpoint Reference Table](#-api-endpoint-reference-table)
- [📮 Postman & Thunder Client Testing](#-postman--thunder-client-testing)
- [📸 CRUD Verification & Screenshot Guide](#-crud-verification--screenshot-guide)
- [🛡️ Error Handling & Edge-Case Validation](#️-error-handling--edge-case-validation)

---

## ✨ Key Features

### 🖥️ Frontend (React.js + Vite + Tailwind CSS)
- **Three-Layer Design System (`UI/UX Pro Max`)**: Light-mode SaaS default (`#F8FAFC` / `#FFFFFF`) with Trust Blue (`#2563EB`) & Vibrant Orange (`#EA580C`) accents and an Obsidian Dark Mode toggle (`#09090B`), governed by `design-system/nexushr/MASTER.md`, CSS custom properties (`frontend/src/styles/tokens.css`), and **Plus Jakarta Sans** + **JetBrains Mono** typography.
- **Searchable & Sortable Data Table + Mobile Cards**: Real-time debounced multi-field search across `name`, `department`, and `role`, keyboard-accessible sortable `<th>` buttons (`aria-sort`) on desktop, and a stacked Mobile Card view with a compact sort dropdown below `768px`.
- **Workforce Distribution & Department Filters**: Interactive segmented department breakdown chart and one-click filter pills for **All**, **Engineering**, **HR**, **Finance**, **Sales**, **Operations**, and **Marketing**.
- **Real-Time Metrics Summary**: Dashboard KPI cards displaying Total Headcount, Average Salary, Total Annual Payroll, and Team Coverage with tabular numeral alignment (`tabular-nums`).
- **Pre-filled Edit Modal**: Modal pre-populated with current employee details; converts dates cleanly to `YYYY-MM-DD`, supports `Escape` dismissal, and restores focus to the triggering control on close.
- **Accidental Deletion Guard**: Modal with employee identification, vector `ShieldAlert` icon, and auto-focused **Cancel** control before executing `DELETE`.
- **Accessible Form Validation**: Focusable `role="alert"` error summary banner with direct anchor links to invalid fields, `aria-describedby` associations, and inline field-level error messages for empty inputs, negative salaries, or invalid calendar dates.
- **Loading, Reduced-Motion & Feedback States**: Toast notifications (`role="status"`), skeleton loaders, in-flight button disabling, `@media (prefers-reduced-motion: reduce)` support, and backend offline alert banners.
- **Export to CSV**: Download filtered employee lists directly as structured `.csv` files.
- **Light / Dark Mode Toggle**: Light-mode default with pre-paint flash prevention and `localStorage` persistence.

### ⚙️ Backend (Node.js + Express.js)
- **Strict Layered Architecture**: Clear separation of concerns across `config/`, `controllers/`, `models/`, `routes/`, `middleware/`, and `database/`.
- **Parameterized SQL Queries**: Complete SQL injection immunity via parameterized statements.
- **Dual Database Persistence Engine**:
  - Connects to **PostgreSQL** via `pg` connection pooling when credentials are provided.
  - Automatically falls back to persistent **SQLite** (`data/employees.sqlite`) via Node.js native `node:sqlite` if PostgreSQL is not running locally.
- **Centralized Error Handling**: Standardized JSON envelopes across all endpoints: `{ success, data, message, errors }`.
- **Comprehensive Payloads Validation**: Checks empty strings, length limits, positive numeric salaries, and ISO date validity.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Single Page Application with fast HMR |
| **Styling** | Tailwind CSS + Three-Layer CSS Tokens | Light-first UI/UX Pro Max SaaS design system with Obsidian dark mode toggle, Lucide SVG icons, and Plus Jakarta Sans |
| **HTTP Client** | Axios | Configured with timeout and standardized interceptors |
| **Backend** | Node.js (v20+) + Express.js | Modular RESTful API |
| **Database** | PostgreSQL / SQLite | Relational database with B-Tree indexes |
| **Persistence Driver** | `pg` Pool & `node:sqlite` | Parameterized execution & automated migration |
| **Testing** | Postman Collection v2.1 | Ready-to-run Newman / Postman / Thunder Client collection |

---

## 📂 Project Directory Structure

```text
week 2 take 2 CRUD Employee Management System/
├── backend/
│   ├── data/                           # Local SQLite database (when PostgreSQL is offline)
│   ├── database/
│   │   ├── schema.sql                  # PostgreSQL table DDL with B-Tree indexes & trigger
│   │   └── seed.sql                    # 10 Realistic employee seed records
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                   # Unified PostgreSQL pool + SQLite fallback adapter
│   │   │   └── env.js                  # Dotenv configuration loader
│   │   ├── controllers/
│   │   │   └── employeeController.js   # Request handling, response formatting & status codes
│   │   ├── database/
│   │   │   └── initDb.js               # CLI database bootstrapping & seed runner
│   │   ├── middleware/
│   │   │   ├── errorHandler.js         # Centralized 404 & 500 error middleware
│   │   │   └── validationMiddleware.js # POST/PUT payload & param ID validators
│   │   ├── models/
│   │   │   └── employeeModel.js        # Data Access Object with parameterized queries
│   │   ├── routes/
│   │   │   └── employeeRoutes.js       # RESTful endpoint router
│   │   └── server.js                   # Express app entry point & listener
│   ├── .env.example                    # Backend environment template
│   ├── package.json                    # Backend dependencies & npm scripts
│   └── test-api.js                     # Automated CLI integration test suite
├── design-system/
│   └── nexushr/
│       └── MASTER.md                   # UI/UX Pro Max design system source of truth
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeleteConfirmModal.jsx  # Deletion confirmation modal with ShieldAlert SVG
│   │   │   ├── EmployeeFormModal.jsx   # Add & Edit modal with focusable error summary
│   │   │   ├── EmployeeTable.jsx       # Sortable desktop table + mobile card layout
│   │   │   ├── EmptyState.jsx          # Clean no-results illustration & actions
│   │   │   ├── Navbar.jsx              # Navigation header, Add CTA & theme toggle
│   │   │   ├── StatCards.jsx           # Aggregate metric cards & department mix chart
│   │   │   └── Toast.jsx               # Floating accessible toast notifications
│   │   ├── services/
│   │   │   └── api.js                  # Axios client & centralized endpoint service
│   │   ├── styles/
│   │   │   └── tokens.css              # Three-layer CSS tokens (Primitive/Semantic/Component)
│   │   ├── utils/
│   │   │   └── formatters.js           # Shared INR currency formatting helper (₹)
│   │   ├── App.jsx                     # Top-level state coordinator
│   │   ├── index.css                   # Tailwind directives, tabular-nums & reduced-motion
│   │   └── main.jsx                    # React DOM entry point
│   ├── index.html                      # HTML template with Plus Jakarta Sans & theme check
│   ├── tailwind.config.js              # Tailwind token mappings & shadows
│   ├── vite.config.js                  # Vite configuration & dev proxy
│   ├── package.json                    # Frontend dependencies & scripts
│   └── .env.example                    # Frontend environment template
├── database/
│   ├── schema.sql                      # Root copy of PostgreSQL DDL
│   └── seed.sql                        # Root copy of seed data
├── postman/
│   └── employee_crud.postman_collection.json # Exportable Postman Collection v2.1
├── postman_collection.json             # Root copy for one-click Postman / Thunder Client import
├── netlify/
│   └── functions/
│       └── api.mjs                     # Serverless Express handler for Netlify Functions
├── screenshots/                        # Verified live UI CRUD & validation screenshots
├── .node-version                       # Pinned Node.js 22 runtime for CI & serverless builds
├── netlify.toml                        # Netlify build, SPA fallback & /api/* proxy rules
├── package.json                        # Root workspace manager
└── README.md                           # Documentation & Verification Guide
```

---

## ⚙️ Prerequisites & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (Node.js 20+ / 24+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL** *(Optional)*: If running locally or via Docker. If PostgreSQL is not installed, the application automatically uses native SQLite without any setup needed!

### Installation
Clone the repository and install dependencies for both layers:

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install
```

---

## 🔐 Environment Variables Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Default variables inside `backend/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL)
# When PostgreSQL is active, the server connects automatically.
# When unavailable, it automatically switches to persistent local SQLite storage.
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/employee_management
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=employee_management
```

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

```env
# Target API URL
VITE_API_URL=http://localhost:5000
```

---

## 💾 Database Schema & Persistence

The table `employees` is indexed on all searchable and sortable columns:

```sql
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary NUMERIC(12, 2) NOT NULL CHECK (salary > 0),
    join_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fast B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees (name);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees (department);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees (role);
CREATE INDEX IF NOT EXISTS idx_employees_salary ON employees (salary);
CREATE INDEX IF NOT EXISTS idx_employees_join_date ON employees (join_date);
```

### Initializing & Seeding via Script:
To bootstrap the database and seed 10 realistic employee records manually:

```bash
cd backend
npm run db:init
```

---

## 🚀 Running the Application

### 1. Start Backend API Server
In your first terminal:
```bash
cd backend
npm start
```
*The API will start at **http://localhost:5000***.

### 2. Start Frontend Development Server
In your second terminal:
```bash
cd frontend
npm run dev
```
*The React UI will start at **http://localhost:3000*** (or port indicated in the terminal). Open it in your web browser.

---

## 📡 API Endpoint Reference Table

All endpoints return structured JSON responses in the format:
`{ "success": boolean, "data": ..., "message": string, "errors": [...] }`

| Method | Endpoint | Query Parameters | Request Body | Status Code | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/health` | — | None | `200 OK` | Health diagnostics & active DB engine |
| **GET** | `/api/employees/stats/summary` | — | None | `200 OK` | Metrics: headcount, avg salary, payroll |
| **GET** | `/api/employees` | `search`, `sortBy`, `order` | None | `200 OK` | Retrieve all employees with search & sorting |
| **GET** | `/api/employees/:id` | — | None | `200 OK` / `404 Not Found` | Retrieve single employee by ID |
| **POST** | `/api/employees` | — | `{ name, department, role, salary, join_date }` | `201 Created` / `400 Bad Request` | Create new employee with validation |
| **PUT** | `/api/employees/:id` | — | `{ name, department, role, salary, join_date }` | `200 OK` / `400 Bad Request` / `404 Not Found` | Update employee record by ID |
| **DELETE** | `/api/employees/:id` | — | None | `200 OK` / `404 Not Found` | Delete employee record by ID |

---

## 📮 Postman & Thunder Client Testing

An exportable Postman Collection v2.1 file is located at:
- `postman/employee_crud.postman_collection.json`
- `postman_collection.json` (root directory)

### Importing into Postman / Thunder Client:
1. Open Postman or VS Code Thunder Client.
2. Click **Import** -> Select `postman/employee_crud.postman_collection.json`.
3. The collection includes collection variables:
   - `baseUrl`: `http://localhost:5000`
   - `employeeId`: dynamically chained from test runs.
4. Run the full collection using the **Collection Runner** or run requests individually.

### Running Built-In Integration Test Script:
You can also execute the automated Node.js test suite from the terminal:
```bash
cd backend
node test-api.js
```
This tests all 11 endpoints, status codes, search queries, sort orders, and validation failures in under 2 seconds.

---

## 📸 CRUD Verification & Screenshots

All four CRUD operations, search/sort filtering, validation states, and empty states were verified against the live running application and captured in [`screenshots/`](screenshots/):

### 1. Read, Search & Sort (`GET`)
- **Directory Dashboard**: Default view displaying all 10 seeded employees, summary stat cards, INR currency formatting (`₹`), and `YYYY-MM-DD` / locale dates.

![Directory Dashboard](screenshots/01-directory-dashboard.png)

- **Real-Time Search & Sort**: Filtering by `"Engineering"` alongside descending **Salary** sort (`₹1,60,000.00` first).

![Search and Sort](screenshots/02-search-and-sort.png)

### 2. Validation Edge Cases (Client & Server Validation)
- **Inline Validation & Error Summary**: Attempting to submit empty `name` / `role` fields and a negative salary (`-5000`) renders a focusable `role="alert"` error summary banner with field links and inline field-level error messages while disabling submission until corrected.

![Validation Errors](screenshots/03-validation-errors.png)

### 3. Create (`POST /api/employees`)
- **Add Employee Modal**: Creating a new employee (`Maya Lin`, `Engineering`, `Lead AI Engineer`, `142000`, `2024-04-15`) followed by toast confirmation and immediate table state update.

![Add Employee Modal](screenshots/04-add-employee-modal.png)

### 4. Update (`PUT /api/employees/:id`)
- **Pre-Filled Edit Modal**: Clicking **Edit** pre-populates `name`, `department`, `role`, `salary`, and `join_date` (`YYYY-MM-DD`), updating the record (`Principal AI Architect`, `₹1,65,000.00`) without a page reload.

![Edit Employee Modal](screenshots/05-edit-employee-modal.png)

### 5. Delete (`DELETE /api/employees/:id`)
- **Delete Confirmation Modal**: Clicking **Delete** opens a confirmation dialog displaying the employee's name (`Maya Lin`) before sending `DELETE /api/employees/:id`, preventing accidental deletion.

![Delete Confirmation Modal](screenshots/06-delete-confirmation-modal.png)

### 6. Empty State
- **No Matching Records**: Entering an unmatched search query (`"zzzzzzz"`) displays the empty state view with a one-click **"Clear Filters"** reset action.

![Empty State](screenshots/07-empty-state.png)

---

## 🛡️ Error Handling & Edge-Case Validation

- **Non-Empty String Validation**: Name, department, and role must contain non-whitespace characters.
- **Salary Constraints**: Salary must be numeric and strictly positive (`> 0`). Negative numbers or non-numeric strings are rejected with status `400`.
- **Date Verification**: `join_date` must match `YYYY-MM-DD` and represent a real calendar day.
- **Edit Modal Join Date Format**: Automatically converted to `YYYY-MM-DD` so HTML5 date pickers display the pre-filled date accurately.
- **Graceful Offline Notice**: If the backend server stops, the frontend displays an alert banner with a one-click retry button rather than crashing.
- **Automatic Fallback DB**: Prevents development blocking when PostgreSQL is not configured on the host machine.

---

## 🌐 Deploying on Netlify (Full-Stack)

This repository includes [netlify.toml](netlify.toml) and [netlify/functions/api.mjs](netlify/functions/api.mjs) so Netlify deploys both the Vite frontend and Express API out of the box:

- **Build command**: `npm run netlify:build`
- **Publish directory**: `frontend/dist`
- **Functions directory**: `netlify/functions` (proxies `/api/*` and `/health` via `[[redirects]]`, plus `/* -> /index.html` SPA rewrite)
- **Database persistence**: Without external config, Netlify Functions seed an ephemeral `/tmp` SQLite database (`sql.js` / `node:sqlite`). For permanent cloud persistence across cold starts, add `DATABASE_URL` in **Netlify Site Configuration -> Environment variables** pointing to PostgreSQL (e.g. Supabase or Neon).


