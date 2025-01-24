from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from ..models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400

        user = User(
            email=data['email'],
            name=data['name']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create token for new user
        access_token = create_access_token(identity=str(user.id))  # Convert to string
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token
        }), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=str(user.id))  # Convert to string
            return jsonify({
                'access_token': access_token,
                'user_id': user.id
            }), 200
            
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Test endpoint for JWT
@auth_bp.route('/api/test-token', methods=['GET'])
@jwt_required()
def test_token():
    current_user_id = get_jwt_identity()
    return jsonify({
        'message': 'Token is valid',
        'user_id': current_user_id
    }), 200