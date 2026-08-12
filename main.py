from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime
import os

app = FastAPI(title="FHIR Patient Risk Analyzer")

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FHIR_SERVER_URL = "http://hapi.fhir.org/baseR4"

def calculate_risk(birth_date: str) -> str:
    if not birth_date: return "Unknown"
    try:
        birth_year = datetime.strptime(birth_date, "%Y-%m-%d").year
        current_year = datetime.now().year
        age = current_year - birth_year
        if age > 65: return "High"
        elif age > 40: return "Moderate"
        return "Low"
    except ValueError: return "Unknown"

@app.get("/api/v1/patients/risk-assessment")
def get_patient_risk():
    try:
        response = requests.get(f"{FHIR_SERVER_URL}/Patient?_count=10", timeout=5)
        response.raise_for_status()
        fhir_data = response.json()
        processed_patients = []
        
        for entry in fhir_data.get("entry", []):
            resource = entry.get("resource", {})
            patient_id = resource.get("id", "N/A")
            gender = resource.get("gender", "Unknown")
            birth_date = resource.get("birthDate", "")
            
            full_name = "Unknown"
            if resource.get("name"):
                given = resource.get("name")[0].get("given", [""])[0]
                family = resource.get("name")[0].get("family", "")
                full_name = f"{given} {family}".strip()
            
            risk_level = calculate_risk(birth_date)
            
            processed_patients.append({
                "id": patient_id,
                "name": full_name,
                "gender": gender,
                "birth_date": birth_date if birth_date else "N/A",
                "risk_level": risk_level
            })
        return {"status": "success", "data": processed_patients}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"FHIR server error: {str(e)}")