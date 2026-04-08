import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5500", 
    "http://127.0.0.1:5500"
    "https://jmontesv.github.io",
    "https://portfolio-2026.vercel.app"
])

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"


@app.route("/api/chat", methods=["POST"])
def chat():
    if not ANTHROPIC_API_KEY:
        return jsonify({"error": "API key no configurada"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "Body vacío"}), 400

    response = requests.post(
        ANTHROPIC_URL,
        headers={
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        json=data,
        timeout=60,
    )

    return jsonify(response.json()), response.status_code

@app.route("/api/save-cv", methods=["POST"])
def save_cv():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Body vacío"}), 400

    cv_path = os.path.join(os.path.dirname(__file__), "../data/cv.json")

    with open(cv_path, "w", encoding="utf-8") as f:
        import json
        json.dump(data, f, ensure_ascii=False, indent=2)

    return jsonify({"ok": True}), 200


if __name__ == "__main__":
    app.run(port=5000, debug=True)
