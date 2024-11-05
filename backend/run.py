from flask import Flask

def create_app():
    app = Flask(__name__)
    
    # Register blueprints
    from app.routes.games.adventure.routes import adventure_bp
    app.register_blueprint(adventure_bp)
    
    # Your original route can stay here or move to a main_routes.py
    @app.route('/')
    def hello():
        return 'Hello, Fly.io!'
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5555) 