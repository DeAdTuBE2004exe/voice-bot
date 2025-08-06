
from TTS.api import TTS
from pydub import AudioSegment
from pydub.playback import play

# Initialize TTS with your preferred model
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")
output_file = "output.wav"
tts.tts_to_file(text="Hello! This speech will play automatically! LETS GO", file_path=output_file)

# Load and play the audio right away
audio = AudioSegment.from_wav(output_file)
play(audio)
