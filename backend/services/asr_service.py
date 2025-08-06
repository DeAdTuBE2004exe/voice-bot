# import whisper # speech to text

# model = whisper.load_model("base")

# def transcribe_audio(filepath):
#     # Add fp16=False here to suppress the warning!
#     result = model.transcribe(filepath, fp16=False)
#     return result["text"]
import whisper
import os

class ASRService:
    def __init__(self, model_name: str = "base"):
        self.model = whisper.load_model(model_name)

    def transcribe_audio(self, file_path: str) -> str:
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")
        result = self.model.transcribe(file_path, fp16=False)
        return result.get("text", "")
