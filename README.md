# A Flask/React application demo.

The goal is to demonstrate a simple Flask/React application that can be deployed to Fly.io.

Don't modify this repo. Instead, fork it and modify your fork.

## Development Setup

### Frontend (React)
Run frontend with:
```bash
scripts/run-frontend.sh
```

Test with:
```bash
./scripts/run-frontend-tests.sh
```

### Backend (Flask)
Run backend with:
```bash
scripts/run-frontend.sh
```

Test with:
```bash
./scripts/run-backend-tests.sh
```


## Building for running in Docker

Build and run the application in Docker with:
```bash
scripts/run-docker.sh
```

3. Test the application by opening http://localhost:8080 in your browser.


## Deploying to Fly.io

Git commit your changes.

Generate the fly.toml file with:
```bash
fly launch --no-deploy
```

Then deploy with:
```bash
fly deploy
```

### Deploy using actions

 Git commit and push to github. The action will build the frontend and deploy the application to fly.io.
 