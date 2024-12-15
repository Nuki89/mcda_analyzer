# FROM python:3.12
# FROM --platform=linux/amd64 python:3.12
FROM python:3.12-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . . 

ENV PYTHONUNBUFFERED 1
EXPOSE 8000

COPY backend.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/backend.sh

CMD ["/usr/local/bin/backend.sh"]

# FROM python:3.12
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . . 
# ENV PYTHONNUNBUFFERED 1
# EXPOSE 8000

# COPY backend.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/backend.sh

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
