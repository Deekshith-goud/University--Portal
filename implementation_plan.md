# Student Portal – Implementation Plan

## Overview
Role-based university portal with Students, Faculty, and Admin. The system replaces an existing static site with a dynamic, secure web application.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI
- **Auth**: JWT + OAuth2PasswordBearer
- **DB**: PostgreSQL (SQLModel/SQLAlchemy)
- **Storage**: S3-compatible (MinIO or AWS S3)

## Roles & Permissions
- **Student**:
    - Login
    - View assignments, grades, announcements, timetables
    - Submit assignments (upload files)
    - Apply for events
    - Upload notes (subject tagged)
- **Faculty**:
    - Login
    - Create/Update Assignments
    - View/Download Student Submissions
    - Post Academic Notices (if authorized)
- **Admin**:
    - Login (Superuser)
    - Manage Users (Create Faculty/students)
    - Publish Announcements (Global)
    - Manage Events
    - Moderate uploaded content (Notes, Reviews)
    - View System Analytics

## Architecture
- **SPA Frontend**: React application consuming JSON APIs.
- **REST API Backend**: FastAPI service exposing endpoints secured by JWT.
- **RBAC**: Enforced strictly at the API dependency level (`require_role`).
- **Database**: Relational model for structured data.
- **File Storage**: Object storage for submissions and notes.

## Database Schema

```python
# Core Tables

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: str # "student", "faculty", "admin"
    is_active: bool = True

class Assignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    faculty_id: int = Field(foreign_key="user.id")
    deadline: datetime

class Submission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    assignment_id: int = Field(foreign_key="assignment.id")
    student_id: int = Field(foreign_key="user.id")
    file_url: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    date: datetime
    created_by: int = Field(foreign_key="user.id")

class Announcement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    published_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: int = Field(foreign_key="user.id")
    attachment_url: Optional[str] = None
```

## API Contract

### Authentication
- `POST /auth/login`: Returns access_token.
- `GET /auth/me`: Returns current user profile.
- `POST /auth/register`: (Admin only) Register new faculty/admin.

### Dashboard
- `GET /dashboard/stats`: Returns counts tailored to the user's role.

### Assignments
- `POST /assignments`: (Faculty) Create new assignment.
- `GET /assignments`: List assignments (Filter by course/faculty).
- `GET /assignments/{id}`: Details.
- `POST /assignments/{id}/submit`: (Student) Upload submission.

### Resources / Notes
- `POST /notes/upload`: (Student/Faculty) Upload a resource.
- `GET /notes`: List resources.

### Admin / Global
- `POST /announcements`: (Admin) Publish news.
- `GET /announcements`: Public feed.
- `POST /events`: (Admin) Create event.
- `POST /events/{id}/apply`: (Student) Register for event.

## Deployment Strategy
- **Frontend**: Vercel (Production optimized build).
- **Backend**: Render / Railway (Dockerized FastAPI).
- **Database**: Managed Cloud Postgres.

## Design Guidelines (Academic Theme)
- **Colors**: Slate/Gray scale, distinct but muted primary blue (#0f172a / #3b82f6).
- **Typography**: Inter (Body), IBM Plex Sans (Headers).
- **Components**: Clean cards with `shadow-sm`, no heavy borders.
- **Validation**: Strict input validation on all forms.
