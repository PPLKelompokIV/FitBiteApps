from app.main import app
from main import app as root_app


def test_root_entrypoint_uses_the_complete_application():
    assert root_app is app


def test_feature_routes_and_swagger_tags_are_registered():
    schema = app.openapi()
    paths = schema["paths"]

    assert "/api/food-logs" in paths
    assert "/api/water-logs" in paths
    assert "/api/reminders/save" in paths
    assert "/api/body-check" in paths
    assert "/api/notifications/{id_user}" in paths
    assert "/api/evaluations/manual-trigger" in paths
    assert "/api/evaluations/scheduler/status" in paths
    assert "/api/evaluations/scheduler/simulate-20-00" in paths

    tags = {
        tag
        for path_item in paths.values()
        for operation in path_item.values()
        if isinstance(operation, dict)
        for tag in operation.get("tags", [])
    }
    assert "Food Log (FIT-33 / FIT-35)" in tags
    assert "default" not in tags
