import os
import json
import logging
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


async def score_session_risk(session_data: dict) -> dict:
    default_response = {
        "risk_score": 10,
        "risk_level": "LOW",
        "flags": [],
        "recommendation": "allow"
    }

    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return default_response

        client = genai.Client(api_key=api_key)

        prompt = f"""Evaluate the risk of this session and return a JSON object with EXACTLY this structure:
{{
  "risk_score": int (0-100),
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "flags": ["list of concerns"],
  "recommendation": "allow|review|block"
}}

Session Data:
{json.dumps(session_data, indent=2)}
"""

        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            ),
        )

        try:
            result = json.loads(response.text)
            if "risk_score" in result and "risk_level" in result:
                return result
        except json.JSONDecodeError:
            pass

    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")

    return default_response
