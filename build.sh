#!/bin/bash

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Create necessary directories if they don't exist
mkdir -p backend/static #TODO is this necessary?

echo "Build complete!" 