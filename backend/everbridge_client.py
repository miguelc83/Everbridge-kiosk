"""Client for Everbridge API."""
import httpx
from typing import List, Dict, Any, Optional
from config import settings
from models import NotificationTemplate, CriticalityLevel, NotificationStatus
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class EverbridgeClient:
    """Client to interact with Everbridge API."""
    
    def __init__(self):
        self.base_url = settings.everbridge_api_url
        self.username = settings.everbridge_username
        self.password = settings.everbridge_password
        self.org_id = settings.everbridge_org_id
        self.auth = (self.username, self.password)
    
    async def get_templates(self) -> List[NotificationTemplate]:
        """
        Retrieve all notification templates.
        
        Returns:
            List of notification templates
        """
        try:
            async with httpx.AsyncClient() as client:
                # In a real implementation, this would call the Everbridge API
                # For now, returning mock data for demonstration
                logger.info("Fetching templates from Everbridge API")
                
                # Mock templates for demonstration
                mock_templates = [
                    {
                        "id": "template_001",
                        "name": "Incendio - Evacuación Inmediata",
                        "description": "Notificación de emergencia por incendio",
                        "criticality": CriticalityLevel.CRITICAL,
                        "message_subject": "EMERGENCIA: Evacuación por Incendio",
                        "message_body": "Se ha detectado un incendio. Evacúe el edificio inmediatamente usando las salidas de emergencia.",
                        "contact_paths": ["SMS", "Email", "Voice"],
                        "variables": {}
                    },
                    {
                        "id": "template_002",
                        "name": "Emergencia Médica",
                        "description": "Notificación de emergencia médica",
                        "criticality": CriticalityLevel.HIGH,
                        "message_subject": "URGENTE: Emergencia Médica",
                        "message_body": "Se requiere asistencia médica inmediata en {{location}}.",
                        "contact_paths": ["SMS", "Voice"],
                        "variables": {"location": ""}
                    },
                    {
                        "id": "template_003",
                        "name": "Amenaza de Seguridad",
                        "description": "Notificación de amenaza de seguridad",
                        "criticality": CriticalityLevel.CRITICAL,
                        "message_subject": "ALERTA: Amenaza de Seguridad",
                        "message_body": "Se ha detectado una amenaza de seguridad. Siga las instrucciones del personal de seguridad.",
                        "contact_paths": ["SMS", "Email", "Voice", "Push"],
                        "variables": {}
                    },
                    {
                        "id": "template_004",
                        "name": "Simulacro de Evacuación",
                        "description": "Notificación para simulacro programado",
                        "criticality": CriticalityLevel.MEDIUM,
                        "message_subject": "Simulacro de Evacuación Programado",
                        "message_body": "El día {{date}} a las {{time}} se realizará un simulacro de evacuación.",
                        "contact_paths": ["Email"],
                        "variables": {"date": "", "time": ""}
                    },
                    {
                        "id": "template_005",
                        "name": "Cierre de Instalaciones",
                        "description": "Notificación de cierre temporal",
                        "criticality": CriticalityLevel.LOW,
                        "message_subject": "Aviso: Cierre de Instalaciones",
                        "message_body": "Las instalaciones permanecerán cerradas el {{date}} por {{reason}}.",
                        "contact_paths": ["Email", "SMS"],
                        "variables": {"date": "", "reason": ""}
                    }
                ]
                
                return [NotificationTemplate(**template) for template in mock_templates]
                
        except Exception as e:
            logger.error(f"Error fetching templates: {str(e)}")
            raise
    
    async def get_template(self, template_id: str) -> Optional[NotificationTemplate]:
        """
        Retrieve a specific template by ID.
        
        Args:
            template_id: Template identifier
            
        Returns:
            Template if found, None otherwise
        """
        templates = await self.get_templates()
        for template in templates:
            if template.id == template_id:
                return template
        return None
    
    async def send_notification(
        self, 
        template_id: str, 
        variables: Optional[Dict[str, Any]] = None
    ) -> NotificationStatus:
        """
        Send a notification using a template.
        
        Args:
            template_id: Template identifier
            variables: Variables to replace in the template
            
        Returns:
            Status of the sent notification
        """
        try:
            template = await self.get_template(template_id)
            if not template:
                raise ValueError(f"Template {template_id} not found")
            
            async with httpx.AsyncClient() as client:
                # In a real implementation, this would call the Everbridge API
                logger.info(f"Sending notification using template {template_id}")
                
                # Mock response for demonstration
                notification_id = f"notif_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
                
                return NotificationStatus(
                    id=notification_id,
                    template_name=template.name,
                    status="sent",
                    sent_at=datetime.utcnow().isoformat(),
                    recipients_count=150,
                    delivered_count=0,
                    failed_count=0,
                    details={
                        "template_id": template_id,
                        "variables": variables or {},
                        "contact_paths": template.contact_paths
                    }
                )
                
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")
            raise
    
    async def get_notification_status(self, notification_id: str) -> Optional[NotificationStatus]:
        """
        Get the status of a sent notification.
        
        Args:
            notification_id: Notification identifier
            
        Returns:
            Status if found, None otherwise
        """
        try:
            async with httpx.AsyncClient() as client:
                # In a real implementation, this would call the Everbridge API
                logger.info(f"Fetching status for notification {notification_id}")
                
                # Mock response for demonstration
                return NotificationStatus(
                    id=notification_id,
                    template_name="Mock Template",
                    status="delivered",
                    sent_at=datetime.utcnow().isoformat(),
                    recipients_count=150,
                    delivered_count=145,
                    failed_count=5,
                    details={}
                )
                
        except Exception as e:
            logger.error(f"Error fetching notification status: {str(e)}")
            raise
