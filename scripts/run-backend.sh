cd backend
pip install -r requirements.txt
FLASK_APP=run:create_app flask --debug run --port 5555
cd ..
