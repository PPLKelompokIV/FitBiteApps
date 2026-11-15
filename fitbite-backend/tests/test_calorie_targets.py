import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models.calorie_target import CalorieTarget
from app.routers.calorie_targets import router
from app.services.calorie_calculator import (
    hitungMifflinBMR,
    hitungSasaranKalori,
    hitungTDEEDinamis,
)
from app.services.calorie_target_schema import ensure_calorie_target_schema


def test_hitung_mifflin_bmr_for_female_profile():
    assert hitungMifflinBMR(28, "perempuan", 160, 64) == 1339.0


def test_hitung_tdee_uses_selected_activity_factor():
    assert hitungTDEEDinamis(1339.0, "ringan") == 1841.1


def test_hitung_sasaran_kalori_applies_weight_loss_deficit():
    assert hitungSasaranKalori(1841.1, "perempuan") == 1560


@pytest.mark.parametrize(
    ("tdee", "jenis_kelamin", "expected"),
    [
        (1111.8, "perempuan", 1200),
        (1311.0, "laki-laki", 1500),
    ],
)
def test_hitung_sasaran_kalori_enforces_gender_specific_minimum(
    tdee, jenis_kelamin, expected
):
    assert hitungSasaranKalori(tdee, jenis_kelamin) == expected


@pytest.fixture
def calorie_target_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    Base.metadata.create_all(bind=engine)

    app = FastAPI()
    app.include_router(router)

    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client, testing_session_local
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


def test_calculate_and_save_calorie_target(calorie_target_client):
    client, session_factory = calorie_target_client
    response = client.post(
        "/api/calorie-targets",
        json={
            "id_user": 7,
            "usia": 28,
            "jenis_kelamin": "perempuan",
            "tinggi_cm": 160,
            "berat_kg": 64,
            "tingkat_aktivitas": "ringan",
        },
    )

    assert response.status_code == 201
    data = response.json()["data"]
    assert data["bmr_kcal_per_hari"] == 1339.0
    assert data["tdee_kcal_per_hari"] == 1841.1
    assert data["sasaran_kalori_kcal_per_hari"] == 1560

    with session_factory() as db:
        saved = db.query(CalorieTarget).filter(CalorieTarget.id_user == 7).one()
        assert saved.bmr_kcal_per_hari == 1339.0
        assert saved.tdee_kcal_per_hari == 1841.1
        assert saved.sasaran_kalori_kcal_per_hari == 1560

    latest = client.get("/api/calorie-targets/7")
    assert latest.status_code == 200
    assert latest.json()["data"]["id_calorie_target"] == data["id_calorie_target"]


def test_calorie_target_rejects_invalid_profile(calorie_target_client):
    client, _ = calorie_target_client
    response = client.post(
        "/api/calorie-targets",
        json={
            "id_user": 7,
            "usia": 28,
            "jenis_kelamin": "perempuan",
            "tinggi_cm": 0,
            "berat_kg": 64,
            "tingkat_aktivitas": "ringan",
        },
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    ("profile", "expected_missing"),
    [
        (
            {},
            [
                "usia",
                "jenis kelamin",
                "tinggi badan",
                "berat badan",
                "tingkat aktivitas",
            ],
        ),
        (
            {
                "usia": 28,
                "jenis_kelamin": "perempuan",
                "tinggi_cm": 160,
                "berat_kg": "",
                "tingkat_aktivitas": "ringan",
            },
            ["berat badan"],
        ),
    ],
)
def test_incomplete_profile_returns_warning_without_saving(
    calorie_target_client, profile, expected_missing
):
    client, session_factory = calorie_target_client
    response = client.post(
        "/api/calorie-targets",
        json={"id_user": 7, **profile},
    )

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert detail["code"] == "PROFILE_INCOMPLETE"
    assert "Profil fisik belum lengkap" in detail["message"]
    assert detail["missing_fields"] == expected_missing

    with session_factory() as db:
        assert db.query(CalorieTarget).filter(CalorieTarget.id_user == 7).count() == 0


def test_get_calorie_target_returns_not_found_when_missing(calorie_target_client):
    client, _ = calorie_target_client
    response = client.get("/api/calorie-targets/404")
    assert response.status_code == 404


def test_hitung_mifflin_bmr_rejects_invalid_measurement():
    with pytest.raises(ValueError):
        hitungMifflinBMR(28, "perempuan", 0, 64)


def test_schema_migration_adds_and_backfills_calorie_target():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    with engine.begin() as connection:
        connection.exec_driver_sql(
            "CREATE TABLE calorie_targets ("
            "id_calorie_target INTEGER PRIMARY KEY, "
            "jenis_kelamin VARCHAR(20) NOT NULL, "
            "tdee_kcal_per_hari FLOAT NOT NULL)"
        )
        connection.exec_driver_sql(
            "INSERT INTO calorie_targets "
            "(id_calorie_target, jenis_kelamin, tdee_kcal_per_hari) "
            "VALUES (1, 'perempuan', 1841.1)"
        )

    ensure_calorie_target_schema(engine)
    with engine.connect() as connection:
        target = connection.exec_driver_sql(
            "SELECT sasaran_kalori_kcal_per_hari FROM calorie_targets WHERE id_calorie_target = 1"
        ).scalar_one()

    assert target == 1560
    engine.dispose()
