import io
from TTS.api import TTS
import soundfile as sf

class TTSService:
    def __init__(self, model_name="tts_models/en/ljspeech/tacotron2-DDC", use_gpu=False):
        self.tts = TTS(model_name=model_name, gpu=use_gpu)

    def synthesize_wav_bytes(self, text):
        samples = self.tts.tts(text)
        buf = io.BytesIO()
        sf.write(buf, samples, self.tts.synthesizer.output_sample_rate, format='WAV')
        buf.seek(0)
        return buf
