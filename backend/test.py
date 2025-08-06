from TTS.api import TTS

tts = TTS()

print("Available models:")

model_manager = tts.list_models()

print(type(model_manager))
print(dir(model_manager))
print(model_manager)   # print the object itself, sometimes it has a good __repr__

# Optional: try printing any attribute that looks promising
if hasattr(model_manager, "all_models"):
    print("All models attribute found:")
    print(model_manager.all_models)
