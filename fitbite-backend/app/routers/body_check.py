from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class BodyCheckData(BaseModel):
    weight: float
    sleepDuration: float
    sleepQuality: str
    energyLevel: int
    plannedIntensity: str

@router.post("/api/body-check")
async def create_body_check(data: BodyCheckData):
    try:
        print(f"Data diterima: Berat {data.weight}kg, Tidur {data.sleepDuration}jam")
        
        # --- Simulasikan kalkulasi backend (nantinya bisa diganti dengan rumus asli Anda) ---
        hasil_kalkulasi = {
            "calories": 1700,
            "protein": 100,
            "carbs": 190,
            "fat": 60,
            "bmr": 1319,
            "tdee": 2000,
            "water_ml": 2240
        }
        
        return {
            "success": True, 
            "message": "Body check berhasil disimpan",
            "overview": hasil_kalkulasi
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))