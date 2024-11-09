from flask import Flask

from app.routes.api.routes import api_bp
from app.routes.static.routes import static_bp
from app.routes.subscription.routes import subscription_bp

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
    
    app.register_blueprint(api_bp)
    app.register_blueprint(static_bp)
    app.register_blueprint(subscription_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5555) 