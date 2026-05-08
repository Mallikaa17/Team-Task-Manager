Team Task Manager

Team Task Manager is a full-stack web application designed for efficient project and task management with role-based access control. It allows Administrators to manage projects, create tasks, and oversee team members, while empowering Members to focus solely on updating the status of their assigned work.

##  Tech Stack

### Backend
- **Framework**: Django & Django REST Framework (DRF)
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
- **Server**: Gunicorn (for production deployments)

### Frontend
- **Framework**: React (built with Vite)
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

##  Key Features & Functionality

###  Authentication & Security Enhancements
- **JWT Authentication**: Secure login using access and refresh tokens.
- **Role-Based Access Control (RBAC)**: Users are either **Admins** or **Members**.
- **Session Isolation**: Tokens are stored strictly in `sessionStorage` ensuring that your login session is tied directly to your active browser tab.
- **Advanced Navigation Guards**: 
  - Logged-in users are automatically redirected to the dashboard if they attempt to visit the `/login` or `/signup` pages.
  - Unauthorized users are forced to log in before accessing private routes.
  - A custom navigation interceptor catches the browser's "Back" button to prevent accidental logouts. If pressed on a main page, it will prompt the user with "Do you want to log out?".
- **Custom Validations**: Strict form validations including minimum password lengths, and a rigid 10-digit phone number validation enforcing Indian prefix rules (starts with 6, 7, 8, or 9).

###  Admin Capabilities
- **Strict Data Isolation**: An Admin can **only** see and assign Members that they themselves have created. Other Admins' members remain completely invisible.
- **Dashboard**: View all projects they own.
- **Project Management**: Create, edit, and delete projects.
- **Member Assignment**: Assign multiple Members to specific projects directly from the dashboard via a dedicated "Assign Members" modal.
- **Task Management**: Create tasks within projects (tasks default to "To Do"), edit task details, and delete tasks.
- **Read-Only Status**: Admins can oversee the status of tasks but **cannot** manually update the status. Only members can update statuses.
- **Member Management**: Access a dedicated `/members` portal to create new member accounts, view member details (including phone numbers), and delete members. (The "Last Name" field is optional).

###  Member Capabilities
- **Focused Dashboard**: Members only see the projects they have been specifically assigned to by an Admin.
- **Task Execution**: Members can view tasks within their assigned projects.
- **Status Updates**: Members have the exclusive ability to update the status of tasks (e.g., from "To Do" to "In Progress" to "Completed").
- **Restricted Access**: Members cannot create projects, edit projects, create tasks, delete tasks, or access the Member management portal.

---

##  Project Structure

The project is divided into two main directories:

1. **`/backend`**: Contains the Django project and API logic.
   - `api/models.py`: Defines the `User` (customized with `phone_number`, `role`, and `created_by` for strict admin isolation), `Project` (with `assigned_members`), and `Task` models.
   - `api/views.py`: Contains ViewSets with conditional querysets and permissions ensuring Admins and Members only access what they are authorized to see.
   - `Procfile`: Configured with Gunicorn and automatic database migrations (`python manage.py migrate`) for seamless cloud deployments (e.g., on Railway).
2. **`/frontend`**: Contains the React application.
   - `src/App.jsx`: Configures React Router with `PrivateRoute` and `PublicRoute` wrappers.
   - `src/pages/Dashboard.jsx` & `Members.jsx`: Role-aware dashboard for managing/viewing projects, equipped with popstate interceptors.
   - `src/pages/ProjectDetails.jsx`: Displays tasks and handles the strict separation of task creation (Admin) vs. task status updates (Member).
   - `.env.development` & `.env.production`: Cleanly separates API URLs for local development and cloud production deployments.

---

##  Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js (v16+) & npm
- MySQL Server

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure MySQL:
   - Create a database named `task_manager` in MySQL.
   - Ensure your MySQL credentials match those in `backend/config/settings.py` (default expects user `root`).
4. Run Migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Start the Django Server:
   ```bash
   python manage.py runserver
   ```
   *The backend will run on `http://localhost:8000`*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on the port specified by Vite (usually `http://localhost:5173`)*

---

##  API Endpoints Overview

- `POST /api/signup/`: Register a new user (Select role: Admin or Member).
- `POST /api/login/`: Authenticate and receive JWT tokens.
- `GET /api/users/me/`: Retrieve details and role of the currently logged-in user.
- `GET / POST /api/members/`: (Admin only) List or create new members. Returns only members created by the requesting Admin.
- `GET / POST / PUT / DELETE /api/projects/`: Manage projects. Responses are filtered based on the user's role.
- `POST /api/projects/{id}/assign_members/`: (Admin only) Assign a list of members to a project.
- `GET / POST / PUT / PATCH / DELETE /api/tasks/`: Manage tasks. Admins create tasks; Members patch the `status`.