from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Post, User

posts_bp = Blueprint('posts', __name__)

# Test route without authentication
@posts_bp.route('/api/posts/test', methods=['GET'])
def test_posts():
    return jsonify({"message": "Posts route is working"}), 200

# Get all posts (no authentication needed for viewing)
@posts_bp.route('/api/posts', methods=['GET'])
def get_posts():
    try:
        posts = Post.query.all()
        user_map = {user.id: user.name for user in User.query.all()}  # Preload all users into a map
        posts_data = [{
            'id': post.id,
            'user_id': post.user_id,
            'user_name': user_map.get(post.user_id),  # Lookup name from preloaded user map
            'image_url': post.image_url,
            'caption': post.caption,
            'created_at': post.created_at.isoformat() if post.created_at else None
        } for post in posts]
        return jsonify(posts_data), 200
    except Exception as e:
        print(f"Error getting posts: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Create a post (with JWT)
@posts_bp.route('/api/posts', methods=['POST'])
@jwt_required()
def create_post():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        print("Received data:", data)

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        post = Post(
            user_id=current_user_id,  # Use authenticated user's ID
            image_url=data.get('image_url'),
            caption=data.get('caption')
        )
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify({'message': 'Post created successfully', 'post_id': post.id}), 201
    except Exception as e:
        print(f"Error creating post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/api/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    try:
        current_user_id = get_jwt_identity()
        # Convert current_user_id to int if it's a string
        current_user_id = int(current_user_id) if isinstance(current_user_id, str) else current_user_id
        
        post = Post.query.get_or_404(post_id)
        print(f"Current user ID: {current_user_id} ({type(current_user_id)})")  # Debug print
        print(f"Post user ID: {post.user_id} ({type(post.user_id)})")  # Debug print
        
        # Check if user owns this post
        if post.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized - You can only edit your own posts'}), 403
            
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Update post fields
        if 'caption' in data:
            post.caption = data['caption']
        if 'image_url' in data:
            post.image_url = data['image_url']
        
        db.session.commit()
        return jsonify({'message': 'Post updated successfully'})
    except Exception as e:
        print(f"Error updating post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/api/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    try:
        current_user_id = get_jwt_identity()
        # Convert current_user_id to int if it's a string
        current_user_id = int(current_user_id) if isinstance(current_user_id, str) else current_user_id
        
        post = Post.query.get_or_404(post_id)
        print(f"Current user ID: {current_user_id} ({type(current_user_id)})")  # Debug print
        print(f"Post user ID: {post.user_id} ({type(post.user_id)})")  # Debug print
        
        # Check if user owns this post
        if post.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized - You can only delete your own posts'}), 403
            
        db.session.delete(post)
        db.session.commit()
        return jsonify({'message': 'Post deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting post: {str(e)}")
        return jsonify({'error': str(e)}), 500
