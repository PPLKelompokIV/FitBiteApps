from sqlalchemy import Engine, inspect, text


def ensure_calorie_target_schema(engine: Engine) -> None:
    inspector = inspect(engine)
    if not inspector.has_table("calorie_targets"):
        return

    columns = {column["name"] for column in inspector.get_columns("calorie_targets")}
    if "sasaran_kalori_kcal_per_hari" in columns:
        return

    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE calorie_targets "
                "ADD COLUMN sasaran_kalori_kcal_per_hari FLOAT NOT NULL DEFAULT 0"
            )
        )
        connection.execute(
            text(
                "UPDATE calorie_targets "
                "SET sasaran_kalori_kcal_per_hari = CASE "
                "WHEN jenis_kelamin = 'perempuan' THEN "
                "CASE WHEN ROUND(tdee_kcal_per_hari * 0.85 / 10.0) * 10 < 1200 "
                "THEN 1200 ELSE ROUND(tdee_kcal_per_hari * 0.85 / 10.0) * 10 END "
                "ELSE CASE WHEN ROUND(tdee_kcal_per_hari * 0.85 / 10.0) * 10 < 1500 "
                "THEN 1500 ELSE ROUND(tdee_kcal_per_hari * 0.85 / 10.0) * 10 END "
                "END"
            )
        )
