#!/bin/bash
# Navigate to the app directory
echo "BACKEND_API_URL: $BACKEND_API_URL"
cd /app

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# Start the Django development server
# python manage.py runserver 0.0.0.0:8000
python manage.py runserver 172.179.236.116:8000
