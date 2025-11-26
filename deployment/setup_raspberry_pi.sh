#!/bin/bash
# Raspberry Pi Setup Script for Everbridge Kiosk

echo "================================================"
echo "  Everbridge Kiosk - Raspberry Pi Setup"
echo "================================================"

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    chromium-browser \
    xdotool \
    unclutter \
    git

# Install Docker and Docker Compose (optional, for containerized deployment)
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo pip3 install docker-compose

# Create application directory
echo "Setting up application directory..."
APP_DIR="/opt/everbridge-kiosk"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or copy the application
echo "Application directory ready at: $APP_DIR"
echo "Please copy your application files to this directory"

# Setup environment files
echo "Creating environment configuration..."
cat > $APP_DIR/.env << 'EOF'
# Everbridge API Configuration
EVERBRIDGE_API_URL=https://api.everbridge.net/rest
EVERBRIDGE_USERNAME=your_username
EVERBRIDGE_PASSWORD=your_password
EVERBRIDGE_ORG_ID=your_org_id

# Server Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost,http://127.0.0.1

# Environment
ENVIRONMENT=production
EOF

echo "Please edit $APP_DIR/.env with your Everbridge credentials"

# Create systemd service for backend
echo "Creating systemd service for backend..."
sudo tee /etc/systemd/system/everbridge-backend.service > /dev/null << EOF
[Unit]
Description=Everbridge Kiosk Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/backend
Environment=PATH=/usr/bin:/usr/local/bin
EnvironmentFile=$APP_DIR/.env
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for frontend (using a simple HTTP server)
echo "Creating systemd service for frontend..."
sudo tee /etc/systemd/system/everbridge-frontend.service > /dev/null << EOF
[Unit]
Description=Everbridge Kiosk Frontend
After=network.target everbridge-backend.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/frontend/dist
ExecStart=/usr/bin/python3 -m http.server 80
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable services
echo "Enabling services..."
sudo systemctl daemon-reload
sudo systemctl enable everbridge-backend
sudo systemctl enable everbridge-frontend

# Disable screen blanking and power saving
echo "Configuring display settings..."
sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart > /dev/null << EOF
@xset s off
@xset -dpms
@xset s noblank
@unclutter -idle 0.1 -root
EOF

echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Copy your application files to: $APP_DIR"
echo "2. Edit $APP_DIR/.env with your Everbridge credentials"
echo "3. Install backend dependencies: cd $APP_DIR/backend && pip3 install -r requirements.txt"
echo "4. Build frontend: cd $APP_DIR/frontend && npm install && npm run build"
echo "5. Start services: sudo systemctl start everbridge-backend everbridge-frontend"
echo "6. Setup kiosk mode: Run setup_kiosk_mode.sh"
echo ""
