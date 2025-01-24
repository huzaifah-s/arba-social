from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Comment, User 

comments_bp = Blueprint('comments', __name__)

# Create comment (with JWT)
@comments_bp.route('/api/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        print("Received data:", data)  # Debug print
        
        comment = Comment(
            user_id=current_user_id,
            post_id=post_id,
            text=data['text']
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({'message': 'Comment created successfully', 'comment_id': comment.id}), 201
    except Exception as e:
        print(f"Error creating comment: {str(e)}")  # Debug print
        return jsonify({'error': str(e)}), 500

# Get comments (no JWT required for viewing)
@comments_bp.route('/api/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    try:
        comments = Comment.query.filter_by(post_id=post_id).all()
        
        # Pre-load users to avoid repeated DB calls
        user_ids = [comment.user_id for comment in comments]
        users = {user.id: user.name for user in User.query.filter(User.id.in_(user_ids)).all()} 

        comments_data = [{
            'id': comment.id,
            'user_id': comment.user_id,
            'user_name': users.get(comment.user_id),  # Get name from preloaded users
            'text': comment.text,
            'created_at': comment.created_at.isoformat() if comment.created_at else None
        } for comment in comments]

        return jsonify(comments_data), 200
    except Exception as e:
        print(f"Error getting comments: {str(e)}")
        return jsonify({'error': str(e)}), 500

@comments_bp.route('/api/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    try:
        print(f"Received PUT request for comment {comment_id}")  # Debug print
        print(f"Request method: {request.method}")  # Debug print
        current_user_id = get_jwt_identity()
        print(f"Current user ID from token: {current_user_id}")  # Debug print
        
        comment = Comment.query.get_or_404(comment_id)
        print(f"Found comment: {comment.id}, owned by user: {comment.user_id}")  # Debug print
        
        # Convert types to match for comparison
        current_user_id = int(current_user_id) if isinstance(current_user_id, str) else current_user_id
        
        print(f"Comparing - Current user ID: {current_user_id} ({type(current_user_id)})")
        print(f"With comment user ID: {comment.user_id} ({type(comment.user_id)})")
        
        if comment.user_id != current_user_id:
            print("Unauthorized attempt to edit comment")
            print(f"comment.user_id ({comment.user_id}) != current_user_id ({current_user_id})")
            return jsonify({'error': 'Unauthorized - You can only edit your own comments'}), 403
            
        data = request.get_json()
        print(f"Received data: {data}")  # Debug print
        
        comment.text = data.get('text', comment.text)
        
        db.session.commit()
        print(f"Comment {comment_id} updated successfully")
        return jsonify({'message': 'Comment updated successfully'})
    except Exception as e:
        print(f"Error updating comment: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add this new test endpoint
@comments_bp.route('/api/comments/test-put/<int:comment_id>', methods=['PUT'])
def test_put(comment_id):
    print(f"Test PUT received for comment {comment_id}")
    return jsonify({'message': 'PUT method received successfully'}), 200

# Delete comment (with JWT)
@comments_bp.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    try:
        # Print debug information
        current_user_id = get_jwt_identity()
        print(f"Attempting to delete comment {comment_id} by user {current_user_id}")

        # Convert types to match for comparison
        current_user_id = int(current_user_id) if isinstance(current_user_id, str) else current_user_id
        
        comment = Comment.query.get_or_404(comment_id)
        print(f"Found comment: {comment.id}, owned by user: {comment.user_id}")
        
        # Check if user owns this comment
        if comment.user_id != current_user_id:
            print(f"Unauthorized: comment.user_id ({comment.user_id}) != current_user_id ({current_user_id})")
            return jsonify({'error': 'Unauthorized - You can only delete your own comments'}), 403
            
        db.session.delete(comment)
        db.session.commit()
        print(f"Comment {comment_id} deleted successfully")
        return jsonify({'message': 'Comment deleted successfully'})
    except Exception as e:
        print(f"Error deleting comment: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add a test endpoint to verify JWT
@comments_bp.route('/api/comments/test-auth', methods=['GET'])
@jwt_required()
def test_auth():
    current_user_id = get_jwt_identity()
    return jsonify({
        'message': 'Authentication working',
        'user_id': current_user_id
    }), 200
