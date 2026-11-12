from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# 1. Sesuaikan variabel di model ini dengan Payload dari tab Network frontend
class BodyCheckData(BaseModel):
    weight: float
    sleepDuration: float
    sleepQuality: str
    energyLevel: int
    plannedIntensity: str

# 2. Buat endpoint POST
@router.post("/api/body-check")
async def create_body_check(data: BodyCheckData):
    try:
        # Contoh: print data yang masuk
        print(f"Data diterima: Berat {data.weight}kg, Tidur {data.sleepDuration}jam")
        
        
        return {"success": True, "message": "Body check berhasil disimpan"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
