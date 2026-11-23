import json
import os
import re
from datetime import datetime
from typing import Optional, Union
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from pywebpush import WebPushException, webpush
from sqlalchemy import text

from app.database import SessionLocal, engine
from app.models.notification import Notification
from app.models.reminder import SmartReminder

load_dotenv()

VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "").strip()
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "").strip()
VAPID_CLAIMS_EMAIL = os.getenv("VAPID_CLAIMS_EMAIL", "mailto:admin@fitbite.local").strip()

DEFAULT_DEMO_UUID = "44444444-4444-4444-4444-444444444444"
DEFAULT_DEMO_EMAIL = "nadia.putri@email.com"

WIB = ZoneInfo("Asia/Jakarta")
scheduler = BackgroundScheduler(timezone=WIB)

PUSH_TEMPLATE_MAP = {
    "body_check": {
        "judul": "Waktunya Body Check pagi",
        "pesan": "Mulai hari dengan mengenali kondisi tubuh dan berat badanmu hari ini.",
        "tautan_tujuan": "/body-check-pagi",
    },
    "sarapan": {
        "judul": "Waktunya mencatat sarapan",
        "pesan": "Awali harimu dengan energi cukup. Catat menu sarapanmu di Jurnal makanan.",
        "tautan_tujuan": "/jurnal-makanan",
    },
    "makan_siang": {
        "judul": "Waktunya jeda makan siang",
        "pesan": "Beri jeda, nikmati makan siangmu, lalu catat porsinya agar terpantau.",
        "tautan_tujuan": "/jurnal-makanan",
    },
    "makan_malam": {
        "judul": "Lengkapi jurnal makan malam",
        "pesan": "Catat makan malammu untuk melihat sisa kalori dan keseimbangan nutrisi hari ini.",
        "tautan_tujuan": "/jurnal-makanan",
    },
    "minum_air": {
        "judul": "Saatnya minum segelas air",
        "pesan": "Jaga hidrasi tubuhmu tetap terpenuhi sesuai jadwal pengingat.",
        "tautan_tujuan": "/aktivitas-hidrasi",
    },
    "evaluasi_malam": {
        "judul": "Waktunya evaluasi malam",
        "pesan": "Laporan harianmu sudah siap. Tinjau kembali catatan makan dan hidrasi hari ini.",
        "tautan_tujuan": "/jurnal-evaluasi",
    },
}


def ensure_push_subscription_column():
    """
    Memastikan tabel users (sesuai struktur auth.py) memiliki kolom push_subscription (JSONB)
    dan minimal akun demo Nadia Putri tersedia jika tabel masih kosong.
    """
    with engine.begin() as conn:
        table_exists = conn.execute(
            text("SELECT to_regclass('public.users');")
        ).scalar()

        if not table_exists:
            conn.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        id_user UUID PRIMARY KEY,
                        nama VARCHAR(120) NOT NULL,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        role VARCHAR(30) NOT NULL DEFAULT 'user',
                        status_akun VARCHAR(30) NOT NULL DEFAULT 'active',
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        push_subscription JSONB NULL
                    );
                    """
                )
            )
        else:
            conn.execute(
                text(
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS push_subscription JSONB NULL;"
                )
            )

    # Seed akun demo Nadia Putri jika belum ada di tabel users
    try:
        with engine.begin() as conn:
            existing = conn.execute(
                text(
                    """
                    SELECT 1 FROM users
                    WHERE LOWER(email) = :email
                       OR CAST(id_user AS TEXT) IN ('1', :demo_uuid)
                    LIMIT 1;
                    """
                ),
                {"email": DEFAULT_DEMO_EMAIL, "demo_uuid": DEFAULT_DEMO_UUID},
            ).fetchone()

            if not existing:
                col_type = conn.execute(
                    text(
                        """
                        SELECT data_type FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'users'
                          AND column_name = 'id_user';
                        """
                    )
                ).scalar()

                if col_type == "uuid":
                    conn.execute(
                        text(
                            """
                            INSERT INTO users (id_user, nama, email, password_hash, role, status_akun)
                            VALUES (CAST(:uid AS UUID), 'Nadia Putri', :email, 'demo_nadia_hash', 'user', 'active')
                            ON CONFLICT DO NOTHING;
                            """
                        ),
                        {"uid": DEFAULT_DEMO_UUID, "email": DEFAULT_DEMO_EMAIL},
                    )
                else:
                    conn.execute(
                        text(
                            """
                            INSERT INTO users (nama, email, password_hash, role, status_akun)
                            VALUES ('Nadia Putri', :email, 'demo_nadia_hash', 'user', 'active')
                            ON CONFLICT DO NOTHING;
                            """
                        ),
                        {"email": DEFAULT_DEMO_EMAIL},
                    )
    except Exception as exc:
        print(f"[WebPush] Lewati seed demo user (tabel users sudah terisi/kustom): {exc}")


def resolve_user_record(
    db, id_user: Union[int, str], email: Optional[str] = None
) -> Optional[tuple]:
    """
    Mencari (id_user_text, push_subscription) di tabel users.
    Aman untuk id_user bertipe UUID maupun Integer, serta menjembatani id_user=1 ke akun Nadia Putri.
    """
    uid_str = str(id_user).strip()

    if email:
        row = db.execute(
            text(
                "SELECT CAST(id_user AS TEXT), push_subscription FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1;"
            ),
            {"email": email.strip()},
        ).fetchone()
        if row:
            return row

    if uid_str == "1":
        row = db.execute(
            text(
                """
                SELECT CAST(id_user AS TEXT), push_subscription
                FROM users
                WHERE CAST(id_user AS TEXT) = '1'
                   OR CAST(id_user AS TEXT) = :demo_uuid
                   OR LOWER(email) = :demo_email
                LIMIT 1;
                """
            ),
            {"demo_uuid": DEFAULT_DEMO_UUID, "demo_email": DEFAULT_DEMO_EMAIL},
        ).fetchone()
        if row:
            return row

    row = db.execute(
        text(
            "SELECT CAST(id_user AS TEXT), push_subscription FROM users WHERE CAST(id_user AS TEXT) = :uid LIMIT 1;"
        ),
        {"uid": uid_str},
    ).fetchone()
    if row:
        return row

    # Fallback terakhir: ambil user aktif pertama jika sedang demo dengan id_user=1
    if uid_str == "1":
        return db.execute(
            text(
                "SELECT CAST(id_user AS TEXT), push_subscription FROM users WHERE role = 'user' LIMIT 1;"
            )
        ).fetchone()

    return None


def kirimWebPush(
    subscription_info: dict,
    title: str,
    body: str,
    url: str = "/profil-pengingat",
    kategori: str = "pengingat",
) -> dict:
    """
    FIT-174: Mengirimkan notifikasi Web Push berbasis VAPID ke perangkat pengguna
    menggunakan objek push_subscription (JSON) yang tersimpan di database.
    """
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        return {"sent": False, "reason": "VAPID keys belum dikonfigurasi di .env"}

    if not subscription_info or not isinstance(subscription_info, dict):
        return {"sent": False, "reason": "Data push_subscription kosong atau tidak valid"}

    payload = json.dumps(
        {
            "title": title,
            "body": body,
            "url": url,
            "kategori": kategori,
        }
    )

    try:
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": VAPID_CLAIMS_EMAIL},
            ttl=3600,
        )
        return {"sent": True, "reason": "ok"}
    except WebPushException as exc:
        status_code = exc.response.status_code if exc.response is not None else None
        return {
            "sent": False,
            "expired": status_code in (404, 410),
            "status_code": status_code,
            "reason": str(exc),
        }
    except Exception as exc:
        return {"sent": False, "reason": str(exc)}


def _is_schedule_due(jenis_pengingat: str, waktu_jadwal: str, now_wib: datetime) -> bool:
    """Mencocokkan waktu berjalan (WIB) dengan jadwal jam (HH:MM) atau interval (N jam)."""
    current_hhmm = now_wib.strftime("%H:%M")
    normalized = (waktu_jadwal or "").strip().replace(".", ":")

    if normalized == current_hhmm:
        return True

    if "minum" in (jenis_pengingat or "").lower():
        match = re.match(r"^(\d+)\s*jam$", normalized, re.IGNORECASE)
        if match and now_wib.minute == 0 and 9 <= now_wib.hour <= 21:
            interval_jam = max(1, int(match.group(1)))
            if (now_wib.hour - 9) % interval_jam == 0:
                return True

    return False


def cek_dan_kirim_pengingat_terjadwal():
    """
    Job berkala APScheduler (berjalan setiap menit WIB):
    Membandingkan waktu berjalan dengan jadwal aktif di tabel smart_reminder,
    mengirim pesan Web Push via kirimWebPush(), lalu mencatat riwayat ke tabel notification.
    """
    now_wib = datetime.now(WIB)
    jam_tampil = now_wib.strftime("%H.%M")
    waktu_kirim_str = f"Hari ini • {jam_tampil} WIB"

    db = SessionLocal()
    try:
        active_reminders = (
            db.query(SmartReminder)
            .filter(SmartReminder.status_aktif == True)
            .all()
        )

        for reminder in active_reminders:
            if not _is_schedule_due(
                reminder.jenis_pengingat, reminder.waktu_jadwal, now_wib
            ):
                continue

            existing_notif = (
                db.query(Notification)
                .filter(
                    Notification.id_user == reminder.id_user,
                    Notification.kategori == reminder.jenis_pengingat,
                    Notification.waktu_kirim == waktu_kirim_str,
                )
                .first()
            )
            if existing_notif:
                continue

            template = PUSH_TEMPLATE_MAP.get(
                reminder.jenis_pengingat,
                {
                    "judul": "Pengingat Jadwal FitBite",
                    "pesan": f"Sudah pukul {jam_tampil} WIB, yuk lengkapi catatan harianmu.",
                    "tautan_tujuan": "/profil-pengingat",
                },
            )

            user_row = resolve_user_record(db, reminder.id_user)
            resolved_uid = user_row[0] if user_row else None
            subscription_data = user_row[1] if user_row else None

            if isinstance(subscription_data, str):
                subscription_data = json.loads(subscription_data)

            if subscription_data:
                result = kirimWebPush(
                    subscription_info=subscription_data,
                    title=template["judul"],
                    body=template["pesan"],
                    url=template["tautan_tujuan"],
                    kategori=reminder.jenis_pengingat,
                )
                if result.get("expired") and resolved_uid:
                    db.execute(
                        text(
                            "UPDATE users SET push_subscription = NULL WHERE CAST(id_user AS TEXT) = :uid;"
                        ),
                        {"uid": resolved_uid},
                    )

            # Simpan riwayat ke tabel notification (sekaligus fallback jika izin push ditolak)
            db.add(
                Notification(
                    id_user=reminder.id_user,
                    kategori=reminder.jenis_pengingat,
                    judul=template["judul"],
                    pesan=template["pesan"],
                    waktu_kirim=waktu_kirim_str,
                    tautan_tujuan=template["tautan_tujuan"],
                    sudah_dibaca=False,
                )
            )
            db.commit()
    except Exception as exc:
        db.rollback()
        print(f"[WebPush Scheduler] Error: {exc}")
    finally:
        db.close()


def start_push_scheduler():
    """Menjalankan APScheduler setiap awal menit (detik ke-0) zona waktu WIB."""
    if not scheduler.running:
        scheduler.add_job(
            cek_dan_kirim_pengingat_terjadwal,
            trigger="cron",
            second=0,
            id="fitbite_smart_push_job",
            replace_existing=True,
        )
        scheduler.start()
        print("[WebPush Scheduler] APScheduler aktif (memeriksa jadwal setiap menit WIB).")


def stop_push_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)