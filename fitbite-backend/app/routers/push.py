import json
from typing import Any, Dict, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.web_push import (
    VAPID_PUBLIC_KEY,
    kirimWebPush,
    resolve_user_record,
)

router = APIRouter(prefix="/api/push", tags=["Web Push Notification (FIT-172 / FIT-174)"])


class PushSubscriptionRequest(BaseModel):
    id_user: Union[int, str] = 1
    email: Optional[str] = None
    subscription: Dict[str, Any]


@router.get("/vapid-public-key")
def get_vapid_public_key():
    """Mengembalikan VAPID Public Key agar frontend React dapat mendaftarkan PushManager."""
    if not VAPID_PUBLIC_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="VAPID_PUBLIC_KEY belum diatur di file .env backend.",
        )
    return {"status": "success", "public_key": VAPID_PUBLIC_KEY}


@router.post("/subscribe", status_code=status.HTTP_200_OK)
def save_push_subscription(
    payload: PushSubscriptionRequest, db: Session = Depends(get_db)
):
    """Menyimpan objek langganan Web Push (JSON) ke kolom push_subscription di tabel users."""
    user_row = resolve_user_record(db, payload.id_user, payload.email)
    if not user_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pengguna tidak ditemukan di tabel users.",
        )

    resolved_uid = user_row[0]
    db.execute(
        text(
            "UPDATE users SET push_subscription = CAST(:sub AS JSONB) WHERE CAST(id_user AS TEXT) = :uid;"
        ),
        {
            "sub": json.dumps(payload.subscription),
            "uid": resolved_uid,
        },
    )
    db.commit()

    return {
        "status": "success",
        "id_user": resolved_uid,
        "message": "Langganan Web Push berhasil disimpan ke profil pengguna.",
    }


@router.post("/test/{id_user}", status_code=status.HTTP_200_OK)
def send_test_web_push(id_user: str, db: Session = Depends(get_db)):
    """Endpoint bantu untuk langsung menguji pengiriman kirimWebPush() via VAPID."""
    user_row = resolve_user_record(db, id_user)
    if not user_row or not user_row[1]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pengguna belum mendaftarkan izin Web Push (push_subscription kosong).",
        )

    subscription_data = (
        json.loads(user_row[1]) if isinstance(user_row[1], str) else user_row[1]
    )
    res = kirimWebPush(
        subscription_info=subscription_data,
        title="Tes Pengingat FitBite",
        body="Web Push VAPID aktif! Notifikasi tetap masuk meski tab sedang ditutup.",
        url="/jurnal-makanan",
        kategori="makan_siang",
    )

    if not res.get("sent"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gagal mengirim Web Push: {res.get('reason')}",
        )

    return {"status": "success", "message": "Notifikasi Web Push berhasil dikirim."}