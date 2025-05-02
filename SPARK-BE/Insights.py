from flask import Flask
from flask_restx import Api, Namespace, Resource, fields
import google.generativeai as genai
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Flask app setup
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app, title="Job Assistance API", version="1.1", description="API for job fraud detection and roadmap generation")

# ✅ Define a namespace correctly
ns = Namespace("jobs", description="Job-related operations")

# Load Gemini API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY_ROADMAP"))

# ✅ Define request model for roadmap generation inside the namespace
roadmap_model = ns.model("RoadmapRequest", {
    "job_title": fields.String(required=True, description="Job title"),
    "available_time": fields.String(required=True, description="Available time in weeks/months before the interview")
})

# ✅ Define response model inside the namespace
roadmap_response_model = ns.model("RoadmapResponse", {
    "job_title": fields.String(description="Job title"),
    "roadmap": fields.String(description="Generated structured roadmap")
})

def generate_dynamic_roadmap(job_title, available_time):
    """
    Generates a structured roadmap for preparing for an interview within the available time.
    """
    model = genai.GenerativeModel(os.getenv("GEMINI_TUNED_MODEL_ROADMAP"))
    
    prompt = f"""
    **Task:** Generate a **structured, well-formatted, and step-by-step interview preparation roadmap** for a **{job_title}** role.
    
    **Time Constraint:** The user has **{available_time}** before their interview.
    
    **Instructions for Output Formatting:**
    - Use **bold section headings** (`**1. Introduction**`).
    - Use **bullet points (`-`) for clarity**.
    - Ensure **each section contains actionable steps**.
    - **Avoid repetition** of words like "StepStepStep".
    - Do **not** output more than **500 words**.

    --- 
    
    ## **Roadmap for {job_title} Interview Preparation**
    
    ### **1. Introduction**
    - Overview of the {job_title} role.
    - Key industry expectations and skills required.
    
    ### **2. Understanding Fundamentals**
    - Learn foundational concepts relevant to {job_title}.
    - Recommended resources:
      - Books: "Cracking the Coding Interview", "Clean Code".
      - Online Courses: "CS50 by Harvard", "Software Development with Python".
    
    ### **3. Technical Skills to Master**
    - Programming languages required (e.g., Python, Java, C++).
    - Data structures & algorithms (Sorting, Graphs, DP).
    - System design basics.
    - Key industry frameworks (e.g., Spring Boot, React, Flask).
    
    ### **4. Hands-on Practice**
    - Solve at least **10 coding problems per week**.
    - Platforms: **LeetCode, HackerRank, CodeSignal**.
    
    ### **5. Soft Skills & Communication**
    - Learn **STAR method** for behavioral interview answers.
    - Improve **communication skills** for technical interviews.
    
    ### **6. Time Allocation Plan ({available_time})**
    - **Week 1:** Focus on basics & programming.
    - **Week 2-3:** Deep dive into advanced topics.
    - **Week 4+ (if available):** Mock interviews & revision.
    
    ### **7. Mock Interviews & Final Preparation**
    - Conduct **2-3 mock interviews** with peers or online platforms.
    - Resume optimization & LinkedIn profile review.
    
    ### **8. Resources & Study Materials**
    - Books, documentation, and GitHub repositories.
    - Online communities: LinkedIn, Discord, Tech Twitter.

    **Ensure the roadmap is strictly structured with subheadings, bullet points, and clear time-based goals.** Avoid unnecessary words.
    """

    response = model.generate_content(prompt)

    if response and response.text:
        return response.text.strip()
    return "Error: Failed to generate roadmap."


@ns.route('/generate-roadmap')
class RoadmapGenerator(Resource):
    @ns.expect(roadmap_model)  # ✅ Use `ns.expect()` instead of `api.expect()`
    @ns.response(200, "Success", roadmap_response_model)  # ✅ Use `ns.response()`
    @ns.response(400, "Bad Request")
    def post(self):
        """Generate a structured roadmap based on job title and preparation time"""
        data = ns.payload  # ✅ Correct way to get request payload
        job_title = data.get("job_title", "").strip()
        available_time = data.get("available_time", "").strip()

        if not job_title or not available_time:
            return {"error": "Both job_title and available_time are required"}, 400

        roadmap = generate_dynamic_roadmap(job_title, available_time)
        return {"job_title": job_title, "roadmap": roadmap}, 200

# ✅ Add the namespace to the API
api.add_namespace(ns, path="/jobs")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
