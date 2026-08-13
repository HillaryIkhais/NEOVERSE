# Stage 1: Build the Vite React Frontend
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Install dependencies and build
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Python Backend & Serve
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for some python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY api.py .
COPY api/ api/
COPY local-runtime/ local-runtime/
COPY router-agent/ router-agent/

# Copy the built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose the port FastAPI will run on
EXPOSE 8000

# Start the application using Uvicorn
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
