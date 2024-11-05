from flask import Flask

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
    
    # Register blueprints
    from app.routes.games.adventure.routes import adventure_bp
    from app.routes.static.routes import static_bp
    
    app.register_blueprint(adventure_bp)
    app.register_blueprint(static_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5555) 