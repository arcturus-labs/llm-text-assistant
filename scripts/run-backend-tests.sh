#!/bin/bash

# Navigate to backend directory
cd backend || exit 1

# Install/upgrade pip and dependencies
echo "Installing backend dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# Run tests with correct PYTHONPATH
echo "Running backend tests..."
PYTHONPATH=$PYTHONPATH:$(pwd)/.. pytest -v
