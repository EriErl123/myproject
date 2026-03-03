FROM python:3.12-slim

WORKDIR /app

# OS deps
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn psycopg2-binary

# App source
COPY . .

# Run seed + start with gunicorn
EXPOSE 8000
CMD ["sh", "-c", "python -m app.seed && gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 --workers 4 --access-logfile -"]
