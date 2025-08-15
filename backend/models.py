from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime

class Ciudad(Base):
    __tablename__ = "ciudades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    temperatura = Column(Float, nullable=False)
    descripcion = Column(String, nullable=False)
    sensacion_termica = Column(Float, nullable=False)
    icono = Column(String, nullable=False)
    fecha_registro = Column(String, default=lambda: datetime.now().isoformat())
