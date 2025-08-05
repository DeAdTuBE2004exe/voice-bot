import whisper

model = whisper.load_model("base")

def transcribe_audio(filepath):
    # Add fp16=False here to suppress the warning!
    result = model.transcribe(filepath, fp16=False)
    return result["text"]
