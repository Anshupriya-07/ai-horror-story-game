from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
import json
import os
import random

load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY not found in backend/.env")

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = "llama-3.3-70b-versatile"

FALLBACK_STORIES = [
    {
        "story": "A whisper echoes behind you... The door slowly opens by itself.",
        "choices": ["Enter the room", "Hide", "Run"],
    },
    {
        "story": "Your flashlight flickers... A shadow moves across the wall.",
        "choices": ["Follow it", "Stay still", "Call out"],
    },
    {
        "story": "A cold hand touches your shoulder... but nobody is there.",
        "choices": ["Turn around", "Scream", "Close your eyes"],
    },
    {
        "story": "The floorboards creak above you... something is walking.",
        "choices": ["Go upstairs", "Hide downstairs", "Leave the house"],
    },
]


@app.route("/")
def home():
    return "Backend Running"


@app.route("/generate-story", methods=["POST"])
def generate_story():
    data = request.get_json(silent=True) or {}
    previous_story = data.get("story", "")
    user_choice = data.get("choice", "")

    prompt = f"""
You are an AI horror game narrator.

Continue the horror story based on the player's choice.

RULES:
- Write 8-12 short cinematic lines
- Describe sounds, shadows, surroundings and atmosphere
- Build suspense gradually
- Continue logically from previous events
- Make every player choice affect the story
- Keep each line short for readability
- End on a cliffhanger
- Create immersion before action
- Add pauses using ...
- Make it feel like a horror GAME

Previous story:
{previous_story}

Player choice:
{user_choice}

IMPORTANT:
Return ONLY a valid JSON object.
Do not wrap JSON in markdown.
Do not use ```json.
Do not include line breaks inside JSON values.
Escape quotes correctly.
Return a single-line JSON object.

Format:
{{
  "story": "short horror scene",
  "choices": [
    "choice 1",
    "choice 2",
    "choice 3"
  ]
}}
"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        text = (response.choices[0].message.content or "").strip()
        text = (
            text.removeprefix("```json")
            .removeprefix("```")
            .removesuffix("```")
            .strip()
        )

        print("RAW RESPONSE:")
        print(text)

        try:
            story_data = json.loads(text)
        except Exception as e:
            print("JSON PARSE ERROR:", e)
            print("RAW RESPONSE:", text)
            return jsonify(random.choice(FALLBACK_STORIES))

        if "story" not in story_data or "choices" not in story_data:
            return jsonify(random.choice(FALLBACK_STORIES))

        return jsonify(
            {
                "story": story_data["story"],
                "choices": story_data["choices"],
            }
        )

    except Exception as e:
        print("API ERROR:", e)
        return jsonify(random.choice(FALLBACK_STORIES))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
