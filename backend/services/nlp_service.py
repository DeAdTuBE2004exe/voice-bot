import logging
import os
from groq import Groq

class NLPService:
    def __init__(self, model_name: str = "llama-3-70b-8192"):
        self.model_name = model_name  # Use GroqCloud's recommended/default model
        self.api_key = os.getenv("GROQ_API_KEY")
        # print("DEBUG: My GROQ_API_KEY is:", repr(self.api_key))  # <-- Debug print for key
        if not self.api_key:
            logging.error("Groq API key not found in environment!")
        self.client = Groq(api_key=self.api_key)
        logging.info(f"NLPService initialized with model: {self.model_name}")

    def process(self, user_text: str) -> str:
        if not user_text or not user_text.strip():
            return "I didn't hear anything. Could you repeat?"

        try:
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a fast, concise AI assistant.Always respond in short sentences that can be converted to speech quickly. Avoid long paragraphs. Break your answer into small chunks so audio output can start immediately. Provide clear, correct information without unnecessary details. Keep every response brief, natural, and easy for text-to-speech processing."},
                    {"role": "user", "content": user_text}
                ],
                temperature=0.7,
                max_completion_tokens=1000,
                # max_completion_tokens=100,
                top_p=1,
                stream=False
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            logging.error(f"Groq NLP error: {e}")
            return "Oops, something went wrong while generating a response."