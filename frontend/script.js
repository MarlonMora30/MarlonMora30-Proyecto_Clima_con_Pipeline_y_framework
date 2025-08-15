const API_URL = 'http://127.0.0.1:8000/ciudades';
const API_KEY = 'IngresatuAPI'; // Tu API de OpenWeatherMap
const UNSPLASH_ACCESS_KEY = 'IngresatuAPI'; // API Key de Unsplash

const inputCiudad = document.getElementById('ciudad-input');
const btnBuscar = document.getElementById('btn-buscar');
const btnGuardar = document.getElementById('btn-guardar');
const btnLimpiar = document.getElementById('btn-limpiar');
const climaResultado = document.getElementById('clima-resultado');
const imagenCiudad = document.getElementById('imagen-ciudad');
const nombreCiudad = document.getElementById('nombre-ciudad');
const descripcionClima = document.getElementById('descripcion-clima');
const temperatura = document.getElementById('temperatura');
const ciudadesGuardadasDiv = document.getElementById('ciudades-guardadas');
const mensajeVacio = document.getElementById('mensaje-vacio');

// Nuevo: contenedor para el crédito
let creditosFotografo = document.createElement('p');
creditosFotografo.className = "text-xs text-gray-300 mt-2";

let ciudadActual = null;

btnBuscar.addEventListener('click', async () => {
  const ciudad = inputCiudad.value.trim();
  if (!ciudad) {
    alert('Por favor escriba un nombre de ciudad');
    return;
  }
  try {
    // Llamada a OpenWeatherMap
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&appid=${API_KEY}&units=metric&lang=es`);
    if (!res.ok) throw new Error('Ciudad no encontrada');
    const data = await res.json();

    ciudadActual = {
      nombre: data.name,
      temperatura: data.main.temp,
      descripcion: data.weather[0].description,
      sensacion_termica: data.main.feels_like,
      icono: data.weather[0].icon,
    };

    // Llamada a Unsplash para imagen
    const imgRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(ciudad)}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape&per_page=1`);
    const imgData = await imgRes.json();

    let imgUrl = '';
    let autor = '';
    let perfilAutor = '';

    if (imgData.results.length > 0) {
      imgUrl = imgData.results[0].urls.regular;
      autor = imgData.results[0].user.name;
      perfilAutor = imgData.results[0].user.links.html + '?utm_source=proyecto_clima&utm_medium=referral';
    }

    mostrarClima(ciudadActual, imgUrl, autor, perfilAutor);
    btnGuardar.disabled = false;
  } catch (error) {
    climaResultado.classList.remove('hidden');
    climaResultado.innerHTML = `<p class="text-red-500 font-bold">${error.message}</p>`;
    btnGuardar.disabled = true;
    ciudadActual = null;
  }
});

btnGuardar.addEventListener('click', async () => {
  if (!ciudadActual) return;
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(ciudadActual),
    });
    if (!res.ok) throw new Error('Error al guardar ciudad');
    btnGuardar.disabled = true;
    cargarCiudadesGuardadas();
  } catch (error) {
    alert(error.message);
  }
});

btnLimpiar.addEventListener('click', async () => {
  if (!confirm('¿Seguro que desea eliminar todas las ciudades?')) return;
  try {
    const res = await fetch(API_URL, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al limpiar ciudades');
    cargarCiudadesGuardadas();
  } catch (error) {
    alert(error.message);
  }
});

async function cargarCiudadesGuardadas() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al cargar ciudades');
    const ciudades = await res.json();
    ciudadesGuardadasDiv.innerHTML = '';
    if (ciudades.length === 0) {
      mensajeVacio.style.display = 'block';
      return;
    } else {
      mensajeVacio.style.display = 'none';
    }
    ciudades.forEach(ciudad => {
      const div = document.createElement('div');
      div.classList.add("bg-white/10", "p-3", "rounded-lg", "flex", "items-center", "justify-between");
      div.innerHTML = `
        <div>
          <strong>${ciudad.nombre}</strong> - ${ciudad.temperatura} °C<br>
          ${ciudad.descripcion} - Sensación: ${ciudad.sensacion_termica} °C<br>
          Guardada el: ${new Date(ciudad.fecha_registro).toLocaleString()}
        </div>
        <div>
          <img src="http://openweathermap.org/img/wn/${ciudad.icono}.png" alt="Icono clima" class="w-12 h-12"/>
          <button class="text-red-400 hover:text-red-600 font-bold" onclick="eliminarCiudad(${ciudad.id})">X</button>
        </div>
      `;
      ciudadesGuardadasDiv.appendChild(div);
    });
  } catch (error) {
    ciudadesGuardadasDiv.textContent = error.message;
  }
}

async function eliminarCiudad(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar ciudad');
    cargarCiudadesGuardadas();
  } catch (error) {
    alert(error.message);
  }
}

function mostrarClima(ciudad, imgUrl, autor, perfilAutor) {
  if (imgUrl) {
    imagenCiudad.src = imgUrl;
    imagenCiudad.alt = `Imagen de ${ciudad.nombre}`;
    // Agregar crédito al fotógrafo
    creditosFotografo.innerHTML = `Foto por <a href="${perfilAutor}" target="_blank" class="underline hover:text-blue-400">${autor}</a> en <a href="https://unsplash.com" target="_blank" class="underline hover:text-blue-400">Unsplash</a>`;
    climaResultado.appendChild(creditosFotografo);
  } else {
    imagenCiudad.src = '';
    imagenCiudad.alt = '';
    creditosFotografo.textContent = '';
  }
  nombreCiudad.textContent = ciudad.nombre;
  descripcionClima.textContent = ciudad.descripcion;
  temperatura.textContent = `${ciudad.temperatura} °C`;

  climaResultado.classList.remove('hidden');
}

// Cargar ciudades al iniciar
cargarCiudadesGuardadas();
