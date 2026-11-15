from typing import Any, Dict, Optional, Tuple
from pydantic import BaseModel, Field

SUMBER_DEFAULT = "Referensi internal v1 (contoh)"

class FoodItem(BaseModel):
    id: int
    nama: str
    kategori: str
    basis: float = 100.0
    kkal: float
    protein: float = 0.0
    karbo: float = 0.0
    lemak: float = 0.0
    sumber: str = SUMBER_DEFAULT
    verifikasi: str = "Terverifikasi"
    aktif: bool = True

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

