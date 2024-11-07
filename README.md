# A Flask/React application demo.

The goal is to demonstrate a simple Flask/React application that can be deployed to Fly.io.

## Development Setup

### Frontend (React)

From the project root:
```bash
cd frontend
npm install
npm run dev
```

The React development server will run on http://localhost:5173

As a reminder, the react frontend was created using Vite using this command:
```bash
npm create vite@latest client -- --template react
```

You might also try with tailwind:
```bash
npm create vite@latest frontend -- --template template-vite-react-ts-tailwind
```

### Backend (Flask)
From the project root:
```bash
cd backend
python -m venv venv
source venv/bin/activate 
pip install -r requirements.txt
python run.py
```

The Flask server will run on http://localhost:5555. Also, the backend will serve the static frontend files from the `backend/static` directory.


## Building for running in Docker

1. Build the frontend: Run ./build.sh which pretty much does the following:
```bash
cd frontend
npm run build
```
This creates a `dist` directory with the production build.

2. Build and run the Docker container:
```bash
docker build -t demo .
docker run -p 8080:8080 demo
```

The application will be available at http://localhost:8080

## Deploying to Fly.io

Generate the fly.toml file with:
```bash
fly launch --no-deploy
```

Then deploy with:
```bash
fly deploy
```
