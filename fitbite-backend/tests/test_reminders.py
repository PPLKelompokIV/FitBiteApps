import pytest
from app.schemas.reminder import ReminderItemSchema

def test_accepts_a_valid_clock_time_and_active_status():
    item = ReminderItemSchema(
        jenis_pengingat="Body Check pagi",
        waktu_jadwal="06:30",
        status_aktif=True
    )
    assert item.waktu_jadwal == "06:30"
    assert item.status_aktif is True

def test_accepts_a_supported_reminder_interval():
    item = ReminderItemSchema(
        jenis_pengingat="Minum air",
        waktu_jadwal="2 jam",
        status_aktif=True
    )
    assert item.waktu_jadwal == "2 jam"

def test_rejects_invalid_time_format():
    with pytest.raises(ValueError):
        ReminderItemSchema(
            jenis_pengingat="Sarapan",
            waktu_jadwal="25:99",
            status_aktif=True
        )