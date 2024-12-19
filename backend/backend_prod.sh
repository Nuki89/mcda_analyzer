#!/bin/bash
# Check and apply database migrations
python manage.py migrate --noinput

# Start Gunicorn with production settings
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
