import os
import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify
from models.user import User
from werkzeug.security import generate_password_hash, check_password_hash

# Load JWT secret
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "ilovenpon")

# In-memory token blacklist. Use Redis or DB for production.
blacklisted_tokens = set()

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.objects(username=username).first() or User.objects(email=email).first():
        return jsonify({'error': 'User already exists'}), 400

    password_hash = generate_password_hash(password)
    user = User(username=username, email=email, password_hash=password_hash)
    user.save()

    return jsonify({'message': 'User created successfully'}), 201

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if username:
        user = User.objects(username=username).first()
    elif email:
        user = User.objects(email=email).first()
    else:
        return jsonify({'error': 'Username or email required'}), 400

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Incorrect password'}), 401

    payload = {
        'user_id': str(user.id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

    return jsonify({'token': token}), 200

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header:
            return jsonify({'error': 'Token is missing!'}), 401
        parts = auth_header.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            return jsonify({'error': 'Invalid token header'}), 401
        token = parts[1]

        # Check token blacklist
        if token in blacklisted_tokens:
            return jsonify({'error': 'Token has been revoked'}), 401

        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = data.get('user_id')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token!'}), 401

        return f(user_id, *args, **kwargs)
    return decorated

@auth_blueprint.route('/profile', methods=['GET'])
@token_required
def profile(user_id):
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'username': user.username,
        'email': user.email,
    })

@auth_blueprint.route('/change-password', methods=['POST'])
@token_required
def change_password(user_id):
    data = request.get_json()
    allowed_fields = {'current_password', 'new_password'}
    extra_fields = set(data.keys()) - allowed_fields

    if extra_fields:
        return jsonify({'error': f'Unexpected fields provided: {", ".join(extra_fields)}'}), 400

    current_password = data.get('current_password')
    new_password = data.get('new_password')

    user = User.objects(id=user_id).first()
    if not user or not check_password_hash(user.password_hash, current_password):
        return jsonify({'error': 'Invalid current password'}), 401

    user.password_hash = generate_password_hash(new_password)
    user.save()

    return jsonify({'message': 'Password updated successfully'}), 200

@auth_blueprint.route('/update-profile', methods=['POST'])
@token_required
def update_profile(user_id):
    data = request.get_json()
    new_username = data.get('username')
    new_email = data.get('email')

    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if new_username and new_username != user.username:
        if User.objects(username=new_username).first():
            return jsonify({'error': 'Username already taken'}), 400
        user.username = new_username

    if new_email and new_email != user.email:
        if User.objects(email=new_email).first():
            return jsonify({'error': 'Email already taken'}), 400
        user.email = new_email

    if 'password' in data:
        return jsonify({'error': 'Use change-password endpoint to update password.'}), 400

    user.save()

    return jsonify({'message': 'Profile updated successfully', 'username': user.username, 'email': user.email})

@auth_blueprint.route('/delete-user', methods=['DELETE'])
@token_required
def delete_user(user_id):
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.delete()
    return jsonify({'message': 'User deleted successfully'}), 200

@auth_blueprint.route('/logout', methods=['POST'])
@token_required
def logout(user_id):
    auth_header = request.headers.get('Authorization', None)
    token = auth_header.split()[1] if auth_header else None

    if token:
        blacklisted_tokens.add(token)

    return jsonify({'message': 'Logout successful. Token has been revoked on server.'}), 200
