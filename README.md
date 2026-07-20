# Kiosko Everbridge

Sistema de autoservicio web para lanzar notificaciones de emergencia desde plantillas predefinidas de Everbridge.

## 📋 Descripción

Kiosko Everbridge es una aplicación web diseñada para simplificar el proceso de envío de notificaciones de emergencia. Proporciona una interfaz intuitiva y guiada que reduce errores y acelera la respuesta en situaciones críticas, sin exponer el portal completo de Everbridge.

### Características Principales

- **Interfaz Simplificada**: Flujo guiado paso a paso
- **Confirmaciones Múltiples**: Doble o triple confirmación según criticidad
- **Vista de Estado**: Monitoreo en tiempo real de notificaciones enviadas
- **Modo Kiosko**: Optimizado para Raspberry Pi con Chromium en pantalla completa
- **API Proxy**: Backend FastAPI que actúa como proxy seguro a la API de Everbridge

### Flujo de Trabajo

1. **Listar Plantillas** - Ver todas las plantillas de notificación disponibles
2. **Ver Detalle** - Revisar los detalles de la plantilla seleccionada
3. **Confirmar** - Confirmación múltiple basada en criticidad (2-3 veces)
4. **Enviar** - Envío de la notificación
5. **Ver Estado** - Monitoreo del estado de entrega en tiempo real

## 🏗️ Arquitectura

### Stack Tecnológico

- **Backend**: FastAPI (Python)
- **Frontend**: React + TypeScript (Vite)
- **Despliegue**: Raspberry Pi + Chromium (modo kiosko)
- **Containerización**: Docker + Docker Compose

### Estructura del Proyecto

```
Everbridge-kiosk/
├── backend/                    # Backend FastAPI
│   ├── main.py                # Aplicación principal
│   ├── config.py              # Configuración
│   ├── models.py              # Modelos de datos
│   ├── everbridge_client.py   # Cliente API Everbridge
│   ├── requirements.txt       # Dependencias Python
│   ├── Dockerfile             # Dockerfile del backend
│   └── .env.example           # Ejemplo de configuración
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── api/               # Cliente API
│   │   ├── pages/             # Componentes de páginas
│   │   ├── types/             # Definiciones TypeScript
│   │   └── utils/             # Utilidades
│   ├── Dockerfile             # Dockerfile del frontend
│   ├── nginx.conf             # Configuración Nginx
│   └── .env.example           # Ejemplo de configuración
├── deployment/                 # Scripts de despliegue
│   ├── setup_raspberry_pi.sh  # Setup inicial Raspberry Pi
│   ├── setup_kiosk_mode.sh    # Configurar modo kiosko
│   ├── start_services.sh      # Iniciar servicios
│   └── stop_services.sh       # Detener servicios
└── docker-compose.yml         # Configuración Docker Compose
```

## 🚀 Instalación

### Requisitos Previos

- Python 3.11+
- Node.js 18+
- npm o yarn
- Docker y Docker Compose (opcional)

### Configuración del Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Crear entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales de Everbridge
```

5. Iniciar el servidor:
```bash
python main.py
# O con uvicorn directamente:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Configuración del Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env si es necesario
```

4. Iniciar en modo desarrollo:
```bash
npm run dev
```

5. Construir para producción:
```bash
npm run build
```

## 🐳 Despliegue con Docker

### Desarrollo Local

```bash
docker-compose up --build
```

La aplicación estará disponible en:
- Frontend: http://localhost
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Producción

1. Configurar variables de entorno:
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con credenciales reales
```

2. Construir y ejecutar:
```bash
docker-compose up -d
```

## 🥧 Despliegue en Raspberry Pi

### Instalación Automática

1. Copiar el repositorio a la Raspberry Pi:
```bash
scp -r Everbridge-kiosk/ pi@raspberry-pi:/home/pi/
```

2. Conectarse a la Raspberry Pi:
```bash
ssh pi@raspberry-pi
```

3. Ejecutar el script de configuración:
```bash
cd ~/Everbridge-kiosk/deployment
./setup_raspberry_pi.sh
```

4. Copiar archivos de la aplicación:
```bash
sudo cp -r ~/Everbridge-kiosk/* /opt/everbridge-kiosk/
```

5. Configurar credenciales:
```bash
sudo nano /opt/everbridge-kiosk/.env
# Editar con credenciales de Everbridge
```

6. Instalar dependencias del backend:
```bash
cd /opt/everbridge-kiosk/backend
pip3 install -r requirements.txt
```

7. Construir frontend:
```bash
cd /opt/everbridge-kiosk/frontend
npm install
npm run build
```

8. Iniciar servicios:
```bash
cd /opt/everbridge-kiosk/deployment
./start_services.sh
```

9. Configurar modo kiosko:
```bash
./setup_kiosk_mode.sh http://localhost
```

10. Reiniciar para aplicar configuración de kiosko:
```bash
sudo reboot
```

## 🔧 Configuración

### Variables de Entorno del Backend

```env
# API de Everbridge
EVERBRIDGE_API_URL=https://api.everbridge.net/rest
EVERBRIDGE_USERNAME=tu_usuario
EVERBRIDGE_PASSWORD=tu_contraseña
EVERBRIDGE_ORG_ID=tu_org_id

# Servidor
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Entorno
ENVIRONMENT=development
```

### Variables de Entorno del Frontend

```env
VITE_API_URL=http://localhost:8000
```

## 📊 Niveles de Criticidad

La aplicación soporta cuatro niveles de criticidad, cada uno con diferentes requisitos de confirmación:

- **CRÍTICO**: Requiere 3 confirmaciones
- **ALTO**: Requiere 3 confirmaciones
- **MEDIO**: Requiere 2 confirmaciones
- **BAJO**: Requiere 2 confirmaciones

## 🔒 Seguridad

- El backend actúa como proxy para proteger las credenciales de Everbridge
- Las credenciales se almacenan en variables de entorno, nunca en el código
- CORS configurado para permitir solo orígenes autorizados
- Modo incógnito en el navegador para no almacenar historial

## 📱 API Endpoints

### Plantillas

- `GET /api/templates` - Listar todas las plantillas
- `GET /api/templates/{template_id}` - Obtener detalles de una plantilla
- `POST /api/templates/{template_id}/confirm` - Procesar confirmación

### Notificaciones

- `POST /api/notifications/send` - Enviar notificación
- `GET /api/notifications/{notification_id}/status` - Obtener estado
- `GET /api/notifications/history` - Historial de notificaciones

### Sistema

- `GET /` - Información de la API
- `GET /health` - Health check
- `GET /docs` - Documentación interactiva (Swagger UI)

## 🛠️ Desarrollo

### Ejecutar Tests del Backend

```bash
cd backend
pytest
```

### Ejecutar Linter

```bash
# Backend
cd backend
pylint *.py

# Frontend
cd frontend
npm run lint
```

### Construir para Producción

```bash
# Backend (ya está listo con Python)
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm run build
```

## 🐛 Troubleshooting

### El backend no se conecta a Everbridge

- Verificar credenciales en `.env`
- Comprobar conectividad de red
- Revisar logs: `journalctl -u everbridge-backend -f`

### El frontend no se conecta al backend

- Verificar que `VITE_API_URL` apunta al backend correcto
- Comprobar configuración CORS en el backend
- Revisar que ambos servicios estén ejecutándose

### Modo kiosko no inicia automáticamente

- Verificar que el archivo autostart existe: `~/.config/autostart/everbridge-kiosk.desktop`
- Comprobar permisos del script: `chmod +x ~/start_kiosk.sh`
- Revisar logs del sistema: `journalctl -xe`

## 📄 Documentación

- **[README.md](README.md)** - Documentación general del proyecto
- **[API.md](API.md)** - Documentación completa de la API
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guías de despliegue detalladas
- **[EVERBRIDGE_INTEGRATION.md](EVERBRIDGE_INTEGRATION.md)** - Guía de integración con API de Everbridge

## 📄 Licencia

Este proyecto es de código abierto. Consultar con el administrador del repositorio para más detalles.

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Para soporte y preguntas, abrir un issue en el repositorio.

---

Desarrollado para simplificar la gestión de emergencias con Everbridge.
