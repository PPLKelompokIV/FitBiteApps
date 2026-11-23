from datetime import datetime, timezone, timedelta
from typing import Any, Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import FALLBACK_USERS, verify_access_token

router = APIRouter(
    prefix="/api/admin/users",
    tags=["Pemantauan Akun Admin (PBI-24 / FIT-62)"],
)

WIB = timezone(timedelta(hours=7))

BULAN_SINGKAT = [
    "", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
]
BULAN_LENGKAP = [
    "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]


class AdminUserItem(BaseModel):
    """Skema strict metadata akun (NFR-03: tanpa password_hash & data kesehatan pribadi)."""
    id_user: str
    kode_akun: str
    nama: str
    email: str
    role: str
    peran_label: str
    status_akun: str
    status_label: Literal["Aktif", "Nonaktif"]
    created_at: str
    tanggal_dibuat_singkat: str
    tanggal_dibuat_lengkap: str
    akses_terakhir_singkat: str
    akses_terakhir_lengkap: str


class AdminUsersSummary(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    admin_count: int
    regular_user_count: int


class AdminUsersPagination(BaseModel):
    page: int
    limit: int
    total_items: int
    total_pages: int


class AdminUsersListResponse(BaseModel):
    status: str
    read_only: bool
    privacy_notice: str
    summary: AdminUsersSummary
    pagination: AdminUsersPagination
    data: list[AdminUserItem]


class AdminUserDetailResponse(BaseModel):
    status: str
    read_only: bool
    privacy_notice: str
    data: AdminUserItem


class UserStatusUpdateRequest(BaseModel):
    status_akun: Literal["active", "inactive", "suspended"]


class AdminUserStatusUpdateResponse(BaseModel):
    status: str
    message: str
    data: AdminUserItem


def require_admin(
    authorization: str | None = Header(default=None),
    token: str | None = Query(default=None),
) -> dict[str, Any]:
    """
    Proteksi Otorisasi Role Administrator (FIT-64 / 4A Security).
    - 401 jika token tidak ada / tidak valid / kedaluwarsa.
    - 403 jika role pengguna bukan 'admin'.
    """
    raw_token = None
    if authorization and authorization.lower().startswith("bearer "):
        raw_token = authorization[7:].strip()
    elif token:
        raw_token = token.strip()

    if not raw_token:
        raise HTTPException(
            status_code=401,
            detail="Autentikasi diperlukan. Silakan masuk sebagai Administrator.",
        )

    payload = verify_access_token(raw_token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
        )

    if str(payload.get("role", "")).lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Akses ditolak: Halaman khusus Administrator.",
        )

    return payload


def _parse_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value.astimezone(WIB) if value.tzinfo else value.replace(tzinfo=WIB)
    if isinstance(value, str) and value.strip():
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed.astimezone(WIB) if parsed.tzinfo else parsed.replace(tzinfo=WIB)
        except ValueError:
            pass
    return datetime.now(WIB)


def _format_tanggal_singkat(dt: datetime) -> str:
    return f"{dt.day} {BULAN_SINGKAT[dt.month]} {dt.year}"


def _format_tanggal_lengkap(dt: datetime) -> str:
    return f"{dt.day} {BULAN_LENGKAP[dt.month]} {dt.year}"


def _format_akses_singkat(dt: datetime) -> str:
    return f"{dt.day} {BULAN_SINGKAT[dt.month]}, {dt.hour:02d}.{dt.minute:02d}"


def _format_akses_lengkap(dt: datetime) -> str:
    return f"{dt.day} {BULAN_LENGKAP[dt.month]} {dt.year}, {dt.hour:02d}.{dt.minute:02d} WIB"


def _normalize_status_label(status_akun: str | None) -> Literal["Aktif", "Nonaktif"]:
    return "Aktif" if str(status_akun or "active").lower() == "active" else "Nonaktif"


def _build_user_item(row: dict[str, Any], index_number: int) -> AdminUserItem:
    created_dt = _parse_datetime(row.get("created_at"))
    updated_dt = _parse_datetime(row.get("updated_at") or row.get("created_at"))
    role_raw = str(row.get("role") or "user").lower()
    status_raw = str(row.get("status_akun") or "active").lower()

    return AdminUserItem(
        id_user=str(row["id_user"]),
        kode_akun=f"FB-U-{index_number:04d}",
        nama=str(row["nama"]),
        email=str(row["email"]),
        role=role_raw,
        peran_label="Administrator" if role_raw == "admin" else "Pengguna",
        status_akun=status_raw,
        status_label=_normalize_status_label(status_raw),
        created_at=created_dt.isoformat(),
        tanggal_dibuat_singkat=_format_tanggal_singkat(created_dt),
        tanggal_dibuat_lengkap=_format_tanggal_lengkap(created_dt),
        akses_terakhir_singkat=_format_akses_singkat(updated_dt),
        akses_terakhir_lengkap=_format_akses_lengkap(updated_dt),
    )


def _fetch_all_safe_users(db: Session) -> list[AdminUserItem]:
    """
    Membaca hanya kolom metadata akun dari tabel users (NFR-03).
    Secara eksplisit TIDAK menyertakan password_hash, push_subscription,
    maupun kolom/tabel kesehatan pribadi pengguna.
    """
    raw_rows: list[dict[str, Any]] = []
    try:
        has_updated_at = db.execute(
            text(
                """
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'users'
                  AND column_name = 'updated_at'
                LIMIT 1;
                """
            )
        ).first()

        if has_updated_at:
            query = text(
                """
                SELECT
                    CAST(id_user AS TEXT) AS id_user,
                    nama,
                    email,
                    role,
                    status_akun,
                    created_at,
                    updated_at
                FROM users
                ORDER BY created_at ASC, email ASC;
                """
            )
        else:
            query = text(
                """
                SELECT
                    CAST(id_user AS TEXT) AS id_user,
                    nama,
                    email,
                    role,
                    status_akun,
                    created_at,
                    created_at AS updated_at
                FROM users
                ORDER BY created_at ASC, email ASC;
                """
            )

        rows = db.execute(query).mappings().all()
        raw_rows = [dict(r) for r in rows]
    except Exception as exc:
        print(f"[WARN] Admin users DB fallback: {exc}")
        raw_rows = []

    if not raw_rows:
        for f_user in FALLBACK_USERS.values():
            raw_rows.append(
                {
                    "id_user": f_user["id_user"],
                    "nama": f_user["nama"],
                    "email": f_user["email"],
                    "role": f_user["role"],
                    "status_akun": f_user["status_akun"],
                    "created_at": datetime.now(WIB),
                    "updated_at": datetime.now(WIB),
                }
            )

    return [_build_user_item(row, idx) for idx, row in enumerate(raw_rows, start=1)]


@router.get("", response_model=AdminUsersListResponse)
@router.get("/", response_model=AdminUsersListResponse)
def get_admin_users(
    search: str = Query(default="", max_length=100, description="Cari nama, email, atau ID akun"),
    status: str = Query(default="all", description="Filter status: all, active/Aktif, inactive/Nonaktif"),
    page: int = Query(default=1, ge=1, description="Nomor halaman (batas bawah: 1)"),
    limit: int = Query(default=10, ge=1, le=50, description="Jumlah item per halaman (1–50)"),
    db: Session = Depends(get_db),
    _admin: dict[str, Any] = Depends(require_admin),
):
    """
    FIT-64: Mengambil daftar dan ringkasan akun pengguna khusus Administrator.
    Memfilter keluar seluruh data kesehatan pribadi sesuai NFR-03.
    """
    all_users = _fetch_all_safe_users(db)

    total_users = len(all_users)
    active_users = sum(1 for u in all_users if u.status_label == "Aktif")
    inactive_users = total_users - active_users
    admin_count = sum(1 for u in all_users if u.role == "admin")
    regular_user_count = total_users - admin_count

    normalized_query = search.strip().lower()
    normalized_status = status.strip().lower()

    filtered = all_users
    if normalized_query:
        filtered = [
            u
            for u in filtered
            if normalized_query in u.nama.lower()
            or normalized_query in u.email.lower()
            or normalized_query in u.kode_akun.lower()
            or normalized_query in u.id_user.lower()
        ]

    if normalized_status in ("active", "aktif"):
        filtered = [u for u in filtered if u.status_label == "Aktif"]
    elif normalized_status in ("inactive", "nonaktif", "suspended"):
        filtered = [u for u in filtered if u.status_label == "Nonaktif"]

    total_items = len(filtered)
    total_pages = max(1, (total_items + limit - 1) // limit)
    start_idx = (page - 1) * limit
    paged_items = filtered[start_idx : start_idx + limit]

    return AdminUsersListResponse(
        status="success",
        read_only=True,
        privacy_notice="Hanya metadata akun dasar (NFR-03). Data kesehatan pribadi dan jurnal pengguna tidak dapat diakses oleh Administrator.",
        summary=AdminUsersSummary(
            total_users=total_users,
            active_users=active_users,
            inactive_users=inactive_users,
            admin_count=admin_count,
            regular_user_count=regular_user_count,
        ),
        pagination=AdminUsersPagination(
            page=page,
            limit=limit,
            total_items=total_items,
            total_pages=total_pages,
        ),
        data=paged_items,
    )


@router.get("/{user_identifier}", response_model=AdminUserDetailResponse)
def get_admin_user_detail(
    user_identifier: str,
    db: Session = Depends(get_db),
    _admin: dict[str, Any] = Depends(require_admin),
):
    """
    FIT-64 & FIT-65: Mengambil detail ringkasan status 1 akun untuk modal ringkasan.
    Menerima id_user (UUID) maupun kode_akun (misal FB-U-0001).
    """
    all_users = _fetch_all_safe_users(db)
    target = user_identifier.strip().lower()
    found = next(
        (
            u
            for u in all_users
            if u.id_user.lower() == target or u.kode_akun.lower() == target
        ),
        None,
    )
    if not found:
        raise HTTPException(
            status_code=404,
            detail="Akun pengguna tidak ditemukan.",
        )

    return AdminUserDetailResponse(
        status="success",
        read_only=True,
        privacy_notice="Ringkasan hanya memuat metadata akun dasar (NFR-03), tanpa profil kesehatan atau log pribadi pengguna.",
        data=found,
    )


@router.patch("/{user_identifier}/status", response_model=AdminUserStatusUpdateResponse)
def update_admin_user_status(
    user_identifier: str,
    payload: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    admin: dict[str, Any] = Depends(require_admin),
):
    """
    TC-PBI24-004: Menonaktifkan (inactive/suspended) atau mengaktifkan kembali (active)
    akun pengguna biasa khusus oleh Administrator.
    Tetap mematuhi isolasi privasi NFR-03 (hanya mengubah status_akun).
    """
    all_users = _fetch_all_safe_users(db)
    target = user_identifier.strip().lower()
    found = next(
        (
            u
            for u in all_users
            if u.id_user.lower() == target or u.kode_akun.lower() == target
        ),
        None,
    )
    if not found:
        raise HTTPException(status_code=404, detail="Akun pengguna tidak ditemukan.")

    if found.id_user == str(admin.get("sub")) or found.role == "admin":
        raise HTTPException(
            status_code=400,
            detail="Akun Administrator tidak dapat dinonaktifkan.",
        )

    new_status = payload.status_akun

    try:
        has_updated_at = db.execute(
            text(
                """
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'users'
                  AND column_name = 'updated_at'
                LIMIT 1;
                """
            )
        ).first()

        if has_updated_at:
            db.execute(
                text(
                    """
                    UPDATE users
                    SET status_akun = :status_akun,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE CAST(id_user AS TEXT) = :uid;
                    """
                ),
                {"status_akun": new_status, "uid": found.id_user},
            )
        else:
            db.execute(
                text(
                    """
                    UPDATE users
                    SET status_akun = :status_akun
                    WHERE CAST(id_user AS TEXT) = :uid;
                    """
                ),
                {"status_akun": new_status, "uid": found.id_user},
            )
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Gagal memperbarui status akun di database: {exc}",
        )

    email_key = found.email.strip().lower()
    if email_key in FALLBACK_USERS:
        FALLBACK_USERS[email_key]["status_akun"] = new_status

    updated_list = _fetch_all_safe_users(db)
    updated_item = next(
        (u for u in updated_list if u.id_user == found.id_user),
        found.model_copy(
            update={
                "status_akun": new_status,
                "status_label": _normalize_status_label(new_status),
            }
        ),
    )

    msg = (
        f"Akun {updated_item.nama} berhasil diaktifkan kembali."
        if new_status == "active"
        else f"Akun {updated_item.nama} berhasil dinonaktifkan."
    )

    return AdminUserStatusUpdateResponse(
        status="success",
        message=msg,
        data=updated_item,
    )