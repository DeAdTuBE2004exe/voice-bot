import os
import uuid
from flask import Blueprint, request, jsonify
from services.asr_service import ASRService
from services.tts_service import TTSService
from routes.auth import token_required, nlp_service  # reuse auth & NLP from auth.py

voicebot_blueprint = Blueprint('voicebot', __name__)

# Initialize once
asr_service = ASRService()
tts_service = TTSService()

@voicebot_blueprint.route('/chatbot', methods=['POST'])
@token_required
def chatbot(user_id):
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']
    if not file.filename:
        return jsonify({'error': 'No selected file'}), 400

    # Optional: allow client to choose speaker, else default
    speaker = request.form.get("speaker", "p273")

    # Temp directory for input audio
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)

    # Directory for chatbot response audio
    audio_dir = os.path.join("static", "audio", "chatbot")
    os.makedirs(audio_dir, exist_ok=True)

    # Save uploaded file temporarily
    input_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{file.filename}")
    file.save(input_path)

    try:
        # 1️⃣ ASR - Speech to Text
        user_text = asr_service.transcribe_audio(input_path)
        if not user_text.strip():
            return jsonify({'error': 'No speech detected'}), 400

        # 2️⃣ NLP - AI-generated reply text
        ai_reply = nlp_service.process(user_text)

        # 3️⃣ TTS - Save reply as .wav using chosen speaker
        output_filename = f"{uuid.uuid4()}.wav"
        output_path = os.path.join(audio_dir, output_filename)
        tts_service.tts.tts_to_file(ai_reply, speaker=speaker, file_path=output_path)

        # 4️⃣ Build public URL for audio
        audio_url = f"/static/audio/chatbot/{output_filename}"

        # 5️⃣ Return text + audio URL
        return jsonify({
            "text": ai_reply,
            "audio_url": audio_url
        })

    except Exception as e:
        return jsonify({"error": f"Pipeline error: {str(e)}"}), 500

    finally:
        # Remove input audio after processing
        if os.path.exists(input_path):
            os.remove(input_path)
