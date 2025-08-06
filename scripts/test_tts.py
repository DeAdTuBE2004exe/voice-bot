# from TTS.api import TTS # creates an audio file as an outout
# # import os
# # os.system("ffmpeg -y -i output.wav -acodec pcm_s16le -ar 22050 output_fixed.wav")

# # Option 1: List available TTS models
# tts = TTS()
# model_manager = tts.list_models()

# print("Some available TTS models:")
# for model_name in list(model_manager.models_dict.keys())[:10]:  # Print first 10 for brevity
#     print("-", model_name)

# # Option 2: Pick a popular English model, or any from the printed list above
# chosen_model = "tts_models/en/ljspeech/tacotron2-DDC"

# # Initialize TTS using the chosen model
# tts = TTS(model_name=chosen_model)

# # Synthesize speech and save to file
# tts.tts_to_file(text="i love you ganduu", file_path="output.wav")

# print("Speech synthesis complete! Check the file output.wav in your folder.")

from TTS.api import TTS
from pydub import AudioSegment
from pydub.playback import play

try:
    tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")
    output_file = "output.wav"
    tts.tts_to_file(text="soniya's ring is cool!!", file_path=output_file)

    audio = AudioSegment.from_wav(output_file)
    play(audio)

except Exception as e:
    print(f"An error occurred: {e}")
