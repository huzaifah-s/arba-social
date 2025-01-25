const API_URL = 'http://localhost:5001';

// Auth Functions
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            showMainContent();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value;

    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login.');
            showLogin();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    showAuthSection();
}

// UI Functions
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function showMainContent() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
}

function showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
}

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showMainContent();
    } else {
        showAuthSection();
    }
});

// Load all posts function
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/api/posts`);
        const posts = await response.json();

        const postsSection = document.getElementById('posts-section');
        postsSection.innerHTML = posts.map(post => {
            const currentUserId = localStorage.getItem('userId'); // Get logged in user ID
            const canEditDelete = post.user_id === parseInt(currentUserId); // Check if current user ID matches post's user ID

            return `
                <div class="post" data-post-id="${post.id}">
                    <div class="post-header">
                        <h3>${post.user_name || 'Unknown Author'}</h3>
                    </div>

                    <img src="${post.image_url}" alt="Post image" class="post-image" onerror="handleImageError(this)">
                    <div class="post-caption">
                        <p>${post.caption}</p>
                    </div>
                    ${canEditDelete ? `
                        <div class="post-actions">
                            
                                <button class="edit-btn" onclick="showEditModal(${post.id}, \`${post.image_url}\`, \`${post.caption}\`)">Edit</button>
                                <button class="delete-btn" onclick="handleDeletePost(${post.id})">Delete</button>
                            
                        </div>
                    ` : ''}
                    <!-- Comments Section -->
                    <div class="comments-section">
                        <h3>Comments</h3>
                        <div class="add-comment">
                            <input type="text" id="comment-input-${post.id}" placeholder="Write a comment...">
                            <button onclick="handleAddComment(${post.id})">Add Comment</button>
                        </div>
                        <div id="comments-${post.id}" class="comments-list">
                            <!-- Comments will be loaded here dynamically -->
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Load comments for each post
        posts.forEach(post => loadComments(post.id));
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Create a post function
async function handleCreatePost(event) {
    event.preventDefault();
    const imageUrl = document.getElementById('post-image-url').value;
    const caption = document.getElementById('post-caption').value;

    try {
        const response = await fetch(`${API_URL}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ image_url: imageUrl, caption })
        });

        if (response.ok) {
            document.getElementById('post-image-url').value = '';
            document.getElementById('post-caption').value = '';
            loadPosts(); // Reload posts
            alert('Post created successfully!');
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to create post');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post');
    }
}

// Edit a post function
async function handleEditPost(event) {
    event.preventDefault();
    const postId = document.getElementById('edit-post-id').value;
    const imageUrl = document.getElementById('edit-image-url').value;
    const caption = document.getElementById('edit-caption').value;

    try {
        if (postId) { // If postId exists, we're editing an existing post
            const response = await fetch(`${API_URL}/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ image_url: imageUrl, caption })
            });

            if (response.ok) {
                alert('Post updated successfully!');
            }
        } else { // Otherwise, we're creating a new post
            const response = await fetch(`${API_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ image_url: imageUrl, caption })
            });

            if (response.ok) {
                alert('Post created successfully!');
            }
        }
        closeEditModal();
        loadPosts(); // Reload posts after creation or update
    } catch (error) {
        console.error('Error handling post:', error);
        alert('Failed to save post');
    }
}

// Delete a post function
async function handleDeletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        try {
            const response = await fetch(`${API_URL}/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                loadPosts(); // Reload posts
                alert('Post deleted successfully!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        }
    }
}

function showEditModal(postId, imageUrl, caption) {
    console.log('Opening modal for post:', postId); // Debug log
    const modal = document.getElementById('edit-post-modal');
    const postIdInput = document.getElementById('edit-post-id');
    const imageUrlInput = document.getElementById('edit-image-url');
    const captionInput = document.getElementById('edit-caption');
    
    postIdInput.value = postId;
    imageUrlInput.value = imageUrl;
    captionInput.value = caption;
    
    modal.style.display = 'block';
}

function closeEditModal() {
    const modal = document.getElementById('edit-post-modal');
    modal.style.display = 'none';
}

// Update the showMainContent function to load posts
function showMainContent() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    loadPosts(); // Load posts when showing main content
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showMainContent();
    } else {
        showAuthSection();
    }

    // Close modal when clicking the X
    const closeBtn = document.querySelector('.close');
    closeBtn.onclick = closeEditModal;

    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('edit-post-modal');
        if (event.target == modal) {
            closeEditModal();
        }
    }
});

// Add error handling for images
function handleImageError(img) {
    img.onerror = null; // Prevent infinite loop
    img.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
}

// Function to check if user owns the post
function userOwnsPost(post) {
    // You'll need to store the user ID when logging in
    const userId = localStorage.getItem('userId');
    return post.user_id === parseInt(userId);
}

// Update the login handler to store user ID
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('userId', data.user_id); // Store user ID
            showMainContent();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
}

// Load comments for a specific post
async function loadComments(postId) {
    try {
        const response = await fetch(`${API_URL}/api/posts/${postId}/comments`);
        const comments = await response.json();
        
        const commentsContainer = document.getElementById(`comments-${postId}`);
        const currentUserId = localStorage.getItem('userId'); // Get logged in user ID

        commentsContainer.innerHTML = comments.map(comment => {
            const canEditDelete = comment.user_id === parseInt(currentUserId); // Check if current user ID matches comment's user ID

            return `
                <div class="comment" data-comment-id="${comment.id}">
                    <div class="comment-left">
                        <span class="comment-author">${comment.user_name}</span>
                        <span class="comment-text">${comment.text}</span>
                    </div>
                    <div class="comment-actions">
                        ${canEditDelete ? `
                            <button class="edit-btn" onclick="showEditCommentModal(${comment.id}, \`${comment.text}\`)">🖊️</button>
                            <button class="delete-btn" onclick="handleDeleteComment(${comment.id})">🗑️</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// Add a new comment
async function handleAddComment(postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const text = commentInput.value.trim();
    
    if (!text) return;

    try {
        const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            commentInput.value = '';
            loadComments(postId);
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to add comment');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment');
    }
}

// Delete a comment
async function handleDeleteComment(commentId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        try {
            const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // Reload all comments for all posts
                const posts = document.querySelectorAll('.post');
                posts.forEach(post => loadComments(post.dataset.postId));
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment');
        }
    }
}

// Edit comment functions
function showEditCommentModal(commentId, text) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('edit-comment-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'edit-comment-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeEditCommentModal()">&times;</span>
                <h2>Edit Comment</h2>
                <form onsubmit="handleEditComment(event)">
                    <input type="hidden" id="edit-comment-id">
                    <textarea id="edit-comment-text" required></textarea>
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('edit-comment-id').value = commentId;
    document.getElementById('edit-comment-text').value = text;
    modal.style.display = 'block';
}

function closeEditCommentModal() {
    const modal = document.getElementById('edit-comment-modal');
    if (modal) modal.style.display = 'none';
}

async function handleEditComment(event) {
    event.preventDefault();
    const commentId = document.getElementById('edit-comment-id').value;
    const text = document.getElementById('edit-comment-text').value;

    try {
        const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            closeEditCommentModal();
            // Reload all comments for all posts
            const posts = document.querySelectorAll('.post');
            posts.forEach(post => loadComments(post.dataset.postId));
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to update comment');
        }
    } catch (error) {
        console.error('Error updating comment:', error);
        alert('Failed to update comment');
    }
}

// Update handleLogout to clear userId
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    showAuthSection();
}

function showAddPostModal() {
    // Clear inputs for a new post
    document.getElementById('edit-post-id').value = ''; // Clear post ID
    document.getElementById('edit-image-url').value = ''; // Clear image URL
    document.getElementById('edit-caption').value = ''; // Clear caption

    const modal = document.getElementById('edit-post-modal');
    modal.style.display = 'block'; // Open the modal for adding a post
}
