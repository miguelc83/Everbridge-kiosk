# Integración con API de Everbridge

## Descripción General

El Kiosko Everbridge utiliza la API REST de Everbridge para gestionar plantillas de notificación y enviar alertas de emergencia. Este documento describe cómo la aplicación se integra con Everbridge y qué configurar.

## Endpoints de Everbridge Utilizados

### 1. Verificación de Salud de API
- **Endpoint**: `GET /organizations/{organizationId}`
- **Propósito**: Verificar que la API está disponible y las credenciales son válidas
- **Frecuencia**: Cada 10 segundos desde el frontend (LED indicador)

### 2. Obtener Plantillas
- **Endpoint**: `GET /notificationTemplates/{organizationId}`
- **Propósito**: Recuperar todas las plantillas de notificación disponibles
- **Mapeo de Datos**:
  - `id` / `templateId` → ID de plantilla
  - `name` / `templateName` → Nombre de la plantilla
  - `description` → Descripción
  - `subject` → Asunto del mensaje
  - `message` / `textMessage` → Cuerpo del mensaje
  - `deliveryMethods` → Canales de contacto (SMS, Email, Voice, Push)

### 3. Enviar Notificación
- **Endpoint**: `POST /notifications/{organizationId}`
- **Propósito**: Enviar una notificación usando una plantilla
- **Payload**:
```json
{
  "message": "Mensaje completo con variables reemplazadas",
  "subject": "Asunto del mensaje",
  "notificationTemplateId": "ID de la plantilla",
  "variables": {
    "variable1": "valor1",
    "variable2": "valor2"
  }
}
```

### 4. Consultar Estado de Notificación
- **Endpoint**: `GET /notifications/{organizationId}/{notificationId}`
- **Propósito**: Obtener el estado y estadísticas de una notificación enviada
- **Respuesta incluye**:
  - `status`: Estado de la notificación
  - `recipientCount`: Total de destinatarios
  - `deliveredCount`: Notificaciones entregadas
  - `failedCount`: Notificaciones fallidas

## Configuración

### Variables de Entorno Requeridas

Editar el archivo `backend/.env`:

```bash
# URL base de la API de Everbridge
EVERBRIDGE_API_URL=https://api.everbridge.net/rest

# Credenciales de autenticación
EVERBRIDGE_USERNAME=tu_usuario_everbridge
EVERBRIDGE_PASSWORD=tu_contraseña_everbridge

# ID de tu organización en Everbridge
EVERBRIDGE_ORG_ID=12345678
```

### Cómo Obtener las Credenciales

1. **URL de API**: Generalmente es `https://api.everbridge.net/rest` para la nube pública de Everbridge
2. **Username y Password**: Credenciales de un usuario con permisos para:
   - Ver plantillas de notificación
   - Enviar notificaciones
   - Consultar estado de notificaciones
3. **Organization ID**: Disponible en el panel de administración de Everbridge

## Determinación de Criticidad

El sistema determina automáticamente la criticidad de las plantillas basándose en:

1. **Campo `priority` en Everbridge**: Si existe, se usa directamente
2. **Palabras clave en el nombre**:
   - `critical`, `crítico`, `emergency`, `emergencia` → **CRÍTICO**
   - `high`, `alto`, `urgent`, `urgente` → **ALTO**
   - `medium`, `medio` → **MEDIO**
   - Otros → **BAJO**

### Confirmaciones Requeridas por Criticidad

- **CRÍTICO**: 3 confirmaciones
- **ALTO**: 3 confirmaciones
- **MEDIO**: 2 confirmaciones
- **BAJO**: 2 confirmaciones

## Extracción de Variables

El sistema detecta automáticamente variables en las plantillas usando el formato `{{variable}}`.

**Ejemplo**:
```
Mensaje: "Emergencia en {{location}} requiere evacuación inmediata"
Variables detectadas: { "location": "" }
```

## Manejo de Errores y Fallback

### Modo de Fallback con Mock Data

Si la API de Everbridge no está disponible o falla:

1. **Templates**: Se usan plantillas mock predefinidas (5 plantillas de ejemplo)
2. **Health Check**: El LED Everbridge muestra rojo
3. **Envío de Notificaciones**: Falla con mensaje de error claro

### Timeouts

- **Health Check**: 5 segundos
- **Obtener Templates**: 30 segundos
- **Enviar Notificación**: 30 segundos
- **Estado de Notificación**: 30 segundos

## Mapeo de Canales de Contacto

| Everbridge | Kiosko |
|-----------|---------|
| SMS | SMS |
| EMAIL / MAIL | Email |
| VOICE / PHONE | Voice |
| PUSH | Push |

## Testing de la Integración

### 1. Verificar Conectividad

```bash
curl -u "usuario:contraseña" \
  https://api.everbridge.net/rest/organizations/12345678
```

Debe retornar código 200 con datos de la organización.

### 2. Listar Templates

```bash
curl -u "usuario:contraseña" \
  https://api.everbridge.net/rest/notificationTemplates/12345678
```

### 3. Ver Logs de Integración

```bash
# En el backend
tail -f logs/backend.log | grep -i everbridge

# O con docker
docker-compose logs -f backend | grep -i everbridge
```

## Versión de API Soportada

El código está diseñado para trabajar con **Everbridge REST API v12** y versiones compatibles.

## Notas de Seguridad

1. **Nunca** commitear el archivo `.env` con credenciales reales
2. Las credenciales se envían usando **HTTP Basic Authentication** sobre HTTPS
3. El backend actúa como proxy, el frontend nunca ve las credenciales
4. En producción, considerar usar:
   - Variables de entorno del sistema
   - Gestores de secretos (AWS Secrets Manager, Azure Key Vault, etc.)
   - Rotación periódica de credenciales

## Troubleshooting

### LED Everbridge siempre rojo

1. Verificar credenciales en `.env`
2. Verificar que el Organization ID es correcto
3. Verificar conectividad de red a `api.everbridge.net`
4. Revisar logs del backend para mensajes de error específicos

### No se muestran plantillas

1. Verificar que el usuario tiene permisos para ver templates
2. Verificar que existen templates en Everbridge
3. El sistema usa mock data si no encuentra templates

### Error al enviar notificaciones

1. Verificar que el usuario tiene permisos para enviar notificaciones
2. Verificar que el template ID es válido
3. Verificar que todas las variables requeridas tienen valores

## Recursos Adicionales

- [Documentación oficial de Everbridge REST API](https://www.everbridge.com/api/)
- [Guía de autenticación](https://www.everbridge.com/api/authentication)
- Soporte de Everbridge: https://support.everbridge.com
