# from flask import Blueprint, request, jsonify
# from services.asr_service import transcribe_audio

# voicebot_blueprint = Blueprint('voicebot', __name__)

# @voicebot_blueprint.route('/transcribe', methods=['POST'])
# def transcribe():
#     if 'audio' not in request.files:
#         return jsonify({"error": "No audio file provided"}), 400
#     file = request.files['audio']
#     file_path = f"temp/{file.filename}"
#     file.save(file_path)
#     transcription = transcribe_audio(file_path)
#     return jsonify({"transcription": transcription})
from flask import Blueprint, request, jsonify
from services.asr_service import ASRService
import os

voicebot_blueprint = Blueprint('voicebot', __name__)
asr_service = ASRService()  # Initialize ASR service once

@voicebot_blueprint.route('/transcribe', methods=['POST'])
def transcribe():
    # Check if audio file part is in request
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    file = request.files['audio']

    # Check if file has a filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Ensure temp directory exists
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)

    # Save uploaded file to temp directory
    file_path = os.path.join(temp_dir, file.filename)
    file.save(file_path)

    try:
        # Transcribe using the ASR service instance method
        transcription = asr_service.transcribe_audio(file_path)
    except FileNotFoundError:
        return jsonify({"error": "Audio file not found after upload."}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred during transcription: {str(e)}"}), 500
    finally:
        # Clean up temp file
        if os.path.exists(file_path):
            os.remove(file_path)

    # Return transcription result
    return jsonify({"transcription": transcription}), 200
