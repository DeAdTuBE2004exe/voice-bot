from flask import Flask
from flask_mongoengine import MongoEngine
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# Configure MongoEngine connection with your MongoDB URI
app.config['MONGODB_SETTINGS'] = {
    'host': os.environ.get('MONGODB_URI')
}

# Initialize MongoEngine ORM with Flask app
db = MongoEngine(app)

# Register your voicebot blueprint with the /voicebot prefix
from routes.voicebot import voicebot_blueprint
# app.register_blueprint(voicebot_blueprint, url_prefix='/voicebot')
app.register_blueprint(voicebot_blueprint)

# Register your auth blueprint with NO prefix to keep flat routes
from routes.auth import auth_blueprint
app.register_blueprint(auth_blueprint)  # Routes like /signup, /login, etc.

# Register your voice sample blueprint for /upload-voice etc.
from routes.voice_sample import voice_sample_blueprint
app.register_blueprint(voice_sample_blueprint)  # new! enables /upload-voice, etc.

# Run Flask app in debug mode
if __name__ == "__main__":
    app.run(debug=True)