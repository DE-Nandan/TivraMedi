from fastapi import FastAPI
from pydantic import BaseModel
import requests
import logging
import re
from difflib import SequenceMatcher
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
logger = logging.getLogger("uvicorn.error")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Symptoms(BaseModel):
    text: str
    patient_age: int = 30

MEDICAL_PROMPT = """
[INST] You are a medical triage assistant. Classify the urgency of the patient's symptoms into one of these categories:
- urgent: Requires immediate medical attention (e.g., chest pain, difficulty breathing)
- moderate: Should see a doctor within 24 hours (e.g., high fever, severe pain)
- routine: Can wait for a regular appointment (e.g., cold symptoms, minor rash)

Patient description: {symptoms}
Patient age: {age}

Only respond with the single urgency classification word. Do not include any other text or thinking process. If not able to figure anything respond unknown.
[/INST]
"""

VALID_CATEGORIES = {"urgent", "moderate", "routine"}

def normalize_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_urgency(raw_response):
    """Extract urgency classification from raw response"""
    # Clean the response by removing <think> tags and their content
    cleaned_response = re.sub(r'<think>.*?</think>', '', raw_response, flags=re.DOTALL)
    
    # Also remove any remaining HTML-like tags
    cleaned_response = re.sub(r'<[^>]+>', '', cleaned_response)
    
    # First, try to find exact match in the cleaned response
    for category in VALID_CATEGORIES:
        if re.search(rf'\b{category}\b', cleaned_response, re.IGNORECASE):
            return category
    
    # If not found, try normalized matching
    normalized = normalize_text(cleaned_response)
    
    # 1. Check for exact match
    if normalized in VALID_CATEGORIES:
        return normalized
    
    # 2. Check for token match
    tokens = set(normalized.split())
    matches = tokens & VALID_CATEGORIES
    if matches:
        if "urgent" in matches:
            return "urgent"
        elif "moderate" in matches:
            return "moderate"
        return "routine"
    
    # 3. Fuzzy matching as fallback
    best_match = None
    best_score = 0.0
    for category in VALID_CATEGORIES:
        score = SequenceMatcher(None, normalized, category).ratio()
        if score > best_score:
            best_score = score
            best_match = category
    
    return best_match if best_score > 0.7 else "unknown"

@app.post("/triage")
async def assess_urgency(symptoms: Symptoms):
    try:
        filled_prompt = MEDICAL_PROMPT.format(
            symptoms=symptoms.text,
            age=symptoms.patient_age
        )
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "deepseek-r1:1.5b",
                "prompt": filled_prompt,
                "stream": False
            }
        )
  
        response.raise_for_status()
        response_data = response.json()
        logger.info(response_data)
        raw_response = response_data["response"]
        logger.info(f"Raw model response: {raw_response}")
        
        # Clean the response before processing
        cleaned_response = re.sub(r'<think>.*?</think>', '', raw_response, flags=re.DOTALL)
        cleaned_response = re.sub(r'<[^>]+>', '', cleaned_response).strip()
        
        logger.info(f"Cleaned response is here: {cleaned_response}")
        
        # Extract urgency from the cleaned response
        urgency = extract_urgency(cleaned_response)
        logger.info(f"Extracted urgency: {urgency}")
        
        explanations = {
            "urgent": "Seek immediate medical attention. These symptoms may indicate a serious condition.",
            "moderate": "Schedule a doctor visit within 24 hours. These symptoms require professional evaluation.",
            "routine": "Schedule a routine appointment. These symptoms can be monitored but don't require urgent care.",
            "unknown": "Unable to determine urgency. Please provide more details about your symptoms.",
            "error": "Medical triage service is currently unavailable"
        }
        
        return {
            "urgency": urgency,
            "message": explanations.get(urgency, explanations["unknown"])
        }
    
    except Exception as e:
        logger.error(f"Ollama request failed: {str(e)}")
        return {
            "urgency": "error",
            "message": "Medical triage service is currently unavailable"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)