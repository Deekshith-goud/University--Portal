
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import json # Added json import
from app.core.database import get_session
from app.models import Club, ClubMembership, User, Event, Announcement, EventRegistration
from app.api.deps import get_current_active_user, require_faculty
from app.schemas.auth import UserOut
from app.schemas.content import EventRead, EventCreate, AnnouncementRead, AnnouncementCreate, EventRegistrationCreate, EventRegistrationRead

router = APIRouter(prefix="/clubs", tags=["clubs"])

# Pydantic Schemas
class ClubCreate(BaseModel):
    name: str
    description: str
    category: str
    color: str
    icon: str
    highlights: Optional[str] = None
    banner_image: Optional[str] = None

class ClubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    highlights: Optional[str] = None
    banner_image: Optional[str] = None

class ClubRead(BaseModel):
    id: int
    name: str
    description: str
    category: str
    color: str
    icon: str
    created_at: str
    member_count: int = 0
    is_joined: bool = False
    my_role: Optional[str] = None # 'lead' or 'member'
    highlights: Optional[str] = None
    banner_image: Optional[str] = None

    class Config:
        from_attributes = True

# List Clubs
@router.get("/", response_model=List[ClubRead])
def read_clubs(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    clubs = session.query(Club).all()
    result = []
    
    for club in clubs:
        member_count = session.query(func.count(ClubMembership.id)).filter(ClubMembership.club_id == club.id).scalar()
        membership = session.query(ClubMembership).filter(
            ClubMembership.club_id == club.id, 
            ClubMembership.student_id == current_user.id
        ).first()
        is_joined = membership is not None
        my_role = membership.role if membership else None
        
        # Convert to Pydantic model manually due to computed fields
        club_data = ClubRead(
            id=club.id,
            name=club.name,
            description=club.description,
            category=club.category,
            color=club.color,
            icon=club.icon,
            created_at=str(club.created_at),
            member_count=member_count,
            is_joined=is_joined,
            my_role=my_role,
            highlights=club.highlights,
            banner_image=club.banner_image
        )
        result.append(club_data)
        
    return result

# Get Single Club
@router.get("/{club_id}", response_model=ClubRead)
def read_club(
    club_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    club = session.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    member_count = session.query(func.count(ClubMembership.id)).filter(ClubMembership.club_id == club.id).scalar()
    membership = session.query(ClubMembership).filter(
        ClubMembership.club_id == club_id, 
        ClubMembership.student_id == current_user.id
    ).first()
    is_joined = membership is not None
    my_role = membership.role if membership else None

    return ClubRead(
        id=club.id,
        name=club.name,
        description=club.description,
        category=club.category,
        color=club.color,
        icon=club.icon,
        created_at=str(club.created_at),
        member_count=member_count,
        is_joined=is_joined,
        my_role=my_role,
        highlights=club.highlights,
        banner_image=club.banner_image
    )

# Create Club (Faculty/Admin Only)
@router.post("/", response_model=ClubRead)
def create_club(
    club_in: ClubCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_faculty) # Admin is implied as faculty can include admin in logic usually, or require_admin
):
    club = Club(
        name=club_in.name,
        description=club_in.description,
        category=club_in.category,
        color=club_in.color,
        icon=club_in.icon,
        created_by=current_user.id,
        highlights=club_in.highlights,
        banner_image=club_in.banner_image
    )
    session.add(club)
    session.commit()
    session.refresh(club)
    
    return ClubRead(
        id=club.id,
        name=club.name,
        description=club.description,
        category=club.category,
        color=club.color,
        icon=club.icon,
        created_at=str(club.created_at),
        member_count=0,
        is_joined=False,
        my_role=None,
        highlights=club.highlights,
        banner_image=club.banner_image
    )

# Join/Leave Club
@router.post("/{club_id}/join")
def toggle_join_club(
    club_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    membership = session.query(ClubMembership).filter(
        ClubMembership.club_id == club_id,
        ClubMembership.student_id == current_user.id
    ).first()
    
    if membership:
        session.delete(membership)
        session.commit()
        return {"message": "Left club", "is_joined": False}
    else:
        new_membership = ClubMembership(club_id=club_id, student_id=current_user.id)
        session.add(new_membership)
        session.commit()
        return {"message": "Joined club", "is_joined": True}

# Update Club Details
@router.put("/{club_id}", response_model=ClubRead)
def update_club(
    club_id: int,
    club_in: ClubUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    club = session.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    # Permission Check
    is_faculty = current_user.role in ["faculty", "admin"]
    membership = session.query(ClubMembership).filter(
        ClubMembership.club_id == club_id,
        ClubMembership.student_id == current_user.id
    ).first()
    is_lead = membership and membership.role == "lead"

    if not (is_faculty or is_lead):
        raise HTTPException(status_code=403, detail="Not authorized to update this club")

    if club_in.name: club.name = club_in.name
    if club_in.description: club.description = club_in.description
    if club_in.category: club.category = club_in.category
    if club_in.color: club.color = club_in.color
    if club_in.icon: club.icon = club_in.icon
    if club_in.highlights: club.highlights = club_in.highlights
    if club_in.banner_image is not None: club.banner_image = club_in.banner_image # Allow clearing if empty string passed, or update if value

    session.commit()
    session.refresh(club)

    # Return ClubRead format
    member_count = session.query(func.count(ClubMembership.id)).filter(ClubMembership.club_id == club.id).scalar()
    is_joined = membership is not None # We already fetched membership above
    my_role = membership.role if membership else None

    return ClubRead(
        id=club.id,
        name=club.name,
        description=club.description,
        category=club.category,
        color=club.color,
        icon=club.icon,
        created_at=str(club.created_at),
        member_count=member_count,
        is_joined=is_joined,
        my_role=my_role,
        highlights=club.highlights,
        banner_image=club.banner_image
    )

class ClubMemberRead(BaseModel):
    id: int
    name: str
    email: str
    role: str # 'lead' or 'member'

# List Club Members
@router.get("/{club_id}/members", response_model=List[ClubMemberRead])
def read_club_members(
    club_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Verify club exists
    club = session.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
        
    members_with_roles = []
    results = session.query(User, ClubMembership.role).join(ClubMembership).filter(ClubMembership.club_id == club_id).all()
    for user, role in results:
        members_with_roles.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": role 
        })
    return members_with_roles

# Create Club Event
@router.post("/{club_id}/events", response_model=EventRead)
def create_club_event(
    club_id: int,
    event_in: EventCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    club = session.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
        
    # Permission Check (Same as update)
    is_faculty = current_user.role in ["faculty", "admin"]
    membership = session.query(ClubMembership).filter(
        ClubMembership.club_id == club_id,
        ClubMembership.student_id == current_user.id
    ).first()
    is_lead = membership and membership.role == "lead"

    if not (is_faculty or is_lead):
        raise HTTPException(status_code=403, detail="Not authorized to add events to this club")
        
    db_event = Event(**event_in.dict())
    db_event.created_by = current_user.id
    db_event.club_id = club_id
    
    try:
        print(f"DEBUG: Creating event with data: {event_in.dict()}")
        session.add(db_event)
        session.commit()
        session.refresh(db_event)
        return db_event
    except Exception as e:
        print(f"ERROR creating event: {e}")
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# List Club Events
@router.get("/{club_id}/events", response_model=List[EventRead])
def read_club_events(
    club_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    events = session.query(Event).filter(Event.club_id == club_id).order_by(Event.date).all()
    results = []
    
    for event in events:
        reg_count = session.query(func.count(EventRegistration.id)).filter(EventRegistration.event_id == event.id).scalar()
        is_reg = session.query(EventRegistration).filter(
            EventRegistration.event_id == event.id,
            EventRegistration.student_id == current_user.id
        ).first() is not None
        
        # Convert to Pydantic
        event_dict = EventRead(
            id=event.id,
            title=event.title,
            description=event.description,
            date=event.date,
            location=event.location,
            image_banner=event.image_banner,
            requires_registration=event.requires_registration,
            event_type=event.event_type,
            participation_type=event.participation_type,
            min_team_size=event.min_team_size,
            max_team_size=event.max_team_size,
            created_by=event.created_by,
            registration_count=reg_count,
            is_registered=is_reg
        )
        results.append(event_dict)

    return results

# Delete Club Event
@router.delete("/{club_id}/events/{event_id}")
def delete_club_event(
    club_id: int,
    event_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Permission Check
    is_faculty = current_user.role in ["faculty", "admin"]
    membership = session.query(ClubMembership).filter(
        ClubMembership.club_id == club_id,
        ClubMembership.student_id == current_user.id
    ).first()
    is_lead = membership and membership.role == "lead"

    if not (is_faculty or is_lead):
        raise HTTPException(status_code=403, detail="Not authorized to delete events")

    event = session.query(Event).filter(Event.id == event_id, Event.club_id == club_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    session.delete(event)
    session.commit()
    return {"message": "Event deleted"}

# Register for Event
@router.post("/{club_id}/events/{event_id}/register")
def register_for_event(
    club_id: int,
    event_id: int,
    reg_in: EventRegistrationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    event = session.query(Event).filter(Event.id == event_id, Event.club_id == club_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    registration = session.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.student_id == current_user.id
    ).first()
    
    if registration:
        raise HTTPException(status_code=400, detail="Already registered")
    
    new_reg = EventRegistration(
        event_id=event_id, 
        student_id=current_user.id,
        team_name=reg_in.team_name,
        team_size=reg_in.team_size,
        member_details=reg_in.member_details
    )
    session.add(new_reg)
    session.commit()
    return {"message": "Registered successfully", "is_registered": True}

# Unregister from Event
@router.delete("/{club_id}/events/{event_id}/register")
def unregister_from_event(
    club_id: int,
    event_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    event = session.query(Event).filter(Event.id == event_id, Event.club_id == club_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    registration = session.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.student_id == current_user.id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=400, detail="Not registered")
        
    session.delete(registration)
    session.commit()
    return {"message": "Unregistered", "is_registered": False}

# Get Event Registrations (For Leads/Faculty)
@router.get("/{club_id}/events/{event_id}/registrations", response_model=List[EventRegistrationRead])
def read_event_registrations(
    club_id: int,
    event_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Permission Check
    is_faculty = current_user.role in ["faculty", "admin"]
    membership = session.query(ClubMembership).filter(
        ClubMembership.club_id == club_id,
        ClubMembership.student_id == current_user.id
    ).first()
    is_lead = membership and membership.role == "lead"

    if not (is_faculty or is_lead):
        raise HTTPException(status_code=403, detail="Not authorized to view registrations")

    registrations = session.query(EventRegistration).filter(EventRegistration.event_id == event_id).all()
    results = []
    
    for reg in registrations:
        student = session.query(User).filter(User.id == reg.student_id).first()
        results.append({
            "id": reg.id,
            "student_id": student.id,
            "student_name": student.name,
            "student_email": student.email,
            "registration_number": student.registration_number,
            "branch": student.branch,
            "section": student.section,
            "registered_at": reg.registered_at,
            "team_name": reg.team_name,
            "team_size": reg.team_size,
            "member_details": reg.member_details
        })
        
    return results

# Create Club Announcement
@router.post("/{club_id}/announcements", response_model=AnnouncementRead)
def create_club_announcement(
    club_id: int,
    announcement_in: AnnouncementCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    club = session.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
        
    # Permission Check
    is_faculty = current_user.role in ["faculty", "admin"]
    membership = session.query(ClubMembership).filter(
        ClubMembership.club_id == club_id,
        ClubMembership.student_id == current_user.id
    ).first()
    is_lead = membership and membership.role == "lead"

    if not (is_faculty or is_lead):
        raise HTTPException(status_code=403, detail="Not authorized to post announcements")
        
    ann_data = announcement_in.dict()
    attachments_list = ann_data.pop('attachments', [])
    ann_data['attachments'] = json.dumps(attachments_list) if attachments_list else "[]"
    
    db_announcement = Announcement(**ann_data)
    db_announcement.created_by = current_user.id
    db_announcement.club_id = club_id
    
    session.add(db_announcement)
    session.commit()
    session.refresh(db_announcement)
    
    # Manually construct response to handle attachments correctly
    response_dict = db_announcement.__dict__.copy()
    response_dict['attachments'] = attachments_list
    return response_dict

# List Club Announcements
@router.get("/{club_id}/announcements", response_model=List[AnnouncementRead])
def read_club_announcements(
    club_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    announcements = session.query(Announcement).filter(
        Announcement.club_id == club_id
    ).order_by(Announcement.published_at.desc()).all()
    
    results = []
    for ann in announcements:
        # Convert ORM to dict safely
        ann_dict = {
            "id": ann.id,
            "title": ann.title,
            "content": ann.content,
            "priority": ann.priority,
            "published_at": ann.published_at,
            "created_by": ann.created_by,
            "club_id": ann.club_id
        }
        
        # Parse attachments
        try:
            ann_dict["attachments"] = json.loads(ann.attachments) if ann.attachments else []
        except:
            ann_dict["attachments"] = []
            
        results.append(ann_dict)
        
    return results
    return announcements

# Delete Club Announcement
@router.delete("/{club_id}/announcements/{announcement_id}")
def delete_club_announcement(
    club_id: int,
    announcement_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Permission Check
    is_faculty = current_user.role in ["faculty", "admin"]
    membership = session.query(ClubMembership).filter(
        ClubMembership.club_id == club_id,
        ClubMembership.student_id == current_user.id
    ).first()
    is_lead = membership and membership.role == "lead"

    if not (is_faculty or is_lead):
        raise HTTPException(status_code=403, detail="Not authorized to delete announcements")

    announcement = session.query(Announcement).filter(Announcement.id == announcement_id, Announcement.club_id == club_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
        
    session.delete(announcement)
    session.commit()
    return {"message": "Announcement deleted"}

# Update Member Role (Promote/Demote)
@router.put("/{club_id}/members/{student_id}/role")
def update_member_role(
    club_id: int,
    student_id: int,
    role: str = "member", # member or lead
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user) # Changed from require_faculty to allow Leads check
):
    if role not in ["member", "coordinator", "lead"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    # Check permissions
    is_faculty = current_user.role in ["faculty", "admin"]
    
    # Check if user is a lead of THIS club
    membership_requester = session.query(ClubMembership).filter(
        ClubMembership.club_id == club_id,
        ClubMembership.student_id == current_user.id
    ).first()
    is_lead = membership_requester and membership_requester.role == "lead"
    
    if not (is_faculty or is_lead):
         raise HTTPException(status_code=403, detail="Not authorized to manage members")

    membership = session.query(ClubMembership).filter(
        ClubMembership.club_id == club_id,
        ClubMembership.student_id == student_id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
        
    membership.role = role
    session.commit()
    
    return {"message": f"User role updated to {role}"}
