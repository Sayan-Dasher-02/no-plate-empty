import os

from flask import Flask, jsonify, request
from flask_cors import CORS

if os.getenv("ML_USE_TRAINED_MODELS", "").lower() == "true":
    try:
        from ml.predict import predict_demand, predict_surplus, recommend_cooking
        MODEL_BACKEND = "trained_models"
    except Exception as import_error:
        predict_demand = None
        predict_surplus = None
        recommend_cooking = None
        MODEL_BACKEND = "local_fallback"
        MODEL_IMPORT_ERROR = str(import_error)
    else:
        MODEL_IMPORT_ERROR = None
else:
    predict_demand = None
    predict_surplus = None
    recommend_cooking = None
    MODEL_BACKEND = "local_fallback"
    MODEL_IMPORT_ERROR = "Set ML_USE_TRAINED_MODELS=true to load trained model files."


app = Flask(__name__)
CORS(app)

REQUIRED_FIELDS = ["day", "weekday", "meal_type", "menu", "hostel"]


@app.get("/health")
def health():
    payload = {
        "status": "ok",
        "service": "ml-analytics",
        "model_backend": MODEL_BACKEND,
    }

    if MODEL_IMPORT_ERROR:
        payload["model_warning"] = "Trained model dependencies unavailable."

    return jsonify(payload)


def _to_numeric_signal(value, named_signals, fallback):
    if isinstance(value, (int, float)):
        return value

    normalized = str(value).strip().lower()

    try:
        return float(normalized)
    except ValueError:
        return named_signals.get(normalized, fallback)


def _clamp(value, minimum, maximum):
    return min(max(value, minimum), maximum)


def get_local_forecast(data):
    weekday = int(
        _clamp(
            round(
                _to_numeric_signal(
                    data["weekday"],
                    {
                        "mon": 0,
                        "monday": 0,
                        "tue": 1,
                        "tuesday": 1,
                        "wed": 2,
                        "wednesday": 2,
                        "thu": 3,
                        "thursday": 3,
                        "fri": 4,
                        "friday": 4,
                        "sat": 5,
                        "saturday": 5,
                        "sun": 6,
                        "sunday": 6,
                    },
                    0,
                ),
            ),
            0,
            6,
        ),
    )
    meal_type = int(
        _to_numeric_signal(
            data["meal_type"],
            {
                "breakfast": 0,
                "lunch": 1,
                "eveningsnacks": 2,
                "evening_snacks": 2,
                "snacks": 2,
                "dinner": 3,
            },
            1,
        ),
    )
    hostel_signal = _to_numeric_signal(data["hostel"], {"a": 0, "b": 1}, 0)
    menu_signal = _to_numeric_signal(data["menu"], {}, 1)
    calendar_day = int(_clamp(round(float(data["day"] or 1)), 1, 31))

    weekday_offsets = [0, 8, 6, 10, 18, 24, 14]
    meal_offsets = [-10, 20, -6, 12]
    menu_variation = ((abs(round(menu_signal)) % 5) - 2) * 4
    month_progression = (calendar_day % 6) * 2

    demand = int(
        _clamp(
            round(
                82
                + weekday_offsets[weekday]
                + (meal_offsets[meal_type] if 0 <= meal_type < len(meal_offsets) else 0)
                + hostel_signal * 10
                + menu_variation
                + month_progression,
            ),
            45,
            220,
        ),
    )
    buffer = 8 + (4 if weekday >= 4 else 0) + (3 if meal_type in [1, 3] else 0)
    cooking = demand + buffer + int(hostel_signal * 2)
    risk_score = (
        cooking
        - demand
        + (5 if weekday >= 5 else 2 if weekday >= 4 else 0)
        + (2 if meal_type in [1, 3] else 0)
        + max(menu_variation, 0)
    )

    return {
        "predicted_demand": demand,
        "recommended_cooking": cooking,
        "surplus_risk": "High" if risk_score >= 18 else "Medium" if risk_score >= 12 else "Low",
    }


@app.route("/analytics", methods=["POST"])
def analytics():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be valid JSON."}), 400

    missing_fields = [field for field in REQUIRED_FIELDS if field not in data]
    if missing_fields:
        return jsonify(
            {
                "error": "Missing required fields.",
                "missing_fields": missing_fields,
            }
        ), 400

    input_data = {
        "day": data["day"],
        "weekday": data["weekday"],
        "meal_type": data["meal_type"],
        "menu": data["menu"],
        "hostel": data["hostel"],
    }

    try:
        if MODEL_BACKEND == "trained_models":
            demand = predict_demand(input_data)
            cooking = recommend_cooking(demand)
            surplus = predict_surplus(input_data)
            return jsonify(
                {
                    "predicted_demand": demand,
                    "recommended_cooking": cooking,
                    "surplus_risk": surplus,
                }
            )

        return jsonify(get_local_forecast(input_data))
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception:
        return jsonify({"error": "Unable to generate analytics."}), 500


if __name__ == "__main__":
    app.run(debug=True)
