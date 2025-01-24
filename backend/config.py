import os
from datetime import timedelta

class Config:
    SECRET_KEY = 'dev-secret-key'  # Change this in production
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'jwt-secret-key'  # Change this in production
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
