# API Documentation

## Base URL

- Development: `http://localhost:8000`
- Production: Configure according to your deployment

## Authentication

Currently, the API uses basic authentication stored in environment variables. The backend handles authentication with Everbridge API automatically.

## Endpoints

### System Endpoints

#### GET /
Get API information.

**Response:**
```json
{
  "name": "Everbridge Kiosk API",
  "version": "1.0.0",
  "status": "running"
}
```

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-26T05:07:27.463772"
}
```

### Template Endpoints

#### GET /api/templates
Get all available notification templates.

**Response:**
```json
[
  {
    "id": "template_001",
    "name": "Incendio - Evacuación Inmediata",
    "description": "Notificación de emergencia por incendio",
    "criticality": "critical",
    "message_subject": "EMERGENCIA: Evacuación por Incendio",
    "message_body": "Se ha detectado un incendio. Evacúe el edificio inmediatamente...",
    "contact_paths": ["SMS", "Email", "Voice"],
    "variables": {}
  }
]
```

#### GET /api/templates/{template_id}
Get a specific template by ID.

**Parameters:**
- `template_id` (path): Template identifier

**Response:**
```json
{
  "id": "template_002",
  "name": "Emergencia Médica",
  "description": "Notificación de emergencia médica",
  "criticality": "high",
  "message_subject": "URGENTE: Emergencia Médica",
  "message_body": "Se requiere asistencia médica inmediata en {{location}}.",
  "contact_paths": ["SMS", "Voice"],
  "variables": {
    "location": ""
  }
}
```

#### POST /api/templates/{template_id}/confirm
Process confirmation for sending a notification.

**Parameters:**
- `template_id` (path): Template identifier

**Request Body:**
```json
{
  "template_id": "template_002",
  "variables": {
    "location": "Edificio Principal - Piso 3"
  },
  "confirmation_count": 0
}
```

**Response:**
```json
{
  "required_confirmations": 3,
  "current_confirmations": 1,
  "can_proceed": false,
  "message": "Confirmación 1/3. Se requieren 2 confirmación(es) más."
}
```

### Notification Endpoints

#### POST /api/notifications/send
Send a notification using a template.

**Request Body:**
```json
{
  "template_id": "template_002",
  "variables": {
    "location": "Edificio Principal - Piso 3"
  },
  "confirmation_count": 3
}
```

**Response:**
```json
{
  "id": "notif_20251126050730",
  "template_name": "Emergencia Médica",
  "status": "sent",
  "sent_at": "2025-11-26T05:07:30.123456",
  "recipients_count": 150,
  "delivered_count": 0,
  "failed_count": 0,
  "details": {
    "template_id": "template_002",
    "variables": {
      "location": "Edificio Principal - Piso 3"
    },
    "contact_paths": ["SMS", "Voice"]
  }
}
```

#### GET /api/notifications/{notification_id}/status
Get the status of a sent notification.

**Parameters:**
- `notification_id` (path): Notification identifier

**Response:**
```json
{
  "id": "notif_20251126050730",
  "template_name": "Emergencia Médica",
  "status": "delivered",
  "sent_at": "2025-11-26T05:07:30.123456",
  "recipients_count": 150,
  "delivered_count": 145,
  "failed_count": 5,
  "details": {}
}
```

#### GET /api/notifications/history
Get the history of sent notifications.

**Response:**
```json
[
  {
    "id": "notif_20251126050730",
    "template_name": "Emergencia Médica",
    "status": "delivered",
    "sent_at": "2025-11-26T05:07:30.123456",
    "recipients_count": 150,
    "delivered_count": 145,
    "failed_count": 5,
    "details": {}
  }
]
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200 OK` - Request successful
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Interactive Documentation

FastAPI provides interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
