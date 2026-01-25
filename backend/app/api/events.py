from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_session
from app.models import Event, User
from app.schemas.content import EventCreate, EventRead
from app.api.deps import require_admin, get_current_active_user

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/", response_model=EventRead)
def create_event(
    event: EventCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    db_event = Event(**event.dict())
    db_event.created_by = current_user.id
    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    return db_event

@router.get("/", response_model=List[EventRead])
def read_events(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Only return global events (where club_id is None)
    events = session.execute(select(Event).where(Event.club_id.is_(None))).scalars().all()
    return events
