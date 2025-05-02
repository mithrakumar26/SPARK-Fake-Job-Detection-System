import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    GEMINI_API_KEY_JOB = os.getenv("GEMINI_API_KEY_JOB")
    GEMINI_API_KEY_ROADMAP = os.getenv("GEMINI_API_KEY_ROADMAP")
    GEMINI_TUNED_MODEL_JOB = os.getenv("GEMINI_TUNED_MODEL_JOB")
    GEMINI_TUNED_MODEL_ROADMAP = os.getenv("GEMINI_TUNED_MODEL_ROADMAP")
    BERT_MODEL_PATH = os.getenv("BERT_MODEL_PATH")
