from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

# -----------------------------------------------------------------------------
# User Model
# -----------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # "student", "faculty", "admin"
    is_active = Column(Boolean, default=True)

    # Student Details
    registration_number = Column(String(50), unique=True, nullable=True) # Unique for students
    branch = Column(String(50), nullable=True)
    section = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True) # 1-4 for students, NULL for others
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships (Optional but good for access)
    assignments = relationship("Assignment", back_populates="faculty")
    submissions = relationship("Submission", back_populates="student")
    achievements = relationship("Achievement", back_populates="user")

class OTP(Base):
    __tablename__ = "otps"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True, nullable=False)
    otp = Column(String(6), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_verified = Column(Boolean, default=False)
    purpose = Column(String(50), default="login") # login, signup, reset

# -----------------------------------------------------------------------------
# Academic Models
# -----------------------------------------------------------------------------
class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id"))
    deadline = Column(DateTime, nullable=False)
    
    # New Fields for Targeting & Content
    attachment_url = Column(String(255), nullable=True)
    branch = Column(String(50), nullable=True)
    section = Column(String(50), nullable=True)

    faculty = relationship("User", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    file_url = Column(String(255), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    # New Fields
    registration_number = Column(String(50), nullable=True)
    branch = Column(String(50), nullable=True)
    section = Column(String(10), nullable=True)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")

# -----------------------------------------------------------------------------
# Content & Events
# -----------------------------------------------------------------------------
class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=True)
    
    # Enhanced Fields
    location = Column(String(255), nullable=True)
    image_banner = Column(String(500), nullable=True)
    requires_registration = Column(Boolean, default=False)
    event_type = Column(String(100), default="Event") # Workshop, Webinar, etc.
    
    # Team / Participation Settings
    participation_type = Column(String(50), default="individual") # "individual" or "team"
    min_team_size = Column(Integer, default=1)
    max_team_size = Column(Integer, default=1)

    # College Event Scope Fields
    registration_deadline = Column(DateTime, nullable=True)
    is_open = Column(Boolean, default=True)
    eligibility = Column(Text, nullable=True) # JSON: List[str]
    venue = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    image_poster = Column(String(500), nullable=True)
    attachments = Column(Text, nullable=True) # JSON
    
    # New Coordinator & Dept Fields
    target_departments = Column(Text, nullable=True) # JSON: List[str] e.g. ["CSE", "ECE"]
    coordinator_name = Column(String(100), nullable=True)
    coordinator_details = Column(Text, nullable=True) # Extra text info

    club = relationship("Club", back_populates="events")
    registrations = relationship("EventRegistration", back_populates="event")
    achievements = relationship("Achievement", back_populates="event")

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    registered_at = Column(DateTime, default=datetime.utcnow)
    
    # Team Details (if applicable)
    team_name = Column(String(100), nullable=True)
    team_size = Column(Integer, default=1)
    member_details = Column(Text, nullable=True) # JSON string of other members
    
    # Extended Details
    student_phone = Column(String(20), nullable=True)
    student_email = Column(String(255), nullable=True)
    id_proof_url = Column(String(500), nullable=True)
    payment_screenshot_url = Column(String(500), nullable=True)
    
    # Snapshot of User Details at registration time
    student_name = Column(String(255), nullable=True)
    registration_number = Column(String(50), nullable=True)
    branch = Column(String(50), nullable=True)
    section = Column(String(50), nullable=True)

    event = relationship("Event", back_populates="registrations")
    student = relationship("User")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    published_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    attachments = Column(Text, nullable=True) # JSON string of [{name, url}]
    priority = Column(String(50), default="normal") # normal, urgent, circular
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=True)
    
    # Official Announcement Fields
    category = Column(String(100), default="Notice")
    is_pinned = Column(Boolean, default=False)
    target_departments = Column(Text, nullable=True) # JSON
    target_years = Column(Text, nullable=True) # JSON: List[int] or List[str]
    images = Column(Text, nullable=True) # JSON

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)
    file_url = Column(String(255), nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    is_approved = Column(Boolean, default=False)
    
    # Explore / Contribution Fields
    branch = Column(String(50), nullable=True)  # e.g. CSE, ECE
    year = Column(Integer, nullable=True)   # e.g. 1-4
    tag = Column(String(100), nullable=True)    # e.g. Unit-1, Midterm
    section = Column(String(50), nullable=True) # e.g. A, B, Unique Section

    uploaded_by = relationship("User")

# -----------------------------------------------------------------------------
# Club Models
# -----------------------------------------------------------------------------
class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # e.g. Technical, Arts, Sports
    color = Column(String(100), nullable=False) # Gradient class e.g. "from-blue-500 to-cyan-500"
    icon = Column(String(50), nullable=False) # Lucide icon name e.g. "Cpu"
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    highlights = Column(Text, nullable=True)
    banner_image = Column(String(500), nullable=True)

    memberships = relationship("ClubMembership", back_populates="club")
    events = relationship("Event", back_populates="club")

class ClubMembership(Base):
    __tablename__ = "club_memberships"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    club_id = Column(Integer, ForeignKey("clubs.id"))
    joined_at = Column(DateTime, default=datetime.utcnow)
    role = Column(String(50), default="member") # member, lead

    club = relationship("Club", back_populates="memberships")
    student = relationship("User")

    created_at = Column(DateTime, default=datetime.utcnow)

# -----------------------------------------------------------------------------
# Achievement Model
# -----------------------------------------------------------------------------
class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Event Linkage (Internal vs External)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    external_event_name = Column(String(255), nullable=True) # For external events
    
    # Details
    title = Column(String(255), nullable=False) # e.g. Winner, Topper
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Internal") # Internal, External, Academic, Sports
    badge = Column(String(50), default="Gold") # Gold, Silver, Bronze, Participate
    
    # Media
    image_url = Column(String(500), nullable=True) # Photo of winning
    certificate_url = Column(String(500), nullable=True) # Proof
    
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="achievements")
    user = relationship("User", back_populates="achievements")
