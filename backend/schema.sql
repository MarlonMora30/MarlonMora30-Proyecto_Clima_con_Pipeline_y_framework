CREATE TABLE IF NOT EXISTS ciudades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    temperatura REAL NOT NULL,
    descripcion TEXT NOT NULL,
    icono TEXT NOT NULL,
    sensacion_termica REAL NOT NULL,
    fecha_registro TEXT NOT NULL
);