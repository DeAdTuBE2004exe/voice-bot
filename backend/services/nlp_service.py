# backend/services/nlp_service.py

import logging
import ollama

class NLPService:
    def __init__(self, model_name: str = "llama3"):
        """
        NLPService using local Ollama model.
        Make sure Ollama is running and model is pulled:
        ollama pull llama3
        """
        self.model_name = model_name
        logging.info(f"NLPService initialized with model: {self.model_name}")

    def process(self, user_text: str) -> str:
        """
        Generate a reply using the local Ollama model.
        """
        if not user_text or not user_text.strip():
            return "I didn't hear anything. Could you repeat?"

        try:
            response = ollama.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": user_text}
                ]
            )
            return response['message']['content'].strip()
        except Exception as e:
            logging.error(f"Ollama NLP error: {e}")
            return "Oops, something went wrong while generating a response."
