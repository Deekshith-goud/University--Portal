<div align="center">

#STAMP

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=3B82F6&center=true&vCenter=true&width=435&lines=Student+Portal+Reimagined;Empowering+Academic+Excellence;Seamless.+Secure.+Smart.)](https://git.io/typing-svg)

<br/>

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

<br/>
<br/>

**A modern, role-based university management system designed to bridge the gap between students, faculty, and administration.**

[Features](#-features) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Installation](#%EF%B8%8F-installation--setup) • [Contributing](#-contributing)

</div>

---

## 🚀 Features

### 🎓 For Students
*   **Academic Dashboard:** Real-time overview of attendance, grades, and upcoming deadlines.
*   **Course Management:** View assignments, submit work, and track submission status.
*   **Events & Clubs:** Explore campus life, register for events, and join student clubs.
*   **Resource Hub:** Access and download lecture notes and study materials.
*   **Performance Analytics:** Visual insights into academic progress (CGPA/SGPA).

### 👩‍🏫 For Faculty
*   **Classroom Management:** Create and manage assignments and resources.
*   **Grading System:** Review student submissions and provide feedback.
*   **Event coordination:** Organize departmental events and workshops.

### 🛡️ For Administrators
*   **User Management:** Efficiently manage student and faculty records.
*   **Global Announcements:** Broadcast important updates to the entire university.
*   **System Oversight:** Monitor platform activity and content moderation.

### ✨ Experience the Design
*   **🎨 Dynamic Aesthetics:** Built with a focus on visual excellence using rich color palettes and glassmorphism.
*   **⚡ Fluid Animations:** Powered by **Framer Motion**, every interaction feels alive—from page transitions to button hovers.
*   **🌙 Dark Mode:** A seamlessly integrated high-contrast dark theme for late-night study sessions.

## 🛠️ Tech Stack

**Frontend**
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **Icons:** Lucide React
*   **State Management:** React Context API

**Backend**
*   **Framework:** FastAPI (Python)
*   **Database:** MySQL
*   **ORM:** SQLAlchemy / SQLModel
*   **Authentication:** JWT (JSON Web Tokens) & OAuth2
*   **Security:** Bcrypt password hashing

## ⚙️ Installation & Setup

### Prerequisites
*   **Python** 3.8+
*   **Node.js** 16+
*   **MySQL Server** running locally

### 1. Clone the Repository
```bash
git clone <repository_url>
cd student-portal
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd backend
python -m venv venv

# Activate Virtual Environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt
```

**Configuration:**
Create a `.env` file in the `backend` folder with your database credentials:
```env
DATABASE_URL=mysql+pymysql://<user>:<password>@localhost/<db_name>
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Run Database Migrations/Seed Data:**
```bash
python seed.py
```

**Start the Server:**
```bash
# Option 1: Using the script (Windows)
run_backend.bat

# Option 2: Direct command
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will run at `http://localhost:8000`. API Docs available at `/docs`.

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory.

```bash
cd frontend

# Install Dependencies
npm install

# Start Development Server
npm run dev
```
The frontend application will be accessible at `http://localhost:5173`.

## 📂 Project Structure

```
student-portal/
├── backend/                # FastAPI Backend
│   ├── app/                # Application Source
│   │   ├── api/            # API Endpoints
│   │   ├── core/           # Config & Security
│   │   ├── models/         # Database Models
│   │   └── schemas/        # Pydantic Schemas
│   ├── uploads/            # File Storage
│   └── requirements.txt    # Python Dependencies
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable Components
│   │   ├── context/        # Global State (Auth, Theme)
│   │   ├── pages/          # Application Pages
│   │   └── App.jsx         # Main Component
│   └── package.json        # JS Dependencies
│
└── README.md               # Project Documentation
```

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---
<div align="center">

**EduGraph X** — *Where Education Meets Innovation*

</div>
