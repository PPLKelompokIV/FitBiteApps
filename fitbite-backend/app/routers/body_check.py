from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(tags=["Body Check & Target Cairan (FIT-47)"])

def hitung_target_cairan_dasar(berat_badan_kg: float) -> int:
    """
    Kalkulasi otomatis target cairan dasar harian:
    Target Cairan Dasar = 35 ml x berat badan (kg)
    """
    if berat_badan_kg <= 0:
        raise ValueError("Berat badan harus lebih besar dari 0 kg.")
    return round(35 * berat_badan_kg)

class BodyCheckData(BaseModel):
    weight: float = Field(..., gt=0, description="Berat badan dalam kg (harus > 0)")
    sleepDuration: float = 0.0
    sleepQuality: str = ""
    energyLevel: int = 0
    plannedIntensity: str = ""

@router.post("/api/body-check")
async def create_body_check(data: BodyCheckData):
    try:
        # Hitung target cairan dasar otomatis berdasarkan berat badan: 35 ml x berat badan (kg)
        water_ml = hitung_target_cairan_dasar(data.weight)
        water_formula = f"35 ml × {data.weight} kg"
        
        print(f"Data diterima: Berat {data.weight}kg, Target Cairan Dasar: {water_ml}ml ({water_formula})")
        
        hasil_kalkulasi = {
            "calories": 1700,
            "protein": 100,
            "carbs": 190,
            "fat": 60,
            "bmr": 1319,
            "tdee": 2000,
            "water_ml": water_ml,
            "water_formula": water_formula
        }
        
        return {
            "success": True, 
            "message": "Body check berhasil disimpan",
            "overview": hasil_kalkulasi
        }
        
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/api/body-check/target-cairan/{weight}")
async def get_target_cairan(weight: float):
    """
    Helper endpoint untuk menghitung target cairan dasar langsung dari parameter berat badan.
    """
    try:
        water_ml = hitung_target_cairan_dasar(weight)
        return {
            "success": True,
            "weight": weight,
            "water_ml": water_ml,
            "water_formula": f"35 ml × {weight} kg"
        }
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
