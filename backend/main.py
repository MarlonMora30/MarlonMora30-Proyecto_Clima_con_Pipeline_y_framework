from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from models import Ciudad
from database import SessionLocal, engine, Base
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import pandas as pd
from pipeline import run_pipeline

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En un caso real se cambia por el dominio del frontend.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class CiudadCreate(BaseModel):
    nombre: str
    temperatura: float
    descripcion: str
    sensacion_termica: float
    icono: str

class CiudadOut(CiudadCreate):
    id: int
    fecha_registro: str

    class Config:
        from_attributes = True

@app.post("/ciudades", response_model=CiudadOut)
def crear_ciudad(ciudad: CiudadCreate, db: Session = Depends(get_db)):
    nueva = Ciudad(**ciudad.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@app.get("/ciudades", response_model=List[CiudadOut])
def listar_ciudades(db: Session = Depends(get_db)):
    return db.query(Ciudad).all()

@app.delete("/ciudades")
def eliminar_todas_ciudades(db: Session = Depends(get_db)):
    db.query(Ciudad).delete()
    db.commit()
    return {"mensaje": "Todas las ciudades han sido eliminadas"}

@app.delete("/ciudades/{ciudad_id}")
def eliminar_ciudad(ciudad_id: int, db: Session = Depends(get_db)):
    ciudad = db.query(Ciudad).filter(Ciudad.id == ciudad_id).first()
    if not ciudad:
        raise HTTPException(status_code=404, detail="Ciudad no encontrada")
    db.delete(ciudad)
    db.commit()
    return {"mensaje": f"Ciudad {ciudad.nombre} eliminada"}


# Habilitar CORS si usás frontend aparte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/pipeline/run")
def trigger_pipeline():
    result = run_pipeline()
    return {"message": "Pipeline ejecutado correctamente", "log": result}

@app.get("/api/cleaned")
def get_cleaned_data():
    conn = sqlite3.connect("clima.db")
    df = pd.read_sql_query("SELECT * FROM ciudades_cleaned", conn)
    conn.close()
    return df.to_dict(orient="records")