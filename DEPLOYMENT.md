# Guía de Despliegue

## Opciones de Despliegue

### 1. Desarrollo Local

Ideal para desarrollo y pruebas locales.

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env con tus credenciales
python main.py
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env si es necesario
npm run dev
```

Acceso:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

### 2. Docker Compose

Ideal para pruebas en entornos similares a producción.

**Prerequisitos:**
- Docker
- Docker Compose

**Pasos:**
```bash
# 1. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con credenciales reales

# 2. Construir y ejecutar
docker-compose up -d

# 3. Ver logs
docker-compose logs -f

# 4. Detener
docker-compose down
```

Acceso:
- Frontend: http://localhost
- Backend: http://localhost:8000

---

### 3. Raspberry Pi (Modo Kiosko)

Ideal para despliegue en producción como kiosko dedicado.

#### Prerequisitos
- Raspberry Pi 3/4/5
- Raspberry Pi OS (Bullseye o posterior)
- Conexión a internet
- Acceso SSH (opcional, para configuración remota)

#### Instalación Automática

**1. Copiar archivos a la Raspberry Pi:**
```bash
# Desde tu computadora
scp -r Everbridge-kiosk/ pi@tu-raspberry-pi:/home/pi/
```

**2. Conectarse a la Raspberry Pi:**
```bash
ssh pi@tu-raspberry-pi
```

**3. Ejecutar el script de configuración:**
```bash
cd /home/pi/Everbridge-kiosk/deployment
chmod +x *.sh
./setup_raspberry_pi.sh
```

**4. Copiar archivos de la aplicación:**
```bash
sudo cp -r /home/pi/Everbridge-kiosk/* /opt/everbridge-kiosk/
```

**5. Configurar credenciales de Everbridge:**
```bash
sudo nano /opt/everbridge-kiosk/.env
# Editar con tus credenciales
```

**6. Instalar dependencias del backend:**
```bash
cd /opt/everbridge-kiosk/backend
sudo pip3 install -r requirements.txt
```

**7. Construir el frontend:**
```bash
cd /opt/everbridge-kiosk/frontend
npm install
npm run build
```

**8. Iniciar servicios:**
```bash
cd /opt/everbridge-kiosk/deployment
./start_services.sh
```

**9. Verificar que los servicios están corriendo:**
```bash
sudo systemctl status everbridge-backend
sudo systemctl status everbridge-frontend
```

**10. Configurar modo kiosko:**
```bash
cd /opt/everbridge-kiosk/deployment
./setup_kiosk_mode.sh http://localhost
```

**11. Reiniciar para aplicar modo kiosko:**
```bash
sudo reboot
```

#### Instalación Manual

Si prefieres una instalación paso a paso:

**1. Actualizar el sistema:**
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

**2. Instalar dependencias:**
```bash
sudo apt-get install -y python3 python3-pip python3-venv nodejs npm chromium-browser xdotool unclutter
```

**3. Crear directorio de aplicación:**
```bash
sudo mkdir -p /opt/everbridge-kiosk
sudo chown $USER:$USER /opt/everbridge-kiosk
```

**4. Copiar archivos (continuar desde el paso 5 de instalación automática)**

---

### 4. Servidor Linux (Sin Modo Kiosko)

Para despliegue en un servidor sin interfaz gráfica.

**Backend:**
```bash
# Usar systemd service o supervisor
sudo nano /etc/systemd/system/everbridge-backend.service

[Unit]
Description=Everbridge Kiosk Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/everbridge-kiosk/backend
EnvironmentFile=/var/www/everbridge-kiosk/.env
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable everbridge-backend
sudo systemctl start everbridge-backend
```

**Frontend:**
```bash
# Usar nginx para servir archivos estáticos
cd /var/www/everbridge-kiosk/frontend
npm install
npm run build

# Configurar nginx
sudo nano /etc/nginx/sites-available/everbridge-kiosk

server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/everbridge-kiosk/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/everbridge-kiosk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Configuración de Red

### Firewall
Asegúrate de abrir los puertos necesarios:

```bash
# Backend API
sudo ufw allow 8000/tcp

# Frontend (si se sirve directamente)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # Para HTTPS
```

### DNS
Configura un registro DNS si necesitas acceso por nombre de dominio.

---

## Monitoreo

### Logs del Backend
```bash
# Si se usa systemd
sudo journalctl -u everbridge-backend -f

# Si se usa Docker
docker-compose logs -f backend
```

### Logs del Frontend
```bash
# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Si se usa systemd
sudo journalctl -u everbridge-frontend -f
```

---

## Mantenimiento

### Actualizar la Aplicación
```bash
# Detener servicios
cd /opt/everbridge-kiosk/deployment
./stop_services.sh

# Actualizar código
cd /opt/everbridge-kiosk
git pull

# Reinstalar dependencias si es necesario
cd backend
pip3 install -r requirements.txt

cd ../frontend
npm install
npm run build

# Reiniciar servicios
cd ../deployment
./start_services.sh
```

### Backups
Considera hacer backups de:
- Configuración (archivos .env)
- Base de datos (si se implementa persistencia)
- Logs importantes

---

## Troubleshooting

### El backend no inicia
```bash
# Verificar logs
sudo journalctl -u everbridge-backend -n 50

# Verificar que las dependencias están instaladas
pip3 list | grep fastapi

# Verificar configuración
cat /opt/everbridge-kiosk/.env
```

### El frontend no carga
```bash
# Verificar que el build se completó
ls -la /opt/everbridge-kiosk/frontend/dist

# Verificar nginx
sudo nginx -t
sudo systemctl status nginx
```

### Modo kiosko no funciona
```bash
# Verificar autostart
cat ~/.config/autostart/everbridge-kiosk.desktop

# Verificar script de kiosko
cat ~/start_kiosk.sh

# Ver logs del sistema
journalctl -xe
```

---

## Seguridad

### Consideraciones de Seguridad
1. Nunca commitas archivos `.env` al repositorio
2. Usa HTTPS en producción
3. Configura firewall adecuadamente
4. Mantén el sistema actualizado
5. Usa contraseñas fuertes para Everbridge
6. Limita el acceso físico a la Raspberry Pi en modo kiosko
7. Considera usar VPN para acceso remoto

### HTTPS con Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```
