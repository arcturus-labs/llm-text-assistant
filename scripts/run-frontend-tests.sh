#!/bin/bash

# Navigate to frontend directory
cd frontend || exit 1

# Install dependencies
echo "Installing frontend dependencies..."
npm ci

# Run tests
echo "Running frontend tests..."
npm test
