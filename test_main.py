from fastapi.testclient import TestClient
from main import app, calculate_risk

client = TestClient(app)

def test_calculate_risk():
    assert calculate_risk("1950-01-01") == "High"
    assert calculate_risk("1990-01-01") == "Low"
    assert calculate_risk("") == "Unknown"

def test_api_endpoint():
    response = client.get("/api/v1/patients/risk-assessment")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)