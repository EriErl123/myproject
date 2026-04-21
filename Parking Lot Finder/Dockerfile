FROM python:3.11-slim
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend and frontend into image
COPY backend /app/backend
COPY frontend /app/frontend
WORKDIR /app/backend

EXPOSE 5000
CMD ["python", "app.py"]
