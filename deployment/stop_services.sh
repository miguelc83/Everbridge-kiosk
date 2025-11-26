#!/bin/bash
# Stop Everbridge Kiosk Services

echo "Stopping Everbridge Kiosk services..."

sudo systemctl stop everbridge-backend
sudo systemctl stop everbridge-frontend

echo "Services stopped."
