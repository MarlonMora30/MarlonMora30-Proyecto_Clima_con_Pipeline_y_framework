# Proyecto Clima Interactivo

Aplicación web para consultar el clima actual de cualquier ciudad usando **OpenWeatherMap** y **Unsplash** para mostrar las imágenes representativas. La aplicación permite guardar consultas en una base de datos local.

# Instalación

```bash

# Clonar el repositorio

git clone https://github.com/usuario/proyecto-clima.git
cd proyecto-clima

# Crear entorno virtual e instalar dependencias

python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

# Ejecución

```bash
# Iniciar el backend
cd backend
uvicorn main:app --reload
```

Abrir el archivo `frontend/index.html` en el navegador  
*(o usar "Live Server" en VS Code)*

# Uso

1. Escribir el nombre de una ciudad y presionar **Buscar**.
2. Se mostrará:
   - Imagen de la ciudad (Unsplash, con créditos).
   - Clima, temperatura, descripción y sensación térmica.
3. **Guardar** para almacenar la ciudad en la base de datos.
4. Ver o eliminar ciudades desde la lista inferior.

# Configuración de APIs

Editar `frontend/script.js`:

```javascript
const API_KEY = 'TuAPIKeyOpenWeatherMap';
const UNSPLASH_ACCESS_KEY = 'TuAPIKeyUnsplash';
```

- OpenWeatherMap: https://openweathermap.org/api  
- Unsplash: https://unsplash.com/developers  

# Tecnologías

- **Frontend:** HTML, JavaScript, TailwindCSS  
- **Backend:** Python + FastAPI  
- **Base de datos:** SQLite  
- **APIs:** OpenWeatherMap, Unsplash  

