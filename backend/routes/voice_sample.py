import os
from flask import Blueprint, request, jsonify, current_app
from models.voice_sample import VoiceSample
from models.user import User
from routes.auth import token_required

voice_sample_blueprint = Blueprint('voice_sample', __name__)

@voice_sample_blueprint.route('/upload-voice', methods=['POST'])
@token_required
def upload_voice(user_id):
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    audio_file = request.files['audio']

    # Ensure user folder exists
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    folder = os.path.join('static', 'audio', user.username)
    os.makedirs(folder, exist_ok=True)

    # Save file
    filename = audio_file.filename
    save_path = os.path.join(folder, filename)
    audio_file.save(save_path)

    # Store reference in DB
    vs = VoiceSample(user=user, file_path=save_path)
    vs.save()
    return jsonify({'message': 'Voice sample uploaded', 'path': save_path}), 201

@voice_sample_blueprint.route('/my-voice-samples', methods=['GET'])
@token_required
def list_voice_samples(user_id):
    samples = VoiceSample.objects(user=user_id).order_by('-created_at')
    result = [
        {
            'id': str(s.id),
            'file_path': s.file_path,
            'created_at': s.created_at.isoformat()
        }
        for s in samples
    ]
    return jsonify(result), 200
