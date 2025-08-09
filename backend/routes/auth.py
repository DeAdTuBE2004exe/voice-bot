# backend/routes/auth.py

import os
import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify, send_file
from models.user import User
from werkzeug.security import generate_password_hash, check_password_hash
from services.tts_service import TTSService
from services.nlp_service import NLPService

# =========================
# CONFIG & BLUEPRINT
# =========================
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "supersecretjwt")
auth_blueprint = Blueprint('auth', __name__)
blacklisted_tokens = set()

# Initialize services
tts_service = TTSService()
nlp_service = NLPService(model_name="llama3")

# =========================
# AUTH DECORATOR
# =========================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token missing!'}), 401
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid token header'}), 401

        token = parts[1]
        if token in blacklisted_tokens:
            return jsonify({'error': 'Token revoked'}), 401
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(user_id, *args, **kwargs)
    return decorated

# =========================
# AUTH ROUTES
# =========================
@auth_blueprint.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.objects(username=username).first() or User.objects(email=email).first():
        return jsonify({'error': 'User already exists'}), 400

    password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    user = User(username=username, email=email, password_hash=password_hash)
    user.save()
    return jsonify({'message': 'User created successfully'}), 201

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    user = (User.objects(username=username).first() if username
            else User.objects(email=email).first())

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

@auth_blueprint.route('/profile', methods=['GET'])
@token_required
def profile(user_id):
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'username': user.username, 'email': user.email})

@auth_blueprint.route('/change-password', methods=['POST'])
@token_required
def change_password(user_id):
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    user = User.objects(id=user_id).first()
    if not user or not check_password_hash(user.password_hash, current_password):
        return jsonify({'error': 'Invalid current password'}), 401

    user.password_hash = generate_password_hash(new_password, method='pbkdf2:sha256')
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

    user.save()
    return jsonify({'message': 'Profile updated', 'username': user.username, 'email': user.email})

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
    auth_header = request.headers.get('Authorization')
    token = auth_header.split()[1] if auth_header else None
    if token:
        blacklisted_tokens.add(token)
    return jsonify({'message': 'Logout successful. Token has been revoked.'}), 200

# =========================
# TTS ROUTE
# =========================
@auth_blueprint.route('/tts', methods=['POST'])
@token_required
def tts(user_id):
    data = request.get_json()
    text = data.get("text")
    speaker = data.get("speaker", "p273")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        wav_bytes_io = tts_service.synthesize_wav_bytes(text, speaker)
    except Exception as e:
        return jsonify({"error": f"TTS failed: {str(e)}"}), 500

    return send_file(wav_bytes_io, mimetype="audio/wav", as_attachment=False)

# =========================
# CHAT ROUTE (Ollama integration)
# =========================
@auth_blueprint.route('/chat', methods=['POST'])
@token_required
def chat(user_id):
    """
    POST /chat
    JSON: { "text": "Hello!" }
    Returns: { "response": "AI reply" }
    Requires: Bearer <JWT token>
    """
    data = request.get_json()
    user_text = data.get("text", "").strip()

    if not user_text:
        return jsonify({"error": "No text provided"}), 400

    ai_reply = nlp_service.process(user_text)
    return jsonify({"response": ai_reply}), 200
