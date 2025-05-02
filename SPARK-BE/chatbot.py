from flask import Flask, request, jsonify
from flask_restx import Api, Namespace, Resource, reqparse, fields
from werkzeug.datastructures import FileStorage  # ✅ Required for file uploads
import fitz  # PyMuPDF for PDF text extraction
import google.generativeai as genai  # Google Gemini API
from flask_cors import CORS
import os
import tempfile
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for frontend interaction
api = Api(
    app,
    title="Job Assistance API",
    version="1.1",
    description="API for job fraud detection and career roadmap generation"
)

# ✅ Define Flask-RESTx Namespace
ns = Namespace("chatbot", description="Chatbot AI for job recommendations")

# ✅ Load Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# ✅ Fix: Use `FileStorage` instead of `str` to enable file uploads
upload_parser = reqparse.RequestParser()
upload_parser.add_argument(
    "resume",
    type=FileStorage,  # ✅ Enables the file upload option in Swagger UI
    location="files",
    required=True,
    help="Upload a resume file (PDF only)"
)

# ✅ Define response model
job_response_model = ns.model("JobResponse", {
    "suggested_roles": fields.List(fields.String, description="List of recommended job roles")
})


def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file using PyMuPDF"""
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text("text") + "\n"
    except Exception as e:
        return f"Error reading PDF: {str(e)}"
    return text.strip()


def get_job_recommendations(resume_text):
    """Use Gemini API to suggest job roles based on resume content"""
    model = genai.GenerativeModel("gemini-1.5-pro")  # ✅ Use the correct Gemini model

    prompt = f"""
    You are an AI career advisor. Analyze the following resume text and suggest 5 most suitable job roles based on experience and skills:
    
    {resume_text}

    Provide a JSON response with:
    - `suggested_roles`: A list of 5 job roles.
    """

    response = model.generate_content(prompt)

    # Extract JSON response safely
    try:
        return response.text.strip()
    except Exception as e:
        return {"error": f"Failed to process response: {str(e)}"}


@ns.route("/upload-resume")
class ResumeUpload(Resource):
    """Handles resume upload and job recommendations"""
    @ns.expect(upload_parser)  # ✅ Expect file input, not a string
    @ns.response(200, "Success", job_response_model)
    @ns.response(400, "Bad Request")
    def post(self):
        """Process resume and return job role recommendations"""
        args = upload_parser.parse_args()
        file = args["resume"]

        if not file:
            return {"error": "No file uploaded"}, 400

        # ✅ Save the uploaded file securely using tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name

        # ✅ Extract text and get job recommendations
        resume_text = extract_text_from_pdf(temp_path)
        if not resume_text:
            return {"error": "Could not extract text from resume."}, 400

        job_roles = get_job_recommendations(resume_text)

        return jsonify({"suggested_roles": job_roles})


# ✅ Add the namespace to the API
api.add_namespace(ns, path="/chatbot")

# ✅ Run Flask App
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
