DJANGO_PORT=8000
ANGULAR_PORT=4200
BACKEND_HOST=0.0.0.0
FRONTEND_HOST=0.0.0.0
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

#!/bin/bash
cleanup() {
    echo "Stopping background processes..."
    # Kill Django and Angular processes
    lsof -t -i:$DJANGO_PORT | xargs kill -9 2>/dev/null
    lsof -t -i:$ANGULAR_PORT | xargs kill -9 2>/dev/null
}

# Set up the trap to call cleanup on script exit (e.g., Ctrl+C)
trap cleanup EXIT

# Check if Angular or Django is already running
if lsof -i:$DJANGO_PORT; then
    echo "Django backend is already running on port $DJANGO_PORT."
else
    # Start Django backend on port 0.0.0.0:$DJANGO_PORT in the background
    echo "Starting Django backend..."
    (cd $BACKEND_DIR && python manage.py runserver $BACKEND_HOST:$DJANGO_PORT) &
fi

if lsof -i:$ANGULAR_PORT; then
    echo "Angular frontend is already running on port $ANGULAR_PORT."
else
    # Start Angular frontend on port $ANGULAR_PORT in the background
    echo "Starting Angular frontend..."
    (cd $FRONTEND_DIR && ng serve --host $FRONTEND_HOST --port $ANGULAR_PORT -o) &
fi

# Wait for background processes to complete
wait