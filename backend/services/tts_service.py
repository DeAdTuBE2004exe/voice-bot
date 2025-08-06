import os
from TTS.api import TTS
from pydub import AudioSegment
from pydub.playback import play

class TTSService:
    """
    Coqui TTS Service: Supports saving speech to file and (server-side) playback.
    """
    def __init__(self, model_name: str = "tts_models/en/ljspeech/tacotron2-DDC", use_gpu: bool = False):
        try:
            self.tts = TTS(model_name=model_name, gpu=use_gpu)
        except Exception as e:
            raise RuntimeError(f"Failed to initialize TTS model: {e}")

    def synthesize_to_file(self, text: str, output_file: str = "output.wav") -> str:
        """
        Synthesize speech from text, save to .wav, and return file path.
        Raises exception if synthesis or saving fails.
        """
        try:
            self.tts.tts_to_file(text=text, file_path=output_file)
            if not os.path.isfile(output_file):
                raise FileNotFoundError(f"Output file not created: {output_file}")
            return output_file
        except Exception as e:
            raise RuntimeError(f"Speech synthesis failed: {e}")

    def synthesize_and_play(self, text: str, output_file: str = "output.wav"):
        """
        Synthesize speech from text and play it immediately (for backend debug).
        """
        try:
            file_path = self.synthesize_to_file(text, output_file)
            audio = AudioSegment.from_wav(file_path)
            play(audio)
        except Exception as e:
            print(f"An error occurred during synthesis or playback: {e}")
