import pandas as pd
import numpy as np
import os
import joblib
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_absolute_error

os.makedirs("models", exist_ok=True)

# Load dataset
df = pd.read_csv("ml_services/Institution_1000_Assets_Invoice_Calibrated.csv")

print("Dataset Loaded")

# -----------------------------
# Data Cleaning
# -----------------------------

df["Asset Status"] = df["Asset Status"].astype(str).str.strip().str.upper()

df.loc[df["Asset Status"].isin(["Y","YES","ACTIVE","1"]), "Asset Status"] = 1
df.loc[df["Asset Status"].isin(["N","NO","SCRAP","0"]), "Asset Status"] = 0

df["Asset Status"] = df["Asset Status"].astype(float)

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


# ==========================================================
# MODEL 4 : DEPRECIATION
# ==========================================================

X_dep = df[[
    "Asset Age",
    "Purchase Cost",
    "Breakdown Frequency"
]]

y_dep = df["Current Book Value"]

X_train4,X_test4,y_train4,y_test4 = train_test_split(
    X_dep,y_dep,test_size=0.2,random_state=42
)

model_dep = RandomForestRegressor(
    n_estimators=300,
    random_state=42
)

model_dep.fit(X_train4,y_train4)


# ==========================================================
# SAVE MODELS
# ==========================================================

joblib.dump(model_failure,"models/failure_model.pkl")
joblib.dump(model_rul,"models/rul_model.pkl")
joblib.dump(model_dep,"models/depreciation_model.pkl")
joblib.dump(model_cost,"models/cost_model.pkl")

print("Models saved successfully inside models folder")