from flask import Flask
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# Import and register blueprints
from routes.voicebot import voicebot_blueprint
app.register_blueprint(voicebot_blueprint, url_prefix='/voicebot')

# Add future blueprints here as your app grows
# from routes.user import user_blueprint
# app.register_blueprint(user_blueprint, url_prefix='/api/user')

if __name__ == "__main__":
    app.run(debug=True)