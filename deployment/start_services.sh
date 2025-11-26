#!/bin/bash
# Start Everbridge Kiosk Services

echo "Starting Everbridge Kiosk services..."

# Start backend
echo "Starting backend..."
sudo systemctl start everbridge-backend

# Wait for backend to be ready
sleep 5

# Start frontend
echo "Starting frontend..."
sudo systemctl start everbridge-frontend

# Check status
echo ""
echo "Service status:"
sudo systemctl status everbridge-backend --no-pager
sudo systemctl status everbridge-frontend --no-pager

echo ""
echo "Everbridge Kiosk is running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost"
echo ""
