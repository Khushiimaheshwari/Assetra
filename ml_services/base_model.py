import pandas as pd
import numpy as np
import os
import joblib

from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_absolute_error

# create models folder
os.makedirs("models", exist_ok=True)

# -----------------------------
# Load Dataset
# -----------------------------
df = pd.read_csv("Institution_1000_Assets_Invoice_Calibrated.csv")

print("Dataset Loaded")
print(df.head())


# -----------------------------
# Data Cleaning
# -----------------------------

# clean Asset Status
df["Asset Status"] = df["Asset Status"].astype(str).str.strip().str.upper()

df.loc[df["Asset Status"].isin(["Y","YES","ACTIVE","1"]), "Asset Status"] = 1
df.loc[df["Asset Status"].isin(["N","NO","SCRAP","0"]), "Asset Status"] = 0

df["Asset Status"] = df["Asset Status"].astype(float)

# clean Usage Frequency
df["Usage Frequency"] = df["Usage Frequency"].astype(str).str.strip().str.upper()

df.loc[df["Usage Frequency"]=="LOW","Usage Frequency"] = 1
df.loc[df["Usage Frequency"]=="MEDIUM","Usage Frequency"] = 2
df.loc[df["Usage Frequency"]=="HIGH","Usage Frequency"] = 3

df["Usage Frequency"] = df["Usage Frequency"].astype(float)


# -----------------------------
# Feature Engineering
# -----------------------------

current_year = datetime.now().year

df["Asset Age"] = current_year - df["Purchase Year"]

df["Maintenance Ratio"] = df["Total Maintenance Cost"] / df["Purchase Cost"]

df["Remaining Life"] = df["Useful Life (Years)"] - df["Asset Age"]
df["Remaining Life"] = df["Remaining Life"].clip(lower=0)

df["Annual Depreciation"] = (df["Purchase Cost"] - df["Scrap Value"]) / df["Useful Life (Years)"]

df["Current Book Value"] = df["Purchase Cost"] - (df["Annual Depreciation"] * df["Asset Age"])
df["Current Book Value"] = df["Current Book Value"].clip(lower=df["Scrap Value"])


# ==========================================================
# MODEL 1 : FAILURE PREDICTION
# ==========================================================

X = df[[
    "Asset Age",
    "Purchase Cost",
    "Usage Frequency",
    "Breakdown Frequency",
    "Maintenance Ratio"
]]

y = df["Asset Status"]

X_train,X_test,y_train,y_test = train_test_split(
    X,y,test_size=0.2,random_state=42
)

model_failure = RandomForestClassifier(
    n_estimators=300,
    random_state=42
)

model_failure.fit(X_train,y_train)

pred = model_failure.predict(X_test)

print("Failure Model Accuracy:",accuracy_score(y_test,pred))


# ==========================================================
# MODEL 2 : REMAINING USEFUL LIFE
# ==========================================================

X_rul = df[[
    "Asset Age",
    "Breakdown Frequency",
    "Maintenance Ratio"
]]

y_rul = df["Remaining Life"]

X_train2,X_test2,y_train2,y_test2 = train_test_split(
    X_rul,y_rul,test_size=0.2,random_state=42
)

model_rul = RandomForestRegressor(
    n_estimators=300,
    random_state=42
)

model_rul.fit(X_train2,y_train2)

pred_rul = model_rul.predict(X_test2)

print("RUL MAE:",mean_absolute_error(y_test2,pred_rul))


# ==========================================================
# MODEL 3 : MAINTENANCE COST FORECAST
# ==========================================================

X_cost = df[[
    "Asset Age",
    "Usage Frequency",
    "Breakdown Frequency"
]]

y_cost = df["Total Maintenance Cost"]

X_train3,X_test3,y_train3,y_test3 = train_test_split(
    X_cost,y_cost,test_size=0.2,random_state=42
)

model_cost = RandomForestRegressor(
    n_estimators=300,
    random_state=42
)

model_cost.fit(X_train3,y_train3)

pred_cost = model_cost.predict(X_test3)

print("Maintenance Cost MAE:",mean_absolute_error(y_test3,pred_cost))
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
    remaining_life = useful_life - asset_age
    annual_depreciation = (purchase_cost - scrap_value) / useful_life
    current_book_value = purchase_cost - (annual_depreciation * asset_age)

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


# ==========================================================
# SAVE MODELS
# ==========================================================

joblib.dump(model_failure,"models/failure_model.pkl")
joblib.dump(model_rul,"models/rul_model.pkl")
joblib.dump(model_dep,"models/depreciation_model.pkl")
joblib.dump(model_cost,"models/cost_model.pkl")

print("Models saved successfully inside models/ folder")