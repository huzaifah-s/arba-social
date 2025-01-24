from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from .models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.posts import posts_bp
    from .routes.comments import comments_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(comments_bp)

    # Create database tables
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")

    return app