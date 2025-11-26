"""Main FastAPI application for Everbridge Kiosk."""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime
import httpx

from config import settings
from models import (
    NotificationTemplate, 
    NotificationRequest, 
    NotificationStatus,
    ConfirmationResponse,
    CriticalityLevel
)
from everbridge_client import EverbridgeClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Everbridge Kiosk API",
    description="API proxy for Everbridge emergency notifications",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Everbridge client
everbridge_client = EverbridgeClient()

# In-memory storage for notification history (in production, use a database)
notification_history: Dict[str, NotificationStatus] = {}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Everbridge Kiosk API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health/everbridge")
async def everbridge_health_check():
    """
    Check Everbridge API availability.
    
    Returns:
        Status of Everbridge API connection
    """
    try:
        # Try to reach Everbridge API with a simple authenticated request
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{settings.everbridge_api_url}/organizations/{settings.everbridge_org_id}",
                auth=(settings.everbridge_username, settings.everbridge_password)
            )
            if response.status_code == 200:
                return {
                    "status": "healthy",
                    "everbridge_api": "available",
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                logger.warning(f"Everbridge API returned status {response.status_code}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Everbridge API is not responding correctly"
                )
    except httpx.TimeoutException:
        logger.error("Everbridge API connection timeout")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Everbridge API connection timeout"
        )
    except Exception as e:
        logger.error(f"Error checking Everbridge API health: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Everbridge API unavailable: {str(e)}"
        )


@app.get("/api/templates", response_model=List[NotificationTemplate])
async def get_templates():
    """
    Get all available notification templates.
    
    Returns:
        List of notification templates
    """
    try:
        templates = await everbridge_client.get_templates()
        logger.info(f"Retrieved {len(templates)} templates")
        return templates
    except Exception as e:
        logger.error(f"Error retrieving templates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving templates: {str(e)}"
        )


@app.get("/api/templates/{template_id}", response_model=NotificationTemplate)
async def get_template(template_id: str):
    """
    Get a specific template by ID.
    
    Args:
        template_id: Template identifier
        
    Returns:
        Template details
    """
    try:
        template = await everbridge_client.get_template(template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template {template_id} not found"
            )
        logger.info(f"Retrieved template {template_id}")
        return template
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving template {template_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving template: {str(e)}"
        )


@app.post("/api/templates/{template_id}/confirm", response_model=ConfirmationResponse)
async def confirm_notification(template_id: str, request: NotificationRequest):
    """
    Process confirmation for sending a notification.
    
    The number of required confirmations depends on the template criticality:
    - LOW/MEDIUM: 2 confirmations
    - HIGH: 3 confirmations
    - CRITICAL: 3 confirmations
    
    Args:
        template_id: Template identifier
        request: Notification request with confirmation count
        
    Returns:
        Confirmation response indicating if more confirmations are needed
    """
    try:
        template = await everbridge_client.get_template(template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template {template_id} not found"
            )
        
        # Determine required confirmations based on criticality
        if template.criticality in [CriticalityLevel.CRITICAL, CriticalityLevel.HIGH]:
            required_confirmations = 3
        else:
            required_confirmations = 2
        
        current_confirmations = request.confirmation_count + 1
        can_proceed = current_confirmations >= required_confirmations
        
        if can_proceed:
            message = "Todas las confirmaciones completadas. Puede enviar la notificación."
        else:
            remaining = required_confirmations - current_confirmations
            message = f"Confirmación {current_confirmations}/{required_confirmations}. Se requieren {remaining} confirmación(es) más."
        
        return ConfirmationResponse(
            required_confirmations=required_confirmations,
            current_confirmations=current_confirmations,
            can_proceed=can_proceed,
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing confirmation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing confirmation: {str(e)}"
        )


@app.post("/api/notifications/send", response_model=NotificationStatus)
async def send_notification(request: NotificationRequest):
    """
    Send a notification using a template.
    
    Args:
        request: Notification request with template ID and variables
        
    Returns:
        Status of the sent notification
    """
    try:
        # Verify template exists
        template = await everbridge_client.get_template(request.template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template {request.template_id} not found"
            )
        
        # Send notification
        notification_status = await everbridge_client.send_notification(
            request.template_id,
            request.variables
        )
        
        # Store in history
        notification_history[notification_status.id] = notification_status
        
        logger.info(f"Notification sent successfully: {notification_status.id}")
        return notification_status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending notification: {str(e)}"
        )


@app.get("/api/notifications/{notification_id}/status", response_model=NotificationStatus)
async def get_notification_status(notification_id: str):
    """
    Get the status of a sent notification.
    
    Args:
        notification_id: Notification identifier
        
    Returns:
        Current status of the notification
    """
    try:
        # First check local history
        if notification_id in notification_history:
            # Update status from API
            updated_status = await everbridge_client.get_notification_status(notification_id)
            if updated_status:
                notification_history[notification_id] = updated_status
                return updated_status
            return notification_history[notification_id]
        
        # If not in history, fetch from API
        notification_status = await everbridge_client.get_notification_status(notification_id)
        if not notification_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification {notification_id} not found"
            )
        
        return notification_status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving notification status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving notification status: {str(e)}"
        )


@app.get("/api/notifications/history", response_model=List[NotificationStatus])
async def get_notification_history():
    """
    Get the history of sent notifications.
    
    Returns:
        List of sent notifications
    """
    return list(notification_history.values())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=settings.environment == "development"
    )
