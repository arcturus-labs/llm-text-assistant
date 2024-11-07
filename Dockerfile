# Build stage
FROM node:18 AS frontend-builder
WORKDIR /frontend
COPY frontend/ .
RUN npm install
RUN npm run build

# Final stage
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONPATH=/app/backend
ENV ANTHROPIC_API_KEY=""

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from build stage
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "backend.run:create_app()"]