#!/bin/bash

# Navigate to backend directory
cd backend || exit 1

# Install/upgrade pip and dependencies
echo "Installing backend dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# Ensure (or fake) frontend is built
cd ../frontend
if [ ! -d "dist" ]; then
    mkdir dist
    echo "HELLO WORLD" > dist/index.html
fi
cd ../backend

# Run tests with correct PYTHONPATH
echo "Running backend tests..."
PYTHONPATH=$PYTHONPATH:$(pwd)/.. pytest -v
