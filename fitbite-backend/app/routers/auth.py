import base64
import datetime
import hashlib
import hmac
import json
import os
import re
import uuid
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import psycopg2

router = APIRouter(prefix="/api/auth", tags=["Authentication & 4A Security (FIT-61)"])

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"


class RegisterRequest(BaseModel):
    nama: str = Field(min_length=3, max_length=100)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)
    remember_me: bool = False


# Akun demo cadangan (Resilience Fallback jika server DB sedang restart)
FALLBACK_USERS = {
    "admin@fitbite.com": {
        "id_user": "11111111-1111-1111-1111-111111111111",
        "nama": "Administrator FitBite",
        "email": "admin@fitbite.com",
        "password": "Admin123!",
        "role": "admin",
        "status_akun": "active",
    },
    "budi@fitbite.com": {
        "id_user": "22222222-2222-2222-2222-222222222222",
        "nama": "Budi Santoso",
        "email": "budi@fitbite.com",
        "password": "Budi123!",
        "role": "user",
        "status_akun": "active",
    },
    "siti@fitbite.com": {
        "id_user": "33333333-3333-3333-3333-333333333333",
        "nama": "Siti Rahma",
        "email": "siti@fitbite.com",
        "password": "Siti123!",
        "role": "user",
        "status_akun": "active",
    },
    "nadia.putri@email.com": {
        "id_user": "44444444-4444-4444-4444-444444444444",
        "nama": "Nadia Putri",
        "email": "nadia.putri@email.com",
        "password": "Nadia123!",
        "role": "user",
        "status_akun": "active",
    },
}


def get_pg_connection():
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        try:
            return psycopg2.connect(db_url, connect_timeout=3)
        except Exception:
            pass
    try:
        return psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            dbname=os.getenv("DB_NAME", "fitbite_db"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "102042400109"),
            connect_timeout=3,
        )
    except Exception:
        return None


def create_access_token(user_data: dict, expires_in_minutes: int = 1440) -> str:
    secret = os.getenv("JWT_SECRET_KEY", "fitbite_super_secret_jwt_encryption_key_2026_kelompok4")
    header = {"alg": "HS256", "typ": "JWT"}
    now_ts = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
    payload = {
        "sub": str(user_data["id_user"]),
        "email": user_data["email"],
        "nama": user_data["nama"],
        "role": user_data["role"],
        "iat": now_ts,
        "exp": now_ts + (expires_in_minutes * 60),
    }
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig = hmac.new(secret.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_access_token(token: str) -> dict | None:
    try:
        secret = os.getenv("JWT_SECRET_KEY", "fitbite_super_secret_jwt_encryption_key_2026_kelompok4")
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        sig = hmac.new(secret.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "==="))
        now_ts = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
        if payload.get("exp", 0) < now_ts:
            return None
        return payload
    except Exception:
        return None


@router.post("/register")
def register_user(payload: RegisterRequest):
    """
    Pendaftaran Akun Baru (4A: Administration & Authentication)
    """
    email_clean = payload.email.strip().lower()
    if not re.match(EMAIL_REGEX, email_clean):
        raise HTTPException(status_code=400, detail="Format email tidak valid.")

    nama_clean = payload.nama.strip()
    if len(nama_clean) < 3:
        raise HTTPException(status_code=400, detail="Nama lengkap minimal 3 karakter.")

    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Kata sandi harus minimal 8 karakter.")

    conn = get_pg_connection()
    user_data = None

    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id_user FROM users WHERE LOWER(email) = %s;", (email_clean,))
            if cur.fetchone():
                cur.close()
                conn.close()
                raise HTTPException(
                    status_code=400,
                    detail="Email sudah terdaftar. Silakan gunakan email lain atau langsung masuk."
                )

            cur.execute("""
                INSERT INTO users (nama, email, password_hash, role, status_akun)
                VALUES (%s, %s, crypt(%s, gen_salt('bf')), 'user', 'active')
                RETURNING id_user, nama, email, role, status_akun, created_at;
            """, (nama_clean, email_clean, payload.password))
            row = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()

            user_data = {
                "id_user": str(row[0]),
                "nama": row[1],
                "email": row[2],
                "role": row[3],
                "status_akun": row[4],
                "created_at": str(row[5]),
            }
        except HTTPException:
            raise
        except Exception as e:
            if conn:
                conn.close()
            print(f"[WARN] Register DB error, falling back to in-memory: {e}")

    if not user_data:
        if email_clean in FALLBACK_USERS:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar.")
        new_id = str(uuid.uuid4())
        user_data = {
            "id_user": new_id,
            "nama": nama_clean,
            "email": email_clean,
            "role": "user",
            "status_akun": "active",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        FALLBACK_USERS[email_clean] = {
            **user_data,
            "password": payload.password,
        }

    token = create_access_token(user_data, expires_in_minutes=1440)
    audit = {
        "session_id": str(uuid.uuid4()),
        "registered_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    return {
        "status": "success",
        "message": "Pendaftaran akun berhasil. Selamat datang di FitBite!",
        "token": token,
        "user": user_data,
        "redirect_url": "/bodycheckpagi",
        "audit": audit,
    }


@router.post("/login")
def login_user(payload: LoginRequest):
    """
    Login & Otentikasi Pengguna (4A: Authentication, Authorization, Accountability)
    """
    email_clean = payload.email.strip().lower()
    password_input = payload.password

    user_data = None
    conn = get_pg_connection()

    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT id_user, nama, email, role, status_akun
                FROM users
                WHERE LOWER(email) = %s AND password_hash = crypt(%s, password_hash);
            """, (email_clean, password_input))
            row = cur.fetchone()
            cur.close()
            conn.close()

            if row:
                user_data = {
                    "id_user": str(row[0]),
                    "nama": row[1],
                    "email": row[2],
                    "role": row[3],
                    "status_akun": row[4],
                }
        except Exception as e:
            if conn:
                conn.close()
            print(f"[WARN] Auth DB query error: {e}")

    if not user_data and email_clean in FALLBACK_USERS:
        f_user = FALLBACK_USERS[email_clean]
        if f_user["password"] == password_input:
            user_data = {
                "id_user": f_user["id_user"],
                "nama": f_user["nama"],
                "email": f_user["email"],
                "role": f_user["role"],
                "status_akun": f_user["status_akun"],
            }

    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Email atau kata sandi tidak sesuai. Silakan periksa kembali."
        )

    if user_data.get("status_akun") != "active":
        raise HTTPException(
            status_code=403,
            detail="Akun Anda sedang dinonaktifkan. Hubungi administrator."
        )

    redirect_url = "/admin/pantau" if user_data["role"] == "admin" else "/bodycheckpagi"

    audit = {
        "session_id": str(uuid.uuid4()),
        "login_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    expire_min = 1440 * 7 if payload.remember_me else 1440
    token = create_access_token(user_data, expires_in_minutes=expire_min)

    return {
        "status": "success",
        "message": f"Selamat datang kembali, {user_data['nama']}!",
        "token": token,
        "user": user_data,
        "redirect_url": redirect_url,
        "audit": audit,
    }


@router.get("/me")
def get_current_user_profile(token: str | None = None):
    """
    Verifikasi Sesi Pengguna Aktif (4A: Authentication & Authorization Guard)
    """
    if not token:
        raise HTTPException(status_code=401, detail="Token otentikasi tidak ditemukan.")

    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Sesi telah kedaluwarsa. Silakan masuk kembali.")

    return {
        "status": "success",
        "user": {
            "id_user": payload.get("sub"),
            "email": payload.get("email"),
            "nama": payload.get("nama"),
            "role": payload.get("role"),
        }
    }
