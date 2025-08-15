import sqlite3
import pandas as pd
import os
from datetime import datetime
import json
import schedule
import time

DB_PATH = 'clima.db'
BACKUP_DIR = 'backups'
LOG_DIR = 'logs'

os.makedirs(BACKUP_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

def extract():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM ciudades", conn)
    conn.close()
    return df

def transform(df):
    original_count = len(df)
    df = df.dropna()
    df = df[df['temperatura'].between(-60, 60)]
    df = df[df['sensacion_termica'].between(-80, 80)]
    df['nombre'] = df['nombre'].str.strip().str.title()
    df['descripcion'] = df['descripcion'].str.strip().str.capitalize()
    df['fecha_registro'] = pd.to_datetime(df['fecha_registro'], errors='coerce')
    df = df.dropna(subset=['fecha_registro'])
    df['fecha_registro'] = df['fecha_registro'].dt.strftime('%Y-%m-%d %H:%M:%S')
    cleaned_count = len(df)
    return df, original_count, original_count - cleaned_count

def load(df):
    conn = sqlite3.connect(DB_PATH)
    df.to_sql("ciudades_cleaned", conn, if_exists="replace", index=False)
    conn.close()

def backup(df_raw, df_cleaned, timestamp):
    raw_path = f"{BACKUP_DIR}/raw_{timestamp}.csv"
    clean_path = f"{BACKUP_DIR}/cleaned_{timestamp}.csv"
    df_raw.to_csv(raw_path, index=False)
    df_cleaned.to_csv(clean_path, index=False)
    return raw_path, clean_path

def log_metrics(timestamp, read_count, cleaned_count, raw_path, clean_path):
    log_data = {
        "timestamp": timestamp,
        "records_read": read_count,
        "records_cleaned": cleaned_count,
        "raw_csv": raw_path,
        "cleaned_csv": clean_path
    }
    log_file = f"{LOG_DIR}/log_{timestamp}.json"
    with open(log_file, "w") as f:
        json.dump(log_data, f, indent=4)
    return log_data

def run_pipeline():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    df_raw = extract()
    df_cleaned, read_count, cleaned_count = transform(df_raw.copy())
    load(df_cleaned)
    raw_path, clean_path = backup(df_raw, df_cleaned, timestamp)
    log_data = log_metrics(timestamp, read_count, cleaned_count, raw_path, clean_path)
    return log_data

if __name__ == "__main__":

    schedule.every(10).minutes.do(run_pipeline)  # Se ejecuta cada 10 minutos

    print("Pipeline programado. Ctrl+C para detener.")

    while True:
        schedule.run_pending()
        time.sleep(1)
