from flask import Flask
from flask_mongoengine import MongoEngine
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Create the Flask app
app = Flask(__name__)

# Configure MongoEngine connection with your MongoDB URI
app.config['MONGODB_SETTINGS'] = {
    'host': os.environ.get('MONGODB_URI')
}

# Initialize MongoEngine ORM with Flask app
db = MongoEngine(app)

# -------------------------
# Register Blueprints
# -------------------------

# Voicebot routes (ASR + Chatbot pipeline)
from routes.voicebot import voicebot_blueprint
app.register_blueprint(voicebot_blueprint)  # no prefix

# Auth routes (/signup, /login, /chat, etc.)
from routes.auth import auth_blueprint
app.register_blueprint(auth_blueprint)

# Voice samples upload/list routes
from routes.voice_sample import voice_sample_blueprint
app.register_blueprint(voice_sample_blueprint)

# -------------------------
# Run Flask app
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)
