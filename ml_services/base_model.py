#!/usr/bin/env python
# coding: utf-8

"""
Train and save AI models into /model folder.

Usage:
  python base_model.py
  python base_model.py --data Institution_1000_Assets_Invoice_Calibrated.csv
"""

from __future__ import annotations

import argparse
from pathlib import Path
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.model_selection import train_test_split


ROOT_DIR = Path(__file__).resolve().parent
MODEL_DIR = ROOT_DIR / "model"


def _resolve_dataset_path(data_arg: str | None) -> Path:
    if data_arg:
        p = Path(data_arg)
        if not p.is_absolute():
            p = ROOT_DIR / p
        if p.exists():
            return p

    candidates = [
        ROOT_DIR / "Institution_1000_Assets_Invoice_Calibrated.csv",
        ROOT_DIR / "Institution_1000_Assets_Invoice_Calibrated.xlsx",
        ROOT_DIR.parent / "Institution_1000_Assets_Invoice_Calibrated.xlsx",
    ]
    for c in candidates:
        if c.exists():
            return c

    raise FileNotFoundError(
        "Dataset not found. Put CSV/XLSX in ml_services or pass --data <path>."
    )


def _read_dataset(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        return pd.read_csv(path)
    if path.suffix.lower() in [".xlsx", ".xls"]:
        return pd.read_excel(path)
    raise ValueError(f"Unsupported dataset format: {path.suffix}")


def train_and_save_models(data_path: Path) -> dict:
    print(f"[base_model] Loading dataset: {data_path}")
    df = _read_dataset(data_path)
    print("[base_model] Initial Shape:", df.shape)

    df["Asset Status"] = df["Asset Status"].astype(str).str.strip().str.upper()
    df["Asset Status"] = df["Asset Status"].replace(
        {"Y": 1, "YES": 1, "ACTIVE": 1, "N": 0, "NO": 0, "SCRAP": 0}
    )

    df["Usage Frequency"] = df["Usage Frequency"].astype(str).str.strip().str.upper()
    df["Usage Frequency"] = df["Usage Frequency"].replace(
        {"LOW": 1, "MEDIUM": 2, "HIGH": 3}
    )

    for col in [
        "Purchase Cost",
        "Total Maintenance Cost",
        "Breakdown Frequency",
        "Useful Life (Years)",
        "Purchase Year",
    ]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    current_year = datetime.now().year
    df["Asset Age"] = current_year - df["Purchase Year"]

    safe_life = df["Useful Life (Years)"].replace(0, np.nan)
    df["Scrap Value"] = df["Purchase Cost"] * (
        (df["Useful Life (Years)"] - df["Asset Age"]) / safe_life
    )
    df["Scrap Value"] = df["Scrap Value"].clip(lower=0)

    safe_purchase = df["Purchase Cost"].replace(0, np.nan)
    safe_scrap = df["Scrap Value"].replace(0, np.nan)
    df["Maintenance Ratio"] = df["Total Maintenance Cost"] / safe_purchase
    df["Cost Pressure"] = df["Total Maintenance Cost"] / safe_scrap

    df["Adjusted Life"] = df["Useful Life (Years)"] - (
        df["Breakdown Frequency"] * 0.5 + df["Maintenance Ratio"] * 2
    )
    df["Adjusted Life"] = df["Adjusted Life"].clip(lower=0)

    df["Failure Label"] = (
        (df["Breakdown Frequency"] > 3) | (df["Adjusted Life"] < 1)
    ).astype(int)

    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
    print("[base_model] Cleaned Shape:", df.shape)

    X_fail = df[
        [
            "Asset Age",
            "Purchase Cost",
            "Usage Frequency",
            "Breakdown Frequency",
            "Maintenance Ratio",
            "Cost Pressure",
        ]
    ]
    y_fail = df["Failure Label"]
    Xf_train, Xf_test, yf_train, yf_test = train_test_split(
        X_fail, y_fail, test_size=0.3, random_state=42
    )

    model_failure = RandomForestClassifier(n_estimators=300, random_state=42)
    model_failure.fit(Xf_train, yf_train)
    fail_acc = accuracy_score(yf_test, model_failure.predict(Xf_test))
    print(f"[base_model] Failure Accuracy: {fail_acc:.4f}")

    X_rul = df[
        ["Asset Age", "Breakdown Frequency", "Maintenance Ratio", "Cost Pressure"]
    ]
    y_rul = df["Adjusted Life"]
    Xr_train, Xr_test, yr_train, yr_test = train_test_split(
        X_rul, y_rul, test_size=0.3, random_state=42
    )
    model_rul = RandomForestRegressor(n_estimators=300, random_state=42)
    model_rul.fit(Xr_train, yr_train)
    rul_mae = mean_absolute_error(yr_test, model_rul.predict(Xr_test))
    print(f"[base_model] RUL MAE: {rul_mae:.4f}")

    X_cost = df[["Asset Age", "Usage Frequency", "Breakdown Frequency"]]
    y_cost = df["Total Maintenance Cost"]
    Xc_train, Xc_test, yc_train, yc_test = train_test_split(
        X_cost, y_cost, test_size=0.3, random_state=42
    )
    model_cost = RandomForestRegressor(n_estimators=300, random_state=42)
    model_cost.fit(Xc_train, yc_train)
    cost_mae = mean_absolute_error(yc_test, model_cost.predict(Xc_test))
    print(f"[base_model] Cost MAE: {cost_mae:.4f}")

    X_dep = df[["Asset Age", "Purchase Cost", "Breakdown Frequency"]]
    y_dep = df["Scrap Value"]
    Xd_train, Xd_test, yd_train, yd_test = train_test_split(
        X_dep, y_dep, test_size=0.3, random_state=42
    )
    model_dep = RandomForestRegressor(n_estimators=300, random_state=42)
    model_dep.fit(Xd_train, yd_train)
    dep_mae = mean_absolute_error(yd_test, model_dep.predict(Xd_test))
    print(f"[base_model] Depreciation MAE: {dep_mae:.4f}")

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model_failure, MODEL_DIR / "failure_model.pkl")
    joblib.dump(model_rul, MODEL_DIR / "rul_model.pkl")
    joblib.dump(model_dep, MODEL_DIR / "depreciation_model.pkl")
    joblib.dump(model_cost, MODEL_DIR / "cost_model.pkl")
    print(f"[base_model] Saved model files in: {MODEL_DIR}")

    return {
        "failure_accuracy": fail_acc,
        "rul_mae": rul_mae,
        "depreciation_mae": dep_mae,
        "cost_mae": cost_mae,
        "model_dir": str(MODEL_DIR),
    }


def ensure_models(data_path: str | None = None) -> dict:
    required = [
        MODEL_DIR / "failure_model.pkl",
        MODEL_DIR / "rul_model.pkl",
        MODEL_DIR / "depreciation_model.pkl",
        MODEL_DIR / "cost_model.pkl",
    ]
    if all(p.exists() for p in required):
        return {"model_dir": str(MODEL_DIR), "already_present": True}

    resolved_data = _resolve_dataset_path(data_path)
    return train_and_save_models(resolved_data)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default=None, help="Path to CSV/XLSX dataset")
    args = parser.parse_args()
    ensure_models(args.data)


if __name__ == "__main__":
    main()
