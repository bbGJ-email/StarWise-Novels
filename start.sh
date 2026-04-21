#!/bin/bash

# StarWise Literature One-click Start Script (Linux/Mac)
# Supports starting both frontend and backend services with clean shutdown

echo "StarWise Literature One-click Start Script"
echo "=============================="

# Create a temporary file to store process IDs
temp_file=$(mktemp)

echo "Creating temporary files for process management..."
echo ""

# Start backend service in background and save process ID
echo "1. Starting backend service..."
cd server && npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for the service to start
sleep 2

echo "Backend service started at http://localhost:3001 (PID: $BACKEND_PID)"

# Start frontend service in background and save process ID
echo "2. Starting frontend service..."
cd client && npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for the service to start
sleep 2

echo "Frontend service started at http://localhost:3000 (PID: $FRONTEND_PID)"

# Save process IDs to temporary file
echo "$BACKEND_PID" > "$temp_file"
echo "$FRONTEND_PID" >> "$temp_file"

echo "3. Services started successfully!"
echo "=============================="
echo "Access URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:3001"
echo "- Health Check: http://localhost:3001/api/health"
echo "=============================="
echo "Test Accounts:"
echo "- Admin: admin@starwise.com / 123456"
echo "- Author: author@starwise.com / 123456"
echo "- User: user@starwise.com / 123456"
echo "=============================="
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

# Cleanup function to stop services when script is terminated
cleanup() {
    echo ""
    echo "Stopping services..."
    
    # Stop backend service
    if [ -n "$BACKEND_PID" ]; then
        echo "Stopping backend service (PID: $BACKEND_PID)"
        kill -9 $BACKEND_PID 2>/dev/null
    fi
    
    # Stop frontend service
    if [ -n "$FRONTEND_PID" ]; then
        echo "Stopping frontend service (PID: $FRONTEND_PID)"
        kill -9 $FRONTEND_PID 2>/dev/null
    fi
    
    # Clean up temporary file
    if [ -f "$temp_file" ]; then
        rm "$temp_file"
    fi
    
    echo "All services stopped successfully!"
    echo "=============================="
    exit 0
}

# Register cleanup function for SIGINT and SIGTERM traps
trap cleanup SIGINT SIGTERM

# Wait indefinitely
while true; do
    sleep 1
done
