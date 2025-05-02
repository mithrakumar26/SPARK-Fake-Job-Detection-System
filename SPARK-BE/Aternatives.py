from flask import Flask
from flask_restx import Api, Namespace, Resource, fields
from flask_cors import CORS
import requests
from serpapi import GoogleSearch
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SERPAPI_KEY = os.getenv("SERPAPI_KEY")  # Ensure the key is in your .env file

# Flask app setup
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app, title="Google Jobs API", version="1.0", description="Fetch job listings from Google Jobs")

# Define a namespace
ns = Namespace("jobs", description="Job-related operations")

# Define request payload model
job_search_model = ns.model("JobSearch", {
    "role": fields.String(required=True, description="Job role to search for"),
    "location": fields.String(required=True, description="Job location")
})

# Define response model
job_response_model = ns.model("JobResponse", {
    "title": fields.String(description="Job Title"),
    "company": fields.String(description="Company Name"),
    "location": fields.String(description="Job Location"),
    "posted_date": fields.String(description="Posted Date"),
    "job_url": fields.String(description="Job Posting URL"),
    "description": fields.String(description="Job Description")
})

def fetch_jobs_from_google(role, location):
    """Fetch job listings from Google Jobs using SerpAPI"""
    params = {
        "engine": "google_jobs",
        "q": f"{role} jobs in {location}",  
        "location": location,
        "api_key": SERPAPI_KEY
    }

    search = GoogleSearch(params)
    results = search.get_dict()
    jobs = results.get("jobs_results", [])

    job_listings = []
    
    for job in jobs:
        job_title = job.get("title")
        company = job.get("company_name", "Unknown Company")
        job_location = job.get("location", "Unknown Location")
        job_id = job.get("job_id", "")
        
        # Constructing a **searchable** job URL since direct links aren't provided
        job_url = f"https://www.google.com/search?q={job_title}+jobs+at+{company}+in+{job_location}"
        
        job_listings.append({
            "title": job_title,
            "company": company,
            "location": job_location,
            "posted_date": job.get("detected_extensions", {}).get("posted_at", "Not Provided"),
            "job_url": job_url,
            "description": job.get("description", "No description available.")
        })

    return job_listings if job_listings else {"message": "No jobs found for this query."}

@ns.route('/search-google')
class GoogleJobSearch(Resource):
    @ns.expect(job_search_model)
    @ns.response(200, "Success", [job_response_model])
    @ns.response(400, "Bad Request")
    def post(self):
        """Search for jobs using Google Jobs API"""
        data = ns.payload
        role = data.get("role", "").strip()
        location = data.get("location", "").strip()

        if not role or not location:
            return {"error": "Both role and location are required"}, 400

        jobs = fetch_jobs_from_google(role, location)
        return jobs, 200

# Add the namespace to the API
api.add_namespace(ns, path="/jobs")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
