#!/bin/bash
# Setup Chromium in Kiosk Mode for Everbridge Kiosk

echo "================================================"
echo "  Chromium Kiosk Mode Setup"
echo "================================================"

# Get the application URL (default to localhost)
APP_URL="${1:-http://localhost}"

# Create autostart directory if it doesn't exist
mkdir -p ~/.config/autostart

# Create desktop entry for autostart
cat > ~/.config/autostart/everbridge-kiosk.desktop << EOF
[Desktop Entry]
Type=Application
Name=Everbridge Kiosk
Exec=/home/$USER/start_kiosk.sh
X-GNOME-Autostart-enabled=true
EOF

# Create the kiosk start script
cat > ~/start_kiosk.sh << EOF
#!/bin/bash

# Wait for network
sleep 10

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide mouse cursor when inactive
unclutter -idle 0.1 -root &

# Start Chromium in kiosk mode
chromium-browser \\
    --kiosk \\
    --noerrdialogs \\
    --disable-infobars \\
    --no-first-run \\
    --disable-session-crashed-bubble \\
    --disable-suggestions-service \\
    --disable-translate \\
    --disable-save-password-bubble \\
    --disable-features=TranslateUI \\
    --disable-component-update \\
    --check-for-update-interval=31536000 \\
    --incognito \\
    "$APP_URL"
EOF

# Make the script executable
chmod +x ~/start_kiosk.sh

echo "================================================"
echo "  Kiosk Mode Setup Complete!"
echo "================================================"
echo ""
echo "The browser will start in kiosk mode on next boot."
echo "To start now, run: ~/start_kiosk.sh"
echo "To exit kiosk mode, press: Alt+F4"
echo ""
echo "Application URL: $APP_URL"
echo ""
