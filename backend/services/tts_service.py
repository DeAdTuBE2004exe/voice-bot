import io
from TTS.api import TTS
import soundfile as sf

class TTSService:
    def __init__(self, model_name="tts_models/en/vctk/vits", use_gpu=False):
        """
        Default model: 'tts_models/en/vctk/vits' (British/Multiple speakers)
        Change model_name to use another accent or voice.
        """
        self.tts = TTS(model_name=model_name, gpu=use_gpu)

    def synthesize_wav_bytes(self, text, speaker="p273"):
        """
        Synthesizes speech from text and returns WAV audio in memory (BytesIO).
        Default speaker 'p273' is a British female voice; choose others via self.tts.speakers
        """
        samples = self.tts.tts(text, speaker=speaker)
        buf = io.BytesIO()
        sf.write(buf, samples, self.tts.synthesizer.output_sample_rate, format="WAV")
        buf.seek(0)
        return buf
