from flask import Flask, request, jsonify
import joblib
import numpy as np
from datetime import datetime
import traceback

app = Flask(__name__)

# Load trained models
model_failure = joblib.load("models/failure_model.pkl")
model_rul = joblib.load("models/rul_model.pkl")
model_dep = joblib.load("models/depreciation_model.pkl")
model_cost = joblib.load("models/cost_model.pkl")


def preprocess_input(data):
    current_year = datetime.now().year

    purchase_year = data["purchase_year"]
    purchase_cost = data["purchase_cost"]
    scrap_value = data["scrap_value"]
    useful_life = data["useful_life"]
    breakdown_frequency = data["breakdown_frequency"]
    total_maintenance_cost = data["total_maintenance_cost"]

    usage_frequency_map = {"Low": 1, "Medium": 2, "High": 3}
    usage_frequency = usage_frequency_map.get(data["usage_frequency"], 1)

    asset_age = current_year - purchase_year
    maintenance_ratio = total_maintenance_cost / purchase_cost
    remaining_life = max(0, useful_life - asset_age)
    annual_depreciation = (purchase_cost - scrap_value) / useful_life
    current_book_value = max(
    scrap_value,
    purchase_cost - (annual_depreciation * asset_age)
)

    return {
        "asset_age": asset_age,
        "purchase_cost": purchase_cost,
        "usage_frequency": usage_frequency,
        "breakdown_frequency": breakdown_frequency,
        "maintenance_ratio": maintenance_ratio,
        "remaining_life": remaining_life,
        "current_book_value": current_book_value,
        "total_maintenance_cost": total_maintenance_cost
    }


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print("Incoming data:", data)
        processed = preprocess_input(data)

        # Failure Prediction
        failure_features = np.array([[
            processed["asset_age"],
            processed["purchase_cost"],
            processed["usage_frequency"],
            processed["breakdown_frequency"],
            processed["maintenance_ratio"]
        ]])

        failure_pred = model_failure.predict(failure_features)[0]
        failure_prob = model_failure.predict_proba(failure_features)[0][1]

        # Remaining Useful Life
        rul_features = np.array([[
            processed["asset_age"],
            processed["breakdown_frequency"],
            processed["maintenance_ratio"]
        ]])

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
            "recommendation": recommendation
        })

    except Exception as e:
        traceback.print_exc()
        print("ERROR: " ,e)
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)