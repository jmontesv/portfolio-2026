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
    "https://portfolio-2026-phi-swart.vercel.app"
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

    token = os.getenv("GITHUB_TOKEN")
    repo  = os.getenv("GITHUB_REPO")

    if not token or not repo:
        return jsonify({"error": "GitHub no configurado"}), 500

    import json, base64, requests as req

    api_url = f"https://api.github.com/repos/{repo}/contents/data/cv.json"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }

    # Obtener el SHA actual del archivo (necesario para actualizarlo)
    get_res = req.get(api_url, headers=headers)
    sha = get_res.json().get("sha")

    content = base64.b64encode(
        json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
    ).decode("utf-8")

    payload = {
        "message": f"cv: actualización v{data.get('meta', {}).get('version', '?')}",
        "content": content,
        "sha": sha
    }

    put_res = req.put(api_url, headers=headers, json=payload)

    if put_res.status_code in (200, 201):
        return jsonify({"ok": True}), 200
    else:
        return jsonify({"error": put_res.json()}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
