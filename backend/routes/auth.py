import os
import jwt
import datetime
import random
import string
import smtplib
from email.mime.text import MIMEText
from functools import wraps
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify, send_file
from models.user import User
from models.pending_user import PendingUser  # <-- NEW import
from werkzeug.security import generate_password_hash, check_password_hash
from services.tts_service import TTSService
from services.nlp_service import NLPService

load_dotenv()

JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "supersecretjwt")
auth_blueprint = Blueprint('auth', __name__)
blacklisted_tokens = set()

tts_service = TTSService()
nlp_service = NLPService(model_name="llama-3.3-70b-versatile")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200
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


def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(to_email, otp):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = os.getenv("GMAIL_SENDER")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")
    subject = "VoiceBot OTP Verification"
    body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color:#222;">
        <p style="font-size:1.15em;">
          Your VoiceBot verification code is: <b style="font-size:1.22em;">{otp}</b>
        </p>
        <p style="font-size:1.02em;">
          This code will expire in 10 minutes for your security.
        </p>
        <p style="color:#999; font-size:0.98em;">
          If you did not request this, you can safely ignore this email.
        </p>
      </body>
    </html>
    """
    msg = MIMEText(body, "html")
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
    except Exception as e:
        print(f"Failed to send OTP email: {str(e)}")

@auth_blueprint.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Check if fully registered user exists with username/email
    if User.objects(username=username).first() or User.objects(email=email).first():
        return jsonify({'error': 'User already exists'}), 400

    # Check for pending registration by email
    pending = PendingUser.objects(email=email).first()
    if pending:
        # Update username if changed
        if pending.username != username:
            pending.username = username
            password_hash = generate_password_hash(password, method='pbkdf2:sha256')
            pending.password_hash = password_hash
            pending.save()
        return jsonify({'error': 'User registration in progress. Please verify OTP.'}), 409

    # New pending registration
    password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    otp = generate_otp()
    otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    PendingUser.objects(email=email).update_one(
        set__username=username,
        set__password_hash=password_hash,
        set__otp=otp,
        set__otp_expiry=otp_expiry,
        upsert=True
    )
    send_otp_email(email, otp)
    return jsonify({'message': 'OTP sent to your email.'}), 201



@auth_blueprint.route('/signup/verify-otp', methods=['POST', 'OPTIONS'])
def verify_signup_otp():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    pending = PendingUser.objects(email=email).first()
    if (not pending 
        or pending.otp != otp 
        or pending.otp_expiry < datetime.datetime.utcnow()):
        return jsonify({'error': 'Invalid or expired OTP'}), 400

    user = User(
        username=pending.username,
        email=pending.email,
        password_hash=pending.password_hash
    )
    user.save()
    pending.delete()
    return jsonify({'message': 'Signup complete! You can now log in.'}), 200


@auth_blueprint.route('/signup/resend-otp', methods=['POST', 'OPTIONS'])
def resend_signup_otp():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    email = data.get('email')
    pending = PendingUser.objects(email=email).first()
    if not pending:
        return jsonify({'error': 'No pending registration for this email.'}), 400
    otp = generate_otp()
    pending.otp = otp
    pending.otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    pending.save()
    send_otp_email(email, otp)
    return jsonify({'message': 'OTP resent.'})


# --- Unchanged standard endpoints below ---
@auth_blueprint.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    user = (User.objects(username=username).first() if username else User.objects(email=email).first())
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


@auth_blueprint.route('/profile', methods=['GET', 'OPTIONS'])
@token_required
def profile(user_id):
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'username': user.username, 'email': user.email})


@auth_blueprint.route('/change-password', methods=['POST', 'OPTIONS'])
@token_required
def change_password(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    user = User.objects(id=user_id).first()
    if not user or not check_password_hash(user.password_hash, current_password):
        return jsonify({'error': 'Invalid current password'}), 401
    user.password_hash = generate_password_hash(new_password, method='pbkdf2:sha256')
    user.save()
    return jsonify({'message': 'Password updated successfully'}), 200


@auth_blueprint.route('/update-profile', methods=['POST', 'OPTIONS'])
@token_required
def update_profile(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    new_username = data.get('username')
    new_email = data.get('email')
    new_password = data.get('password')
    otp = data.get('otp', '').strip()
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not user.profile_update_otp or user.profile_update_otp != otp:
        return jsonify({'error': 'Invalid or missing OTP'}), 400
    if user.profile_update_otp_expiry < datetime.datetime.utcnow():
        return jsonify({'error': 'OTP expired'}), 400

    if new_username and new_username != user.username:
        if User.objects(username=new_username).first():
            return jsonify({'error': 'Username already taken'}), 400
        user.username = new_username
    if new_email and new_email != user.email:
        if User.objects(email=new_email).first():
            return jsonify({'error': 'Email already taken'}), 400
        user.email = new_email
    if new_password:
        user.password_hash = generate_password_hash(new_password, method='pbkdf2:sha256')

    user.profile_update_otp = None
    user.profile_update_otp_expiry = None
    user.save()
    return jsonify({'message': 'Profile updated', 'username': user.username, 'email': user.email})


@auth_blueprint.route('/delete-user', methods=['DELETE', 'OPTIONS'])
@token_required
def delete_user(user_id):
    if request.method == "OPTIONS":
        return '', 200
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.delete()
    return jsonify({'message': 'User deleted successfully'}), 200


@auth_blueprint.route('/logout', methods=['POST', 'OPTIONS'])
@token_required
def logout(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    auth_header = request.headers.get('Authorization')
    token = auth_header.split()[1] if auth_header else None
    if token:
        blacklisted_tokens.add(token)
    return jsonify({'message': 'Logout successful. Token has been revoked.'}), 200


@auth_blueprint.route('/tts', methods=['POST', 'OPTIONS'])
@token_required
def tts(user_id):
    if request.method == 'OPTIONS':
        return '', 200
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


@auth_blueprint.route('/chat', methods=['POST', 'OPTIONS'])
@token_required
def chat(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    user_text = data.get("text", "").strip()
    if not user_text:
        return jsonify({"error": "No text provided"}), 400
    ai_reply = nlp_service.process(user_text)
    return jsonify({"response": ai_reply}), 200


@auth_blueprint.route('/request-password-reset', methods=['POST', 'OPTIONS'])
def request_password_reset():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    email = data.get('email')
    user = User.objects(email=email).first()
    if user:
        otp = generate_otp()
        user.password_reset_otp = otp
        user.password_reset_otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=3)
        user.save()
        try:
            send_otp_email(user.email, otp)
        except Exception as e:
            print(f"send_otp_email failed: {e}")
    return jsonify({'message': 'If this email exists, an OTP has been sent.'})


@auth_blueprint.route('/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')
    user = User.objects(email=email).first()
    if not user or user.password_reset_otp != otp:
        return jsonify({'error': 'Invalid email or OTP'}), 400
    if user.password_reset_otp_expiry < datetime.datetime.utcnow():
        return jsonify({'error': 'OTP expired'}), 400
    user.password_hash = generate_password_hash(new_password)
    user.password_reset_otp = None
    user.password_reset_otp_expiry = None
    user.save()
    return jsonify({'message': 'Password reset successful!'})


@auth_blueprint.route('/request-profile-update-otp', methods=['POST', 'OPTIONS'])
@token_required
def request_profile_update_otp(user_id):
    if request.method == "OPTIONS":
        return '', 200
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    otp = generate_otp()
    user.profile_update_otp = otp
    user.profile_update_otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    user.save()
    send_otp_email(user.email, otp)
    return jsonify({"message": "OTP sent to your email for profile update."})


@auth_blueprint.route('/request-delete-otp', methods=['POST', 'OPTIONS'])
@token_required
def request_delete_otp(user_id):
    if request.method == "OPTIONS":
        return '', 200
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404


    now = datetime.datetime.utcnow()
    # Backend rate-limiting: allow only one OTP every 60 seconds
    if hasattr(user, "last_delete_otp_sent") and user.last_delete_otp_sent:
        elapsed = (now - user.last_delete_otp_sent).total_seconds()
        if elapsed < 60:
            wait_sec = int(60 - elapsed)
            return jsonify({'error': f'OTP already sent. Please wait {wait_sec}s before requesting again.'}), 429


    otp = generate_otp()
    user.delete_account_otp = otp
    user.delete_account_otp_expiry = now + datetime.timedelta(minutes=10)
    user.last_delete_otp_sent = now
    user.save()
    send_otp_email(user.email, otp)
    return jsonify({"message": "OTP sent to your email for account deletion."})
