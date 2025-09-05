from dotenv import load_dotenv
load_dotenv()

import os
print("DEBUG: GROQ_API_KEY loaded in app.py:", repr(os.getenv("GROQ_API_KEY")))

from flask import Flask
from flask_mongoengine import MongoEngine
from flask_cors import CORS

app = Flask(__name__)

# --- GLOBAL CORS CONFIG ---
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)
# --------------------------

app.config['MONGODB_SETTINGS'] = {
    'host': os.environ.get('MONGODB_URI')
}

db = MongoEngine(app)

# Voicebot routes
from routes.voicebot import voicebot_blueprint
app.register_blueprint(voicebot_blueprint)

# Auth routes (CORS applies here too)
from routes.auth import auth_blueprint
app.register_blueprint(auth_blueprint, url_prefix='/auth')

# Voice samples routes
from routes.voice_sample import voice_sample_blueprint
app.register_blueprint(voice_sample_blueprint)

if __name__ == "__main__":
    app.run(debug=True)
