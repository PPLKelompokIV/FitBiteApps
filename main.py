import base64
import datetime
import json
import os
import re
import uuid
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests

load_dotenv()

ROUTER_API_KEY = os.getenv("ROUTER_API_KEY", "")
ROUTER_BASE_URL = os.getenv("ROUTER_BASE_URL", "http://localhost:20128/v1")
ROUTER_VISION_MODEL = os.getenv("ROUTER_VISION_MODEL", "ag/gemini-3.8-flash-high")

app = FastAPI(title="FitBite AI & Calculation Service")

# Izinkan komunikasi dari Frontend (5173) & Node.js (5000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Service Python FastAPI FitBite Berjalan!"}


class BMRRequest(BaseModel):
    usia: int = Field(gt=0, le=120)
    jenis_kelamin: Literal["laki-laki", "perempuan"]
    tinggi_cm: float = Field(gt=0, le=300)
    berat_kg: float = Field(gt=0, le=500)


def hitung_bmr(
    usia: int,
    jenis_kelamin: Literal["laki-laki", "perempuan"],
    tinggi_cm: float,
    berat_kg: float,
) -> float:
    """Hitung BMR dalam kkal/hari dengan rumus Mifflin-St Jeor."""
    konstanta = 5 if jenis_kelamin == "laki-laki" else -161
    return round((10 * berat_kg) + (6.25 * tinggi_cm) - (5 * usia) + konstanta, 1)


@app.post("/bmr")
def calculate_bmr(data: BMRRequest):
    return {
        "bmr_kcal_per_hari": hitung_bmr(
            usia=data.usia,
            jenis_kelamin=data.jenis_kelamin,
            tinggi_cm=data.tinggi_cm,
            berat_kg=data.berat_kg,
        )
    }


TingkatAktivitas = Literal["sedentari", "ringan", "sedang", "aktif", "sangat_aktif"]

FAKTOR_AKTIVITAS: dict[TingkatAktivitas, float] = {
    "sedentari": 1.2,
    "ringan": 1.375,
    "sedang": 1.55,
    "aktif": 1.725,
    "sangat_aktif": 1.9,
}


class TDEERequest(BaseModel):
    bmr_kcal_per_hari: float = Field(gt=0, le=10000)
    tingkat_aktivitas: TingkatAktivitas


def hitung_tdee(bmr_kcal_per_hari: float, tingkat_aktivitas: TingkatAktivitas) -> float:
    """Hitung TDEE dengan mengalikan BMR dan faktor aktivitas."""
    return round(bmr_kcal_per_hari * FAKTOR_AKTIVITAS[tingkat_aktivitas], 1)


@app.post("/tdee")
def calculate_tdee(data: TDEERequest):
    faktor_aktivitas = FAKTOR_AKTIVITAS[data.tingkat_aktivitas]
    return {
        "bmr_kcal_per_hari": data.bmr_kcal_per_hari,
        "tingkat_aktivitas": data.tingkat_aktivitas,
        "faktor_aktivitas": faktor_aktivitas,
        "tdee_kcal_per_hari": hitung_tdee(
            data.bmr_kcal_per_hari,
            data.tingkat_aktivitas,
        ),
    }


class CalorieTargetAdjustmentRequest(BaseModel):
    tdee_kcal_per_hari: float = Field(gt=0, le=10000)
    skor_kesiapan: float = Field(ge=0, le=100)
    durasi_tidur_jam: float = Field(ge=0, le=24)


SKOR_KESIAPAN_RENDAH = 40
SKOR_KESIAPAN_TINGGI = 80
DURASI_TIDUR_RENDAH_JAM = 6
DURASI_TIDUR_CUKUP_JAM = 7
PENYESUAIAN_KALORI_PERSEN = 5.0


def sesuaikan_target_kalori(
    tdee_kcal_per_hari: float,
    skor_kesiapan: float,
    durasi_tidur_jam: float,
) -> dict[str, float | str]:
    if (
        skor_kesiapan < SKOR_KESIAPAN_RENDAH
        or durasi_tidur_jam < DURASI_TIDUR_RENDAH_JAM
    ):
        penyesuaian_persen = -PENYESUAIAN_KALORI_PERSEN
        alasan = "Kesiapan rendah atau durasi tidur kurang."
    elif (
        skor_kesiapan >= SKOR_KESIAPAN_TINGGI
        and durasi_tidur_jam >= DURASI_TIDUR_CUKUP_JAM
    ):
        penyesuaian_persen = PENYESUAIAN_KALORI_PERSEN
        alasan = "Kesiapan tinggi dan durasi tidur cukup."
    else:
        penyesuaian_persen = 0.0
        alasan = "Tidak ada penyesuaian untuk kondisi ini."

    target_kalori = round(tdee_kcal_per_hari * (1 + penyesuaian_persen / 100), 1)
    return {
        "penyesuaian_persen": penyesuaian_persen,
        "target_kalori_disarankan": target_kalori,
        "alasan": alasan,
    }


@app.post("/calorie-target/adjust")
def adjust_calorie_target(data: CalorieTargetAdjustmentRequest):
    return {
        "tdee_kcal_per_hari": data.tdee_kcal_per_hari,
        "skor_kesiapan": data.skor_kesiapan,
        "durasi_tidur_jam": data.durasi_tidur_jam,
        **sesuaikan_target_kalori(
            tdee_kcal_per_hari=data.tdee_kcal_per_hari,
            skor_kesiapan=data.skor_kesiapan,
            durasi_tidur_jam=data.durasi_tidur_jam,
        ),
    }


def parse_ai_json_response(content: str) -> dict:
    cleaned = content.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        raise ValueError("Model AI tidak mengembalikan format JSON yang valid.")


@app.post("/api/ai/food-snap")
async def analyze_food_snap(file: UploadFile = File(...)):
    """Menerima unggahan foto makanan dan mengembalikan estimasi komponen nutrisi dari 9Router."""
    if not ROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ROUTER_API_KEY belum dikonfigurasi di file .env server.",
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Berkas yang diunggah harus berupa gambar (JPG, PNG, atau WebP).",
        )

    try:
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Berkas gambar kosong.")

        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        mime_type = file.content_type or "image/jpeg"
        data_url = f"data:{mime_type};base64,{b64_image}"

        prompt = (
            "Analisis gambar makanan atau piring hidangan ini. "
            "Identifikasi komponen makanan/minuman yang terlihat, perkirakan porsinya, "
            "jumlah kalori (kkal), serta makronutrien (protein, karbohidrat, dan lemak dalam gram). "
            "Format respons HARUS berupa JSON valid tanpa teks pengantar dan tanpa markdown ```json. "
            "Gunakan format persis berikut:\n"
            "{\n"
            '  "items": [\n'
            "    {\n"
            '      "name": "Nama makanan",\n'
            '      "detail": "Keterangan porsi atau olahan",\n'
            '      "portion": "100 g",\n'
            '      "calories": "150",\n'
            '      "nutrients": ["10", "20", "5"]\n'
            "    }\n"
            "  ]\n"
            "}\n"
            "PENTING: Nilai dalam nutrients adalah urutan [protein, karbohidrat, lemak] dalam gram (hanya angka numerik/desimal dalam string). "
            "Gunakan Bahasa Indonesia untuk nama dan detail makanan."
        )

        payload = {
            "model": ROUTER_VISION_MODEL,
            "stream": False,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
            "temperature": 0.1,
        }

        response = requests.post(
            f"{ROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {ROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=45,
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Layanan 9Router merespons dengan status {response.status_code}: {response.text}",
            )

        resp_json = response.json()
        ai_content = resp_json["choices"][0]["message"]["content"]
        parsed_data = parse_ai_json_response(ai_content)
        raw_items = parsed_data.get("items", [])

        formatted_items = []
        for i, item in enumerate(raw_items):
            nutrients = item.get("nutrients", ["0", "0", "0"])
            while len(nutrients) < 3:
                nutrients.append("0")
            nutrients = [str(nutrients[0]), str(nutrients[1]), str(nutrients[2])]

            formatted_items.append({
                "id": str(uuid.uuid4())[:8],
                "name": str(item.get("name", f"Komponen {i+1}")),
                "detail": str(item.get("detail", "Hasil estimasi AI")),
                "portion": str(item.get("portion", "1 porsi")),
                "calories": str(item.get("calories", "0")),
                "nutrients": nutrients,
            })

        return {
            "success": True,
            "filename": file.filename,
            "model_used": ROUTER_VISION_MODEL,
            "items": formatted_items,
        }

    except HTTPException:
        raise
    except requests.exceptions.RequestException as re_err:
        raise HTTPException(
            status_code=503,
            detail=f"Gagal menghubungi server 9Router: {str(re_err)}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan saat memproses gambar: {str(exc)}",
        )


# In-memory store untuk data log makanan (sebelum migrasi skema PostgreSQL)
DEFAULT_MEAL_SLOTS = [
    {
        "name": "Sarapan",
        "time": "07.30 WIB",
        "calories": "350 kkal",
        "items": [
            {"name": "Oat matang", "detail": "1 mangkuk • 200 g", "calories": "200"},
            {"name": "Pisang", "detail": "1 buah kecil • 100 g", "calories": "90"},
            {"name": "Yoghurt tawar", "detail": "100 g", "calories": "60"},
        ],
        "macros": "Protein 20 g  ·  Karbo 50 g  ·  Lemak 8 g",
        "protein_g": 20.0,
        "karbo_g": 50.0,
        "lemak_g": 8.0,
        "calories_num": 350.0,
    },
    {
        "name": "Makan siang",
        "time": "12.30 WIB",
        "calories": "600 kkal",
        "items": [
            {"name": "Nasi merah", "detail": "150 g", "calories": "165"},
            {"name": "Ayam panggang", "detail": "120 g", "calories": "220"},
            {"name": "Tempe panggang", "detail": "75 g", "calories": "145"},
            {"name": "Sayur bening", "detail": "1 mangkuk • 150 g", "calories": "70"},
        ],
        "macros": "Protein 42 g  ·  Karbo 65 g  ·  Lemak 19 g",
        "protein_g": 42.0,
        "karbo_g": 65.0,
        "lemak_g": 19.0,
        "calories_num": 600.0,
    },
    {
        "name": "Makan malam",
        "time": "18.00 WIB",
        "calories": "250 kkal",
        "items": [
            {"name": "Sup sayur", "detail": "1 mangkuk • 250 g", "calories": "170"},
            {"name": "Tahu kukus", "detail": "100 g", "calories": "80"},
        ],
        "macros": "Protein 18 g  ·  Karbo 15 g  ·  Lemak 13 g",
        "protein_g": 18.0,
        "karbo_g": 15.0,
        "lemak_g": 13.0,
        "calories_num": 250.0,
    },
    {
        "name": "Camilan",
        "time": "15.00 WIB",
        "calories": "150 kkal",
        "items": [
            {"name": "Pepaya", "detail": "150 g", "calories": "60"},
            {"name": "Yoghurt tawar", "detail": "150 g", "calories": "90"},
        ],
        "macros": "Protein 10 g  ·  Karbo 20 g  ·  Lemak 3 g",
        "protein_g": 10.0,
        "karbo_g": 20.0,
        "lemak_g": 3.0,
        "calories_num": 150.0,
    },
]

# Key: date_string (YYYY-MM-DD), Value: dict of meal_slots { "Makan siang": slot_data, ... }
meal_logs_db: dict[str, dict[str, dict]] = {}


class MealItemInput(BaseModel):
    id: str | None = None
    name: str = Field(min_length=1)
    detail: str = ""
    portion: str = ""
    calories: float | str = 0
    nutrients: list[float | str] = Field(default_factory=list)


class MealLogRequest(BaseModel):
    date: str
    meal_slot: Literal["Sarapan", "Makan siang", "Makan malam", "Camilan"]
    time: str = ""
    method: Literal["foto_ai", "katalog", "barcode", "quick_add", "manual"] = "foto_ai"
    items: list[MealItemInput]
    macros: str | None = None


@app.post("/api/meals/log")
def save_meal_log(payload: MealLogRequest):
    """Menyimpan atau memperbarui log makanan pada slot tertentu untuk tanggal tertentu."""
    date_key = payload.date
    if date_key not in meal_logs_db:
        meal_logs_db[date_key] = {}

    total_calories = 0.0
    total_p = 0.0
    total_k = 0.0
    total_l = 0.0

    items_list = []
    for it in payload.items:
        try:
            cal = max(0.0, float(str(it.calories).replace(",", ".")))
        except (ValueError, TypeError):
            cal = 0.0
        total_calories += cal

        p, k, l_val = 0.0, 0.0, 0.0
        if len(it.nutrients) >= 3:
            try:
                p = max(0.0, float(str(it.nutrients[0]).replace(",", ".")))
            except (ValueError, TypeError):
                p = 0.0
            try:
                k = max(0.0, float(str(it.nutrients[1]).replace(",", ".")))
            except (ValueError, TypeError):
                k = 0.0
            try:
                l_val = max(0.0, float(str(it.nutrients[2]).replace(",", ".")))
            except (ValueError, TypeError):
                l_val = 0.0
        total_p += p
        total_k += k
        total_l += l_val

        detail_text = it.detail
        if it.portion and it.portion not in it.detail:
            detail_text = f"{it.portion} • {it.detail}" if it.detail else it.portion

        items_list.append({
            "name": it.name,
            "detail": detail_text,
            "calories": str(int(round(cal))) if cal.is_integer() else f"{cal:.1f}",
        })

    if total_p == 0.0 and total_k == 0.0 and total_l == 0.0 and payload.macros:
        macros_str = payload.macros
        m = re.search(r"Protein\s+([-\d.,]+)\s*g.*?Karbo\s+([-\d.,]+)\s*g.*?Lemak\s+([-\d.,]+)\s*g", payload.macros, re.I)
        if m:
            try:
                total_p = max(0.0, float(m.group(1).replace(",", ".")))
                total_k = max(0.0, float(m.group(2).replace(",", ".")))
                total_l = max(0.0, float(m.group(3).replace(",", ".")))
            except Exception:
                pass
        macros_str = f"Protein {int(round(total_p))} g  ·  Karbo {int(round(total_k))} g  ·  Lemak {int(round(total_l))} g"
    else:
        macros_str = f"Protein {int(round(total_p))} g  ·  Karbo {int(round(total_k))} g  ·  Lemak {int(round(total_l))} g"

    slot_data = {
        "name": payload.meal_slot,
        "time": payload.time or "12.00 WIB",
        "calories": f"{int(round(total_calories))} kkal",
        "items": items_list,
        "macros": macros_str,
        "protein_g": round(total_p, 1),
        "karbo_g": round(total_k, 1),
        "lemak_g": round(total_l, 1),
        "calories_num": round(total_calories, 1),
        "method": payload.method,
    }

    meal_logs_db[date_key][payload.meal_slot] = slot_data

    return {
        "success": True,
        "message": f"Log makanan {payload.meal_slot} berhasil disimpan.",
        "date": date_key,
        "data": slot_data,
    }


@app.get("/api/meals/daily")
def get_daily_meals(date: str | None = None):
    """Mengambil seluruh log makanan untuk 4 slot makan pada tanggal tertentu."""
    target_date = date or datetime.date.today().isoformat()

    daily_slots = meal_logs_db.get(target_date, {})

    result_meals = []
    total_cal = 0.0
    total_p = 0.0
    total_k = 0.0
    total_l = 0.0

    for default_slot in DEFAULT_MEAL_SLOTS:
        slot_name = default_slot["name"]
        if slot_name in daily_slots:
            slot = daily_slots[slot_name]
        else:
            slot = default_slot

        result_meals.append({
            "name": slot["name"],
            "time": slot["time"],
            "calories": slot["calories"],
            "items": slot["items"],
            "macros": slot["macros"],
        })
        total_cal += slot.get("calories_num", 0.0)
        total_p += slot.get("protein_g", 0.0)
        total_k += slot.get("karbo_g", 0.0)
        total_l += slot.get("lemak_g", 0.0)

    return {
        "date": target_date,
        "total_calories": round(total_cal, 1),
        "total_protein": round(total_p, 1),
        "total_carb": round(total_k, 1),
        "total_fat": round(total_l, 1),
        "meals": result_meals,
    }

