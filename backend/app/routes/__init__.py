# app/routes/__init__.py
from .auth import auth_bp
from .posts import posts_bp
from .comments import comments_bp

# You can export them here to make imports cleaner
__all__ = ['auth_bp', 'posts_bp', 'comments_bp']