from fastapi import FastAPI
from pydantic import BaseModel
import requests
import logging
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
logger = logging.getLogger("uvicorn.error")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],  # Or "*" for dev
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

Only respond with the single urgency classification word. Do not include any other text.
[/INST]
"""

@app.post("/triage")
async def assess_urgency(symptoms: Symptoms):
    try:
        # Build medical prompt
        filled_prompt = MEDICAL_PROMPT.format(
            symptoms=symptoms.text,
            age=symptoms.patient_age
        )
        
        # Get model response
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
        logger.info(f"Raw model response: {response_data['response']}")
        urgency_raw = response_data["response"].strip().lower()
        

        if "urgent" in urgency_raw:
            urgency = "urgent"
        elif "moderate" in urgency_raw:
            urgency = "moderate"
        elif "routine" in urgency_raw:
            urgency = "routine"
        else:
            urgency = "unknown"
        
        # Create explanation based on urgency
        explanations = {
            "urgent": "Seek immediate medical attention. These symptoms may indicate a serious condition.",
            "moderate": "Schedule a doctor visit within 24 hours. These symptoms require professional evaluation.",
            "routine": "Schedule a routine appointment. These symptoms can be monitored but don't require urgent care.",
            "unknown": "Unable to determine urgency. Please provide more details about your symptoms."
        }
        
        return {
            "urgency": urgency,
            "message": explanations[urgency]
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