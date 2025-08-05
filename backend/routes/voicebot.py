from flask import Blueprint, request, jsonify
from services.asr_service import transcribe_audio

voicebot_blueprint = Blueprint('voicebot', __name__)

@voicebot_blueprint.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    file = request.files['audio']
    file_path = f"temp/{file.filename}"
    file.save(file_path)
    transcription = transcribe_audio(file_path)
    return jsonify({"transcription": transcription})
