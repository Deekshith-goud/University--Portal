# Student Portal Project Documentation

## 1. Scope of Documentation

This documentation provides a comprehensive technical overview of the Student Portal project. It covers the full stack architecture, including the React-based frontend, FastAPI backend, and MySQL database integration. It serves as an audit-ready reference for developers, explaining file purposes, system interactions, and deployment procedures.

### Scope Includes:
*   **Frontend Codebase**: `frontend/src` (React, Vite, TailwindCSS)
*   **Backend Codebase**: `backend/app` (FastAPI, SQLAlchemy)
*   **Database Configuration**: MySQL connection and models.
*   **Authentication & Security**: JWT-based auth and role-based access control (RBAC).
*   **Deployment & Config**: Environment configurations and build steps.

---

## 2. Folder-Level Explanation

### `/backend`
**Purpose**: Contains the server-side application logic, API definition, and database configurations.
*   **Logic**: REST API endpoints, database ORM models, authentication logic, and schema validation.
*   **Interacts With**: Frontend (receives requests), Database (persists data).
*   **Roles**: All roles interact indirectly via API calls.

### `/backend/app`
**Purpose**: The core application module.
*   `api/`: API route implementations grouped by functionality (e.g., `events.py`, `users.py`).
*   `core/`: Core infrastructure settings like config, database connection, and security utilities.
*   `models/` & `models.py`: SQLAlchemy database models defining the table structures.
*   `schemas/`: Pydantic models for request/response validation.

### `/frontend`
**Purpose**: Content client-side UI application.
*   **Logic**: Component rendering, client-side routing, state management, and API integration.
*   **Interacts With**: End-users (Student, Faculty, Admin) and Backend APIs.

### `/frontend/src`
**Purpose**: Source code for the frontend application.
*   `auth/`: Authentication context and providers.
*   `components/`: Reusable UI components (buttons, cards, inputs).
*   `dashboards/`: Role-specific dashboard views.
*   `layouts/`: Wrapper components for page structural consistency.
*   `pages/`: Full-page views (Events, Login, Announcements).
*   `services/`: API communication utilities (Axios instance).

---

## 3. File-Level Breakdown

### Backend Files (`backend/app/`)

#### `main.py`
*   **Responsibility**: Entry point for the FastAPI application. Configures CORS, mounts static files, and includes API routers.
*   **Key Functions**: `app.include_router()`, `StaticFiles` mounting.
*   **Inputs/Outputs**: HTTP Requests/Responses.
*   **Used By**: Server runtime (Uvicorn).
*   **Criticality**: High. Application will not start without it.

#### `core/database.py` (assumed based on standard structure)
*   **Responsibility**: Manages the persistent database connection string and session lifecycle.
*   **Key Components**: `SessionLocal` (DB session factory), `engine`, `get_session` (dependency).
*   **Dependencies**: `sqlalchemy`.
*   **Used By**: All API endpoints requiring DB access.

#### `core/security.py` (assumed based on functionality)
*   **Responsibility**: Handles password hashing/verification and JWT token creation.
*   **Key Functions**: `verify_password()`, `get_password_hash()`, `create_access_token()`.
*   **Dependencies**: `passlib`, `jose` (JWT), `bcrypt`.
*   **Criticality**: High. Affects all authentication security.

#### `models.py`
*   **Responsibility**: Defines the database schema as Python classes (ORM).
*   **Key Models**: `User` (students/faculty), `Event` (college events), `Announcement`, `EventRegistration`.
*   **Used By**: Database migration scripts and API logic to query tables.

#### `api/college_events.py`
*   **Responsibility**: CRUD operations for generic college events (not club-specific).
*   **Key Functions**: `create_college_event`, `read_college_events`, `register_for_college_event`.
*   **Logic**: Handles file upload linking, registration logic (team vs. individual), and filtering.
*   **Roles**: Admin/Faculty (Create/Delete), Student (Read/Register).

#### `api/college_announcements.py`
*   **Responsibility**: Manages official college announcements.
*   **Key Functions**: `create_announcement`, `read_announcements`.
*   **Logic**: Supports file attachments and priority pinning.
*   **Roles**: Admin/Faculty (Create), All (Read).

#### `api/auth.py`
*   **Responsibility**: Handles user login and token generation.
*   **Key Functions**: `login_access_token`.
*   **Inputs**: Username/Password → Returns JWT Token.

#### `api/users.py`
*   **Responsibility**: User management (Signup, Profile fetching).
*   **Key Functions**: `create_user`, `read_users_me`.
*   **Roles**: Public (Signup), Authenticated User (Profile).

#### `api/uploads.py`
*   **Responsibility**: Generic endpoint for file uploads.
*   **Key Functions**: `upload_file`.
*   **Outputs**: Returns a static URL path to the stored file.

### Frontend Files (`frontend/src/`)

#### `App.jsx`
*   **Responsibility**: Defines the application routing structure using `react-router-dom`.
*   **Key Components**: `<Routes>`, `<Route>`, `<PrivateRoute>`.
*   **Logic**: Determines which page to show based on the URL and user auth state.

#### `services/api.js` (assumed based on standard structure)
*   **Responsibility**: Centralized Axios instance for HTTP requests.
*   **Logic**: Adds `Authorization: Bearer <token>` header to every request; handles 401 (Unauthorized) redirects.
*   **Used By**: All pages/components making network requests.

#### `auth/AuthProvider.jsx`
*   **Responsibility**: Manages global user state (user, token, login, logout) using React Context.
*   **Key Functions**: `login()`, `logout()`, `fetchUser()`.
*   **Used By**: Components needing current user info (e.g., Dashboards, Headers).

#### `pages/Events.jsx`
*   **Responsibility**: UI for viewing and registering for college events.
*   **Key Features**: Event list display, "Create Event" modal (Admin/Faculty), "Register" modal (Student).
*   **Dependencies**: `api.js` for fetching data.

#### `pages/Announcements.jsx`
*   **Responsibility**: UI for viewing and posting official announcements.
*   **Key Features**: Attachment handling, Filtering, Pinned Notices.

#### `pages/Login.jsx` & `pages/Signup.jsx`
*   **Responsibility**: Authentication forms for entry.
*   **Logic**: Calls `api/auth` endpoints and updates `AuthProvider` context on success.

#### `dashboards/`
*   **`StudentDashboard.jsx`**: View registered events, assignments, attendance.
*   **`Faculty/AdminDashboard.jsx`**: Manage events, students, and approvals.

---

## 4. Technology & Library Usage

### Backend Stack
*   **Python (FastAPI)**: Chosen for high performance (async support) and automatic Swagger UI generation.
    *   *Responsibility*: Application server logic.
*   **SQLAlchemy (ORM)**: Chosen for type-safe database interactions and abstraction.
    *   *Responsibility*: Mapping Python objects to MySQL tables.
*   **MySQL**: Relational database.
    *   *Responsibility*: Persistent storage of users, events, and registrations.
*   **Pydantic**: Data validation library.
    *   *Responsibility*: Ensuring API inputs/outputs match strict schemas.
*   **Python-Jose / Passlib**: Security libraries.
    *   *Responsibility*: Handling JWT tokens and bcrypt password hashing.

### Frontend Stack
*   **React (Vite)**: Modern, fast frontend build tool and framework.
    *   *Responsibility*: Rendering the UI and managing client state.
*   **TailwindCSS**: Utility-first CSS framework.
    *   *Responsibility*: Styling and layout (responsive design).
*   **Framer Motion**: Animation library.
    *   *Responsibility*: Smooth page transitions and interaction effects.
*   **Lucide React**: Icon library.
    *   *Responsibility*: Providing consistent vector icons across the app.
*   **Axios**: HTTP client.
    *   *Responsibility*: Handling AJAX requests to the backend with interceptors.

---

## 5. Data Flow Explanation

### Event Creation Flow
1.  **User (Faculty/Admin)** opens "Create Event" modal in `Events.jsx`.
2.  **Form Data**: User fills details (including File Upload for poster).
    *   *File Upload*: Frontend calls `POST /upload/file` → Backend stores file → Returns URL.
3.  **Submission**: Frontend calls `POST /college/events` with JSON payload (including poster URL and attachment objects).
4.  **Backend**:
    *   Validates data via `EventCreate` schema.
    *   Serializes JSON fields (attachments, eligibility).
    *   Creates record in `events` table via SQLAlchemy.
5.  **Response**: `200 OK` with created event object. Frontend refreshes list.

### Event Registration Flow
1.  **User (Student)** clicks "Register" on an Event Card.
2.  **Form**: Enters details (Phone, Team info if applicable).
3.  **Submission**: Frontend calls `POST /college/events/{id}/register`.
4.  **Backend**:
    *   Checks eligibility (Date, Is Open?).
    *   Checks if already registered.
    *   Creates record in `event_registrations` table.
5.  **Constraint**: If `participation_type` is 'team', verifies team size and name.

### Authentication Flow
1.  **User** submits Login form (`Login.jsx`).
2.  **Request** to `POST /token`.
3.  **Backend** validates credentials against `users` table hash.
4.  **Returns** JWT Application Token.
5.  **Frontend** stores Token in `localStorage`.
6.  **AuthProvider** fetches User Profile using token.
7.  **User** redirected to Role-specific Dashboard.

---

## 6. Role-Based System Behavior

**Roles**: Student, Faculty, Admin

| Feature | Student | Faculty | Admin |
| :--- | :--- | :--- | :--- |
| **Login** | Access Student Dashboard | Access Faculty Dashboard | Access Admin Dashboard |
| **Events** | View, Register | View, Create, Delete | View, Create, Delete |
| **Announcements** | View | Post, Delete | Post, Delete |
| **User Management** | Edit Own Profile | View Students | Manage Users |

### Permissions Control
*   **Backend**: Decorators or checks like `if not is_staff(user): raise 403` inside API functions (e.g., `create_college_event` in `college_events.py`).
*   **Frontend**: Conditional rendering. Example in `Events.jsx`:
    ```jsx
    {(user?.role === 'admin' || user?.role === 'faculty') && <CreateButton />}
    ```

---

## 7. Configuration & Environment

*   **Backend `.env`**: Not committed to Git. Contains secrets.
    *   `DATABASE_URL`: `mysql+pymysql://user:pass@host/db_name`
    *   `SECRET_KEY`: Used for signing JWTs.
*   **Frontend `api.js`**:
    *   `baseURL`: Hardcoded to `http://localhost:8000` (Should be environmentalized for production).
*   **Static Files**:
    *   `backend/uploads/`: Directory is mounted to `/static` path in `main.py` to serve user-uploaded content.

---

## 8. Error Handling & Edge Cases

*   **API Errors**:
    *   Handled via `HTTPException` in FastAPI.
    *   **Common Codes**: `401 Unauthorized` (Token invalid), `403 Forbidden` (Role mismatch), `404 Not Found`.
*   **Frontend Handling**:
    *   `api.js` interceptor catches 401 and redirects to Login.
    *   `try/catch` blocks in Page components display browser alerts (`alert()`) on failure.
*   **Edge Cases**:
    *   **Database Down**: Backend raises 500. Frontend shows generic error.
    *   **Empty Lists**: Frontend displays "No events found" placeholders.

---

## 9. Build, Run & Deploy

### Running Locally

1.  **Database**: Start MySQL Server. Ensure `student_portal_db` exists.
2.  **Backend**:
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn app.main:app --reload
    ```
    Runs on `http://localhost:8000`
3.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Runs on `http://localhost:5173`

### Build Steps (Production)

1.  **Frontend**: Run `npm run build`. This generates static HTML/JS/CSS in `dist/`.
2.  **Backend**: Production execution using `gunicorn` with `uvicorn` workers.
3.  **Static Serving**: Configure Nginx (or similar) to serve `frontend/dist` as root and proxy `/api` calls to the Backend port.
