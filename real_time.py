# import whisper
# import pyaudio
# import numpy as np
# import queue
# import threading

# # Settings
# SAMPLE_RATE = 16000         # Sample rate (works best for Whisper)
# CHUNK = 1024                # How many samples per read
# BUFFER_SECONDS = 5          # Transcribe every 5 seconds

# q = queue.Queue()

# # This is called whenever new audio is available
# def audio_callback(in_data, frame_count, time_info, status):
#     q.put(in_data)
#     return (in_data, pyaudio.paContinue)

# def listen_microphone():
#     p = pyaudio.PyAudio()
#     stream = p.open(format=pyaudio.paInt16,
#                     channels=1,
#                     rate=SAMPLE_RATE,
#                     input=True,
#                     frames_per_buffer=CHUNK,
#                     stream_callback=audio_callback)
#     stream.start_stream()
#     print("Listening... (Ctrl+C to stop)")
#     try:
#         while True:
#             pass
#     except KeyboardInterrupt:
#         stream.stop_stream()
#         stream.close()
#         p.terminate()
#         print("Stopped.")

# def transcribe_realtime(model):
#     bytes_per_sample = 2  # 16-bit audio
#     buffer = b''
#     while True:
#         data = q.get()
#         buffer += data
#         if len(buffer) >= BUFFER_SECONDS * SAMPLE_RATE * bytes_per_sample:
#             # Convert to float32 for Whisper
#             audio = np.frombuffer(buffer, np.int16).astype(np.float32) / 32768.0
#             print("Transcribing...")
#             result = model.transcribe(audio)
#             print("You said:", result['text'].strip())
#             print('-'*40)
#             buffer = b''

# if __name__ == "__main__":
#     print("Loading Whisper Model. Please wait...")
#     model = whisper.load_model("base")  # or "small" for faster
#     threading.Thread(target=transcribe_realtime, args=(model,), daemon=True).start()
#     listen_microphone()

import whisper
import pyaudio
import numpy as np
import queue

# Audio settings
SAMPLE_RATE = 16000         # Sample rate (works best for Whisper)
CHUNK = 1024                # Number of audio frames per read
BUFFER_SECONDS = 10          # Transcribe after this many seconds of audio

q = queue.Queue()

# Callback function to capture audio chunks and put into queue
def audio_callback(in_data, frame_count, time_info, status):
    q.put(in_data)
    return (in_data, pyaudio.paContinue)

def listen_and_transcribe():
    # Initialize PyAudio
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paInt16,
                    channels=1,
                    rate=SAMPLE_RATE,
                    input=True,
                    frames_per_buffer=CHUNK,
                    stream_callback=audio_callback)
    stream.start_stream()

    print("Loading Whisper model... please wait.")
    model = whisper.load_model("base")  # Use "small" or others for speed/accuracy trade-off

    bytes_per_sample = 2  # 16-bit audio uses 2 bytes per sample
    buffer = b''

    print("Start speaking. Press Ctrl+C to stop.")

    try:
        while True:
            data = q.get()
            buffer += data
            if len(buffer) >= BUFFER_SECONDS * SAMPLE_RATE * bytes_per_sample:
                # Convert bytes to float32 numpy array normalized between -1.0 and 1.0
                audio = np.frombuffer(buffer, np.int16).astype(np.float32) / 32768
                print("Transcribing...")
                # Disable fp16 to avoid warning on CPU
                result = model.transcribe(audio, fp16=False)
                print("You said:", result['text'].strip())
                print("-" * 40)
                buffer = b''

    except KeyboardInterrupt:
        print("\nStopped listening.")
    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()

if __name__ == "__main__":
    listen_and_transcribe()
