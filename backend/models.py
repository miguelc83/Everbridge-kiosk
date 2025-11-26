"""Data models for Everbridge Kiosk."""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum


class CriticalityLevel(str, Enum):
    """Notification criticality levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class NotificationTemplate(BaseModel):
    """Notification template model."""
    id: str
    name: str
    description: Optional[str] = None
    criticality: CriticalityLevel
    message_subject: Optional[str] = None
    message_body: Optional[str] = None
    contact_paths: Optional[List[str]] = []
    variables: Optional[Dict[str, Any]] = {}


class NotificationRequest(BaseModel):
    """Request to send a notification."""
    template_id: str
    variables: Optional[Dict[str, Any]] = {}
    confirmation_count: int = 0


class NotificationStatus(BaseModel):
    """Status of a sent notification."""
    id: str
    template_name: str
    status: str
    sent_at: str
    recipients_count: Optional[int] = 0
    delivered_count: Optional[int] = 0
    failed_count: Optional[int] = 0
    details: Optional[Dict[str, Any]] = {}


class ConfirmationResponse(BaseModel):
    """Response for confirmation step."""
    required_confirmations: int
    current_confirmations: int
    can_proceed: bool
    message: str
