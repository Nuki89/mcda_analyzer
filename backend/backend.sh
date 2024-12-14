#!/bin/bash
# Navigate to the app directory
cd /app

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# Start the Django development server
python manage.py runserver 0.0.0.0:8000
