#!/bin/bash

# Build the frontend
cd frontend
npm run build
cd ..

# Build and run the Docker container
docker build -t demo .
docker run -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" -p 8080:8080 demo 