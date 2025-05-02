from flask import Flask
from flask_restx import Api
from dotenv import load_dotenv
from flask_cors import CORS 
import os

# Load environment variables
load_dotenv()

# Importing the Job Prediction module (Make sure Job_Prediction.py is in the same directory)
from Job_Prediction import ns as job_ns
from Aternatives import ns as alter_ns
from chatbot import ns as chat_ns
from Insights import ns as insight_ns

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 
# API Documentation setup
api = Api(
    app,
    title="Job Assistance API",
    version="1.0",
    description="API for job fraud detection and career roadmap generation",
    doc="/docs",  # Swagger UI will be accessible at /docs
)

# Correctly register the namespace with a proper URL path (NOT a file path)
api.add_namespace(job_ns, path="/jobs")  # This is the correct usage
api.add_namespace(alter_ns, path="/alternatives")
api.add_namespace(chat_ns, path="/chatbot")
api.add_namespace(insight_ns, path="/insight")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))  # Default to port 5000 if not set in .env
    app.run(debug=True, host="0.0.0.0", port=port)
