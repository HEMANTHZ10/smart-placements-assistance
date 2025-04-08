import requests
import os
from dotenv import load_dotenv

load_dotenv()

CHATBOT_MODEL=os.getenv("CHATBOT_MODEL")
CHATBOT_URL=os.getenv("CHATBOT_ENDPOINT")

def query_ollama(prompt: str, model: str = CHATBOT_MODEL):
    try:
        response = requests.post(
            CHATBOT_URL,
            json={"model": model, "prompt": prompt, "stream": False}
        )
        if response.status_code == 200:
            data = response.json()
            if "response" in data:
                return data["response"]
            else:
                print("Unexpected response format:", data)
                return "Sorry, I couldn’t understand the response from the model."
        else:
            print("Ollama API error:", response.status_code, response.text)
            return "Sorry, I couldn’t generate a response right now."
    except Exception as e:
        print("Ollama request failed:", str(e))
        return "Sorry, something went wrong while connecting to the LLM."
