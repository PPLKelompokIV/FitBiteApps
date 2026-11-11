from typing import Any, Dict, Optional, Tuple
from fastapi import APIRouter, Request, status  # type: ignore
from fastapi.responses import JSONResponse  # type: ignore

router = APIRouter(prefix="/api/admin/foods", tags=["Pengelolaan Katalog Makanan Admin"])

SUMBER_DEFAULT = "Referensi internal v1 (contoh)"

# In-memory store data katalog makanan (FIT-30 / FIT-31 / FIT-32)
foods = [
    {"id": 1, "nama": "Nasi merah matang", "kategori": "Serealia", "basis": 100, "kkal": 110, "protein": 2.6, "karbo": 23, "lemak": 0.9, "sumber": SUMBER_DEFAULT, "verifikasi": "Terverifikasi", "aktif": True},
    {"id": 2, "nama": "Ayam panggang", "kategori": "Lauk hewani", "basis": 100, "kkal": 183, "protein": 21.7, "karbo": 0, "lemak": 10, "sumber": SUMBER_DEFAULT, "verifikasi": "Terverifikasi", "aktif": True},
    {"id": 3, "nama": "Tempe panggang", "kategori": "Lauk nabati", "basis": 100, "kkal": 193, "protein": 13.3, "karbo": 16, "lemak": 6.7, "sumber": SUMBER_DEFAULT, "verifikasi": "Terverifikasi", "aktif": True},
    {"id": 4, "nama": "Tahu kukus", "kategori": "Lauk nabati", "basis": 100, "kkal": 80, "protein": 8, "karbo": 2, "lemak": 4.4, "sumber": SUMBER_DEFAULT, "verifikasi": "Terverifikasi", "aktif": True},
    {"id": 5, "nama": "Pisang", "kategori": "Buah", "basis": 100, "kkal": 90, "protein": 1.1, "karbo": 22, "lemak": 0.3, "sumber": SUMBER_DEFAULT, "verifikasi": "Terverifikasi", "aktif": True},
    {"id": 6, "nama": "Pepaya", "kategori": "Buah", "basis": 100, "kkal": 40, "protein": 0.5, "karbo": 10, "lemak": 0.1, "sumber": SUMBER_DEFAULT, "verifikasi": "Terverifikasi", "aktif": True},
    {"id": 7, "nama": "Yoghurt tawar", "kategori": "Susu & olahan", "basis": 100, "kkal": 60, "protein": 6.7, "karbo": 5, "lemak": 1.5, "sumber": SUMBER_DEFAULT, "verifikasi": "Perlu tinjau", "aktif": True},
]


def validate_positive_nutrition(body: Dict[str, Any]) -> Tuple[bool, Dict[str, str], Dict[str, Any]]:
    """Validasi data gizi positif sesuai aturan bisnis FIT-32."""
    errors: Dict[str, str] = {}

    nama = body.get("nama")
    kategori = body.get("kategori")
    basis = body.get("basis", 100)
    kkal = body.get("kkal")
    protein = body.get("protein")
    karbo = body.get("karbo")
    lemak = body.get("lemak")

    if not nama or not isinstance(nama, str) or not nama.strip():
        errors["nama"] = "Nama makanan wajib diisi"

    if not kategori or not isinstance(kategori, str) or not kategori.strip():
        errors["kategori"] = "Kategori makanan wajib dipilih"

    def parse_number(val: Any) -> Optional[float]:
        if val is None or val == "":
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            return None

    num_basis = parse_number(basis)
    num_kkal = parse_number(kkal)
    num_protein = parse_number(protein)
    num_karbo = parse_number(karbo)
    num_lemak = parse_number(lemak)

    if num_basis is None or num_basis <= 0:
        errors["basis"] = "Basis berat harus bernilai positif (> 0 g)"

    if num_kkal is None or num_kkal <= 0:
        errors["kkal"] = "Energi (kkal) harus bernilai positif (> 0)"

    if num_protein is None or num_protein < 0:
        errors["protein"] = "Protein harus bernilai positif (≥ 0 g)"

    if num_karbo is None or num_karbo < 0:
        errors["karbo"] = "Karbohidrat harus bernilai positif (≥ 0 g)"

    if num_lemak is None or num_lemak < 0:
        errors["lemak"] = "Lemak harus bernilai positif (≥ 0 g)"

    parsed = {
        "numBasis": num_basis,
        "numKkal": num_kkal,
        "numProtein": num_protein,
        "numKarbo": num_karbo,
        "numLemak": num_lemak,
    }

    return (len(errors) == 0, errors, parsed)


@router.get("")
@router.get("/")
def get_all_foods():
    """Mengambil seluruh daftar makanan di katalog admin."""
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "Daftar katalog makanan berhasil diambil",
            "data": foods,
        },
    )


@router.post("")
@router.post("/")
async def create_food(request: Request):
    """Menambah makanan baru ke katalog admin dengan validasi data gizi positif (FIT-31 & FIT-32)."""
    try:
        body: Dict[str, Any] = await request.json()
    except Exception:
        body = {}

    is_valid, errors, parsed = validate_positive_nutrition(body)
    if not is_valid:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "message": "Validasi data gizi gagal: pastikan seluruh nilai gizi bernilai positif",
                "errors": errors,
            },
        )

    nama = str(body.get("nama", "")).strip()

    # Cek keunikan nama makanan (Unique Constraint)
    if any(f["nama"].strip().lower() == nama.lower() for f in foods):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "message": f'Makanan dengan nama "{nama}" sudah ada di katalog.',
                "errors": {"nama": "Makanan dengan nama tersebut sudah ada di katalog"},
            },
        )

    kategori = str(body.get("kategori", "")).strip()
    sumber = str(body.get("sumber", "")).strip() if body.get("sumber") else SUMBER_DEFAULT
    verifikasi = "Terverifikasi" if body.get("verifikasi") == "Terverifikasi" else "Perlu tinjau"

    new_id = max([f["id"] for f in foods], default=0) + 1
    new_food = {
        "id": new_id,
        "nama": nama,
        "kategori": kategori,
        "basis": parsed["numBasis"],
        "kkal": parsed["numKkal"],
        "protein": parsed["numProtein"],
        "karbo": parsed["numKarbo"],
        "lemak": parsed["numLemak"],
        "sumber": sumber,
        "verifikasi": verifikasi,
        "aktif": True,
    }

    foods.append(new_food)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "message": f'Data gizi "{new_food["nama"]}" ({new_food["kkal"]} kkal) berhasil divalidasi dan disimpan ke katalog.',
            "data": new_food,
        },
    )


@router.put("/{food_id}")
async def update_food(food_id: int, request: Request):
    """Memperbarui data makanan atau status aktif/nonaktif (FIT-32)."""
    item = next((f for f in foods if f["id"] == food_id), None)
    if not item:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "Makanan tidak ditemukan"},
        )

    try:
        body: Dict[str, Any] = await request.json()
    except Exception:
        body = {}

    # Jika hanya toggle status aktif/nonaktif
    if list(body.keys()) == ["aktif"] and isinstance(body.get("aktif"), bool):
        item["aktif"] = body["aktif"]
        status_label = "Aktif" if item["aktif"] else "Nonaktif"
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": f'Status "{item["nama"]}" berhasil diubah menjadi {status_label}.',
                "data": item,
            },
        )

    merged = {**item, **body}
    is_valid, errors, parsed = validate_positive_nutrition(merged)
    if not is_valid:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "message": "Validasi data gizi gagal: pastikan seluruh nilai gizi bernilai positif",
                "errors": errors,
            },
        )

    item["nama"] = str(merged.get("nama", "")).strip()
    item["kategori"] = str(merged.get("kategori", "")).strip()
    item["basis"] = parsed["numBasis"]
    item["kkal"] = parsed["numKkal"]
    item["protein"] = parsed["numProtein"]
    item["karbo"] = parsed["numKarbo"]
    item["lemak"] = parsed["numLemak"]
    item["sumber"] = str(merged.get("sumber", "")).strip() or SUMBER_DEFAULT
    item["verifikasi"] = "Terverifikasi" if merged.get("verifikasi") == "Terverifikasi" else "Perlu tinjau"
    if isinstance(body.get("aktif"), bool):
        item["aktif"] = body["aktif"]

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": f'Perubahan data gizi "{item["nama"]}" berhasil divalidasi dan disimpan.',
            "data": item,
        },
    )
