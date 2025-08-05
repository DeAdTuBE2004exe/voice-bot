# Hindli language is transcribed in English and is not accurate.
# Kannada language is a gone case it converts it to gibberish.
# English and Japanese are transcribed accurately.

import whisper
import os

def transcribe_audio(model, file_path):
    result = model.transcribe(file_path)
    return result["text"]

if __name__ == "__main__":
    model = whisper.load_model("base")  # Load model once

    # Specify the audio file inside the audios folder
    audio_file_name = "bharat_japanese_1.wav"  # Change this as needed
    audio_path = os.path.join("audios", audio_file_name)

    if os.path.exists(audio_path):
        transcription = transcribe_audio(model, audio_path)
        print(f"Transcription for {audio_file_name}:\n{transcription}")
    else:
        print(f"Audio file {audio_file_name} not found in audios folder.")