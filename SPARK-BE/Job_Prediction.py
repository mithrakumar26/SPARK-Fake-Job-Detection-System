from flask import Flask, request, jsonify
from flask_restx import Api, Namespace, Resource, fields
from flask_cors import CORS
import torch
from transformers import BertTokenizer, BertForSequenceClassification
import google.generativeai as genai
import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app, title="Job Fraud Detection API", version="1.0", description="API for detecting fraudulent job postings and generating career roadmaps")

# ✅ Define a namespace
ns = Namespace("jobs", description="Job-related operations")

# ✅ Load API Keys & Tuned Model IDs
GEMINI_API_KEY_JOB = os.getenv("GEMINI_API_KEY_JOB")  # Gemini for job fraud detection
GEMINI_TUNED_MODEL_JOB = os.getenv("GEMINI_TUNED_MODEL_JOB")

GEMINI_API_KEY_ROADMAP = os.getenv("GEMINI_API_KEY_ROADMAP")  # Gemini for roadmap generation
GEMINI_TUNED_MODEL_ROADMAP = os.getenv("GEMINI_TUNED_MODEL_ROADMAP")

# ✅ Load BERT model and tokenizer for fake job detection
tokenizer = BertTokenizer.from_pretrained(os.getenv("BERT_MODEL_PATH"))
bert_model = BertForSequenceClassification.from_pretrained(os.getenv("BERT_MODEL_PATH"))
bert_model.eval()

# ✅ Define request payload model
job_model = ns.model("JobDescription", {
    "job_description": fields.String(required=True, description="Job posting description to analyze")
})

# ✅ Define response model
response_model = ns.model("JobDetectionResponse", {
    "status": fields.String(description="Fraud detection result"),
    "role_name": fields.String(description="Extracted job role name", nullable=True),
    "roadmap": fields.String(description="Generated career roadmap", nullable=True)
})

def check_with_bert_model(job_description):
    """Detect fraudulent job postings using the BERT model."""
    inputs = tokenizer(job_description, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = bert_model(**inputs)
        logits = outputs.logits
        prediction = torch.argmax(logits, dim=1).item()
    return "Real" if prediction == 0 else "Fake"

def check_with_gemini_tuned(job_description):
    """Detect fraudulent job postings using Gemini AI."""
    genai.configure(api_key=GEMINI_API_KEY_JOB)
    model = genai.GenerativeModel(GEMINI_TUNED_MODEL_JOB)
    
    response = model.generate_content(
        f"Classify the following job posting. Return ONLY '0' for 'Real' and '1' for 'Fake'. No extra text.\n\n{job_description}"
    )

    if response and response.text:
        prediction = response.text.strip()
        return "Real" if prediction == "0" else "Fake"
    return "Error: Invalid response from Gemini"

def generate_roadmap(role_name):
    """Generates a well-structured, step-by-step roadmap for the given job role."""
    
    genai.configure(api_key=GEMINI_API_KEY_ROADMAP)
    model = genai.GenerativeModel(GEMINI_TUNED_MODEL_ROADMAP)
    
    prompt = f"""
    Generate a highly structured career roadmap for becoming a successful {role_name}.
    
    **Instructions for output formatting:**
    - Use **bold** headings for each section.
    - Use bullet points (`-`) to list steps under each section.
    - Ensure clarity, conciseness, and logical step progression.

    ### **Career Roadmap for {role_name}**
    
    **1. Introduction**
    - Overview of the role and its importance.
    
    **2. Skills Required**
    - Essential **technical skills** (list at least 5).
    - Essential **soft skills** (list at least 3).
    
    **3. Educational Path**
    - Recommended **degrees** (if applicable).
    - Certifications to enhance credibility.
    
    **4. Hands-on Experience**
    - Internships and projects that provide real-world exposure.
    - Platforms to practice skills (LeetCode, Kaggle, GitHub, etc.).
    
    **5. Advanced Learning**
    - Specializations or advanced courses to grow in the role.
    - Books, websites, and tools for continuous learning.
    
    **6. Career Growth**
    - Resume-building tips.
    - Effective job search strategies.
    - Interview preparation (technical + behavioral).
    
    **7. Community & Networking**
    - Industry conferences, forums, and LinkedIn groups.
    - Mentorship and networking tips.

    Ensure the response follows the structure exactly and outputs in **markdown-style** formatting.
    """

    response = model.generate_content(prompt)

    if response and response.text:
        return response.text.strip()

    return "Error: Roadmap generation failed."

def extract_role_name(job_description):
    """Extracts the role name from the job description."""
    job_roles = [
        "Software Engineer", "Data Scientist", "Machine Learning Engineer", "Full Stack Developer",
        "Backend Developer", "Frontend Developer", "Cybersecurity Analyst", "Cloud Engineer",
        "DevOps Engineer", "AI Researcher", "Blockchain Developer", "Database Administrator",
        "Product Manager", "Business Analyst", "UI/UX Designer", "Quality Assurance Engineer", "Software Developer"
    ]
    
    for role in job_roles:
        if role.lower() in job_description.lower():
            return role
    return None

def detect_fraudulent_job(job_description):
    """Uses both Gemini AI and BERT model for fraud detection and generates a roadmap if valid."""
    bert_model_result = check_with_bert_model(job_description)
    gemini_tuned_result = check_with_gemini_tuned(job_description)

    # ✅ Dual Model Agreement Logic
    if gemini_tuned_result == "Fake" and bert_model_result == "Fake":
        return {"status": "⚠️ Highly Likely to be Fraudulent", "role_name": None, "roadmap": None}
    elif gemini_tuned_result == "Real" and bert_model_result == "Real":
        role_name = extract_role_name(job_description)
        roadmap = generate_roadmap(role_name) if role_name else "Could not determine role."
        return {"status": "✅ Likely a Genuine Job Posting", "role_name": role_name, "roadmap": roadmap}
    else:
        return {"status": "⚠️ Conflicting Results - Needs Manual Review", "role_name": None, "roadmap": None}

@ns.route('/detect')
class DetectJob(Resource):
    @ns.expect(job_model)
    @ns.response(200, "Success", response_model)
    @ns.response(400, "Bad Request")
    def post(self):
        """Detect if a job posting is fraudulent and generate a roadmap"""
        data = ns.payload
        job_description = data.get('job_description', '')

        if not job_description:
            return {"error": "Job description is required"}, 400

        result = detect_fraudulent_job(job_description)
        return result, 200

# ✅ Add the namespace to the API
api.add_namespace(ns, path="/jobs")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
