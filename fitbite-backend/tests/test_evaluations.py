from datetime import date

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models.activity_log import ActivityLog
from app.models.daily_evaluation import DailyEvaluation
from app.models.food_log import FoodLog
from app.models.notification import Notification
from app.models.water_log import WaterLog
from app.routers import activity_logs, evaluations


def test_application_entrypoints_expose_integrated_apis():
    import main
    from app.main import app

    paths = app.openapi()["paths"]
    assert main.app is app
    assert "/api/food-logs" in paths
    assert "/api/water-logs/{id_user}" in paths
    assert "/api/activity-logs" in paths
    assert "/api/evaluations/trigger" in paths
    assert "/api/evaluations/scheduler/status" in paths


@pytest.fixture
def api():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    test_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = test_session()
        try:
            yield db
        finally:
            db.close()

    test_app = FastAPI()
    test_app.include_router(activity_logs.router)
    test_app.include_router(evaluations.router)
    test_app.dependency_overrides[get_db] = override_get_db

    with TestClient(test_app) as client:
        yield client, test_session

    engine.dispose()


def test_manual_evaluation_aggregates_saved_logs_and_notifies(api):
    client, test_session = api
    target_date = date(2026, 10, 18)
    with test_session() as db:
        db.add(
            FoodLog(
                id_user=1,
                tanggal=target_date,
                slot_makan="Sarapan",
                metode_input="katalog",
                nama_makanan="Oat",
                kalori=1200,
                protein_g=45,
                karbo_g=130,
                lemak_g=30,
            )
        )
        db.add(
            FoodLog(
                id_user=1,
                tanggal=target_date,
                slot_makan="Camilan",
                metode_input="katalog",
                nama_makanan="Pisang",
                kalori=200,
                protein_g=3,
                karbo_g=50,
                lemak_g=1,
            )
        )
        db.add(
            FoodLog(
                id_user=1,
                tanggal=date(2026, 10, 19),
                slot_makan="Sarapan",
                metode_input="katalog",
                nama_makanan="Log tanggal lain",
                kalori=5000,
                protein_g=500,
                karbo_g=500,
                lemak_g=500,
            )
        )
        db.add(
            WaterLog(
                id_user=1,
                tanggal=target_date,
                waktu="09.00 WIB",
                jumlah_ml=1200,
            )
        )
        db.add(
            WaterLog(
                id_user=1,
                tanggal=target_date,
                waktu="12.00 WIB",
                jumlah_ml=500,
            )
        )
        db.add(
            ActivityLog(
                id_user=1,
                tanggal=target_date,
                nama_aktivitas="Bersepeda",
                durasi_menit=30,
                waktu_mulai="16:00",
                met=6,
                kalori_terbakar=250,
            )
        )
        db.commit()

    response = client.post(
        "/api/evaluations/trigger",
        json={"id_user": 1, "tanggal": target_date.isoformat()},
    )

    assert response.status_code == 200
    payload = response.json()
    evaluation = payload["data"]
    assert evaluation["detail"]["aktual_energi"] == 1400
    assert evaluation["detail"]["kalori_olahraga"] == 250
    assert evaluation["detail"]["target_energi"] == 1950
    assert evaluation["detail"]["aktual_air"] == 1700
    assert evaluation["detail"]["bonus_air_olahraga"] == 400
    assert evaluation["detail"]["jumlah_log_makan"] == 2
    assert evaluation["detail"]["jumlah_log_aktivitas"] == 1
    assert evaluation["detail"]["durasi_olahraga"] == 30
    assert evaluation["detail"]["jumlah_log_air"] == 2
    assert evaluation["ringkasan_tabel"][1]["aktual"] == "48 g"
    assert payload["notifikasi"]["tautan_tujuan"] == "/jurnal-evaluasi"

    with test_session() as db:
        assert db.query(DailyEvaluation).count() == 1
        assert db.query(Notification).count() == 1

    stored = client.get(
        f"/api/evaluations/1/{target_date.isoformat()}"
    )
    assert stored.status_code == 200
    assert stored.json()["data"]["skor_kepatuhan"] == evaluation["skor_kepatuhan"]


def test_manual_evaluation_uses_zero_for_missing_logs(api):
    client, test_session = api
    target_date = date(2026, 10, 19)

    response = client.post(
        "/api/evaluations/manual-trigger",
        json={"id_user": 1, "tanggal": target_date.isoformat()},
    )

    assert response.status_code == 200
    evaluation = response.json()["data"]
    detail = evaluation["detail"]
    assert detail["aktual_energi"] == 0
    assert detail["aktual_air"] == 0
    assert detail["kalori_olahraga"] == 0
    assert detail["jumlah_log_makan"] == 0
    assert detail["jumlah_log_aktivitas"] == 0
    assert detail["jumlah_log_air"] == 0
    assert evaluation["skor_kepatuhan"] == 0
    assert evaluation["status_energi"] == "kurang"

    with test_session() as db:
        stored = db.query(DailyEvaluation).one()
        assert stored.aktual_energi == 0
        assert stored.aktual_protein == 0
        assert stored.aktual_karbo == 0
        assert stored.aktual_lemak == 0


@pytest.mark.parametrize(
    ("actual_energy", "expected_status"),
    [
        (1529, "kurang"),
        (1530, "tercapai"),
        (1870, "tercapai"),
        (1871, "berlebih"),
    ],
)
def test_energy_status_uses_exact_90_and_110_percent_thresholds(
    api, actual_energy, expected_status
):
    client, _ = api
    response = client.post(
        "/api/evaluations/trigger",
        json={
            "id_user": 1,
            "tanggal": "2026-10-21",
            "aktual_energi": actual_energy,
        },
    )

    assert response.status_code == 200
    assert response.json()["data"]["status_energi"] == expected_status


def test_activity_log_can_be_saved_and_counted_by_evaluation(api):
    client, _ = api
    target_date = date(2026, 10, 20)
    create_response = client.post(
        "/api/activity-logs",
        json={
            "id_user": 1,
            "tanggal": target_date.isoformat(),
            "nama_aktivitas": "Bersepeda",
            "durasi_menit": 35,
            "waktu_mulai": "16:30",
            "met": 6,
            "kalori_terbakar": 280,
        },
    )
    assert create_response.status_code == 201

    response = client.post(
        "/api/evaluations/trigger",
        json={"id_user": 1, "tanggal": target_date.isoformat()},
    )

    assert response.status_code == 200
    detail = response.json()["data"]["detail"]
    assert detail["kalori_olahraga"] == 280
    assert detail["jumlah_log_aktivitas"] == 1
    assert detail["durasi_olahraga"] == 35
    assert detail["bonus_air_olahraga"] == 400


def test_scheduler_status_and_simulation_routes_are_available(api):
    client, _ = api

    status_response = client.get("/api/evaluations/scheduler/status")
    assert status_response.status_code == 200
    assert status_response.json()["scheduled_time"] == "20:00"

    simulation_response = client.post(
        "/api/evaluations/scheduler/simulate-20-00?id_user=3"
    )
    assert simulation_response.status_code == 200
    assert simulation_response.json()["data"]["tipe_pemicu"] == "otomatis_20_00"
