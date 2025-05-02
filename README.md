# 🧠 SPARK – Fake Job Detection System

SPARK is an AI-driven web application designed to **detect fraudulent job postings** and provide **genuine job recommendations** along with **personalized career roadmaps**. It uses **BERT Transformers** for job classification and integrates with the **Gemini API** and **Google Jobs API** to enhance user experience and job safety.

---

## 🚀 Features

- 🔍 **Fake Job Detection** using BERT Transformer (NLP)
- 🤖 **Roadmap Generation** via Gemini (Google's LLM)
- ✅ **Genuine Job Recommendations** using Google Jobs API
- 🖥️ **Modern UI** built with Next.js, TypeScript, and Material UI
- 🔒 Protects users from scams and guides them toward safe career opportunities

---

## 🧰 Tech Stack

| Layer         | Technologies Used                              |
|---------------|-------------------------------------------------|
| **Frontend**  | Next.js, TypeScript, Material UI                |
| **Backend**   | Python (FastAPI or Flask), REST APIs            |
| **Model**     | BERT (HuggingFace Transformers)                 |
| **AI APIs**   | Gemini API (for roadmap), Google Jobs API       |
| **Dataset**   | Kaggle - Fake Job Postings Dataset              |

---

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16+)
- Python 3.8+
- pip / virtualenv
- API keys (Gemini, Google Jobs)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

---

## 🧠 Model Training (Optional)

- Use the Kaggle Fake Job Postings Dataset
- Preprocess job descriptions
- Fine-tune BERT using Hugging Face's `transformers` and `datasets` libraries

---

## 📈 Accuracy

Achieved **98% accuracy** in classifying fake vs. genuine job posts during testing.

---

## 🧪 Testing

- Manual test cases with real/fake job examples
- Unit tests for model and API endpoints

**Sample Inputs:**

- **Fake:** “Work from home & earn ₹30,000 weekly! Registration fee ₹999.”
- **Genuine:** “Software Engineer – Python Developer at Infosys, Bangalore”

---

## 📊 Architecture Diagram

![image](https://github.com/user-attachments/assets/b4a282cc-20cf-4541-a662-d74dc4b5297b)


---

## 🔮 Future Enhancements

- Add resume-based job detection
- Create browser plugin for real-time job detection
- Integrate with more job platforms (LinkedIn, Naukri)
- Implement user feedback loop to retrain model

---

## 🤝 Contributors

**
- Madhumithra Shree E S
- Priyanka S
**

---

## 📸 Screenshots

![image](https://github.com/user-attachments/assets/37ac012d-43b7-4ca6-8abd-134216fba38d)
![image](https://github.com/user-attachments/assets/32c98ef1-3e14-4bcf-be36-1352158f4f5d)
![image](https://github.com/user-attachments/assets/c4498dc2-9f64-42d2-8716-b8e7f40be541)
![image](https://github.com/user-attachments/assets/eb915736-ab02-4a7b-99eb-9e3ef6598722)

---

## 🌐 Links

- 🧠 [Kaggle Dataset](https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction)
- ✨ [Gemini API](https://ai.google.dev/)
- 📢 [Google Jobs API](https://developers.google.com/maps/documentation/jobs)
