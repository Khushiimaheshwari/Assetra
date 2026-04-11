from flask import Flask, request, jsonify
import joblib
import numpy as np
import os
from datetime import datetime
from pathlib import Path
import traceback
from base_model import ensure_models

app = Flask(__name__)

ROOT_DIR = Path(__file__).resolve().parent
MODEL_DIR = ROOT_DIR / "model"

# Ensure model files exist before loading.
ensure_models()
model_failure = joblib.load(MODEL_DIR / "failure_model.pkl")
model_rul = joblib.load(MODEL_DIR / "rul_model.pkl")
model_dep = joblib.load(MODEL_DIR / "depreciation_model.pkl")
model_cost = joblib.load(MODEL_DIR / "cost_model.pkl")


def _num(value, default=0.0):
    try:
        if value is None or value == "":
            return float(default)
        return float(value)
    except Exception:
        return float(default)


def preprocess_input(data):
    current_year = datetime.now().year

    purchase_year = int(_num(data.get("purchase_year"), current_year))
    purchase_cost = _num(data.get("purchase_cost"), 0)
    useful_life = max(_num(data.get("useful_life"), 0), 0)
    breakdown_frequency = max(_num(data.get("breakdown_frequency"), 0), 0)
    total_maintenance_cost = max(_num(data.get("total_maintenance_cost"), 0), 0)

    usage_raw = str(data.get("usage_frequency", "Low")).strip().lower()
    usage_frequency_map = {"low": 1, "medium": 2, "high": 3}
    usage_frequency = usage_frequency_map.get(usage_raw, 1)

    asset_age = current_year - purchase_year
    maintenance_ratio = (
        total_maintenance_cost / purchase_cost if purchase_cost > 0 else 0
    )
    remaining_life = max(0, useful_life - asset_age)
    # Do not depend on frontend-provided scrap value; derive a conservative estimate.
    derived_scrap_value = max(0.0, purchase_cost * (remaining_life / useful_life)) if useful_life > 0 else 0.0
    annual_depreciation = (
        (purchase_cost - derived_scrap_value) / useful_life if useful_life > 0 else 0
    )
    current_book_value = max(
        derived_scrap_value,
        purchase_cost - (annual_depreciation * asset_age),
    )
    cost_pressure = (
        total_maintenance_cost / derived_scrap_value if derived_scrap_value > 0 else 0
    )

    return {
        "asset_age": asset_age,
        "purchase_cost": purchase_cost,
        "scrap_value": derived_scrap_value,
        "useful_life": useful_life,
        "usage_frequency": usage_frequency,
        "breakdown_frequency": breakdown_frequency,
        "maintenance_ratio": maintenance_ratio,
        "cost_pressure": cost_pressure,
        "remaining_life": remaining_life,
        "current_book_value": current_book_value,
        "total_maintenance_cost": total_maintenance_cost,
    }


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print("Incoming data:", data)
        processed = preprocess_input(data)

        # Failure Prediction
        failure_features = np.array(
            [[
                processed["asset_age"],
                processed["purchase_cost"],
                processed["usage_frequency"],
                processed["breakdown_frequency"],
                processed["maintenance_ratio"],
                processed["cost_pressure"],
            ]]
        )

        failure_pred = model_failure.predict(failure_features)[0]
        failure_prob = model_failure.predict_proba(failure_features)[0][1]

        # Remaining Useful Life
        rul_features = np.array(
            [[
                processed["asset_age"],
                processed["breakdown_frequency"],
                processed["maintenance_ratio"],
                processed["cost_pressure"],
            ]]
        )

        rul_pred = model_rul.predict(rul_features)[0]

        # Depreciation
        dep_features = np.array([[
            processed["asset_age"],
            processed["purchase_cost"],
            processed["breakdown_frequency"]
        ]])

        dep_pred = model_dep.predict(dep_features)[0]

        # Maintenance Cost Forecast
        cost_features = np.array([[
            processed["asset_age"],
            processed["usage_frequency"],
            processed["breakdown_frequency"]
        ]])

        cost_pred = model_cost.predict(cost_features)[0]

        # Repair or Replace Decision
        recommendation = "Replace" if (
            processed["total_maintenance_cost"] > 0.6 * processed["purchase_cost"]
            or processed["breakdown_frequency"] > 5
            or rul_pred < 1
        ) else "Repair"

        return jsonify({
            "failurePrediction": int(failure_pred),
            "failureProbability": float(failure_prob),
            "remainingLifePrediction": float(rul_pred),
            "depreciationPrediction": float(dep_pred),
            "maintenanceCostPrediction": float(cost_pred),
            "recommendation": recommendation,
            "lastPredictedAt": datetime.utcnow().isoformat() + "Z",
        })

    except Exception as e:
        traceback.print_exc()
        print("ERROR: " ,e)
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    # Default 5000 matches typical PYTHON_AI_SERVICE_URL (e.g. http://127.0.0.1:5000/predict).
    # Override with PORT=5001 if port 5000 is in use (e.g. macOS AirPlay Receiver).
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)