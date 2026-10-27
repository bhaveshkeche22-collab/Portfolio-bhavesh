
import os

from flask import Blueprint, jsonify, request
from google import genai

ai_bp = Blueprint("ai_assistant", __name__)

SYSTEM_INSTRUCTION = """
You are Bhavesh AI, the portfolio assistant for Bhavesh Keche.

Answer questions about Bhavesh's skills, projects, experience,
education, and portfolio in a friendly, professional manner.

Use only the verified information supplied in the portfolio context.
Do not invent achievements, qualifications, project results, or experience.
If you do not know an answer, say so honestly and direct the visitor
to the relevant portfolio section.

Keep answers concise and useful to recruiters.
"""

PORTFOLIO_CONTEXT = """
Name: Bhavesh Keche

Technical skills:
Python, Java, SQL, Flask, FastAPI, machine learning, NLP, RAG,
Pandas, NumPy, scikit-learn, Matplotlib, Seaborn, Power BI, Tableau.

Projects:
1. AI Resume Analyzer
   Resume parsing, ATS scoring, job-description comparison,
   and AI-powered recommendations.
   GitHub: https://github.com/bhaveshkeche22-collab/smart_ai_resume_analyser
   Demo: https://ai-resume-analyzer-p5sw.onrender.com

2. AI Voice Agent
   GitHub: https://github.com/bhaveshkeche22-collab/AI_VOICE_AGENT
   Demo: https://ai-voice-agent-f4bn.onrender.com

3. Text Emotion Detection
   GitHub: https://github.com/bhaveshkeche22-collab/EMOTION_BASE_ON_TEXT
   Demo: https://emotion-base-on-text-1.onrender.com

4. Analytics Dashboard
   GitHub: https://github.com/bhaveshkeche22-collab/Dashboard
   Demo: https://dashboard-70c8.onrender.com

5. Credit Risk Prediction
   GitHub: https://github.com/bhaveshkeche22-collab/Credit-risk-prediction
   Demo: https://credit-risk-prediction-846l.onrender.com

6. NYC House Type Prediction
   GitHub: https://github.com/bhaveshkeche22-collab/NYC_HOUSE_TYPE
   Demo: https://nyc-house-type-1.onrender.com

7. Mental Health Score Prediction
   GitHub: https://github.com/bhaveshkeche22-collab/Mental_healthScore_prediction
   Demo: https://mental-healthscore-prediction-1.onrender.com

8. Movie Recommendation
   GitHub: https://github.com/bhaveshkeche22-collab/movie

Experience listed in the portfolio:
- Data Science virtual internship with Altair/EduSkills.
- Java Full Stack internship program.
- Full Stack PHP Development virtual internship.

Use the portfolio's Experience and Resume sections for further details.
"""


@ai_bp.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    question = data.get("message", "")

    if not isinstance(question, str) or not question.strip():
        return jsonify({"error": "Please enter a question."}), 400

    if len(question) > 1000:
        return jsonify({"error": "Your question is too long."}), 400

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return jsonify({
            "error": "AI service is not configured. Check the server's .env file."
        }), 503

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=(
                "Portfolio information:\n"
                + PORTFOLIO_CONTEXT
                + "\n\nVisitor question:\n"
                + question.strip()
            ),
            config={
                "system_instruction": SYSTEM_INSTRUCTION,
                "temperature": 0.4,
                "max_output_tokens": 500,
            },
        )

        answer = response.text

        if not answer:
            return jsonify({
                "error": "The AI returned an empty response. Please try again."
            }), 502

        return jsonify({"reply": answer})

    except Exception:
        # Keep API keys and provider error details out of public responses.
        ai_bp.logger.exception("AI assistant request failed")
        return jsonify({
            "error": "The AI service is temporarily unavailable. Please try again."
        }), 502
