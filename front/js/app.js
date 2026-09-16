const API_URL = "http://localhost:3000/api";

const formulario = document.querySelector("#form-reserva");
const comboCanchas = document.querySelector("#cancha");
const listaReservas = document.querySelector("#lista-reservas");
const tablaRecaudacion = document.querySelector("#tabla-recaudacion");
const mensaje = document.querySelector("#mensaje");

const formatearPrecio = (valor) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
  }).format(valor);

async function cargarCanchas() {
  try {
    const resp = await fetch(`${API_URL}/canchas`);
    const canchas = await resp.json();

    comboCanchas.innerHTML = '<option value="">Seleccione una cancha</option>';
    canchas.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.IdCancha;
      opt.textContent = `${c.Nombre} — ${formatearPrecio(c.PrecioPorHora)}/h`;
      comboCanchas.appendChild(opt);
    });
  } catch (error) {
    console.error("Error al cargar canchas:", error);
  }
}

async function cargarReservas() {
  try {
    const resp = await fetch(`${API_URL}/reservas`);
    const reservas = await resp.json();

    listaReservas.innerHTML = "";
    reservas.forEach((r) => {
      const estado = r.Pagada ? "pagada" : "pendiente";
      const etiqueta = r.Pagada ? "Pagada" : "Pendiente";
      const fechaFormateada = new Date(r.Fecha).toLocaleDateString("es-AR");
      const botonPago = r.Pagada
        ? ""
        : `<button onclick="registrarPago(${r.IdReserva})">Registrar pago</button>`;

      listaReservas.innerHTML += `
        <div class="tarjeta">
          <p><strong>${r.Cancha}</strong></p>
          <p>${r.Cliente}</p>
          <p>${fechaFormateada} — ${r.Hora}</p>
          <p>${formatearPrecio(r.PrecioPorHora)}</p>
          <p class="${estado}">${etiqueta}</p>
          ${botonPago}
        </div>`;
    });
  } catch (error) {
    console.error("Error al cargar reservas:", error);
  }
}

async function cargarRecaudacion() {
  try {
    const resp = await fetch(`${API_URL}/reportes/recaudacion`);
    const datos = await resp.json();

    tablaRecaudacion.innerHTML = "";
    datos.forEach((d) => {
      tablaRecaudacion.innerHTML += `
        <tr>
          <td>${d.Nombre}</td>
          <td>${d.CantidadReservas}</td>
          <td>${formatearPrecio(d.TotalCobrado)}</td>
          <td class="${d.TotalPendiente > 0 ? "pendiente" : ""}">${formatearPrecio(d.TotalPendiente)}</td>
        </tr>`;
    });
  } catch (error) {
    console.error("Error al cargar recaudación:", error);
  }
}

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cliente = document.querySelector("#cliente").value.trim();
  const idCancha = Number(comboCanchas.value);
  const fecha = document.querySelector("#fecha").value;
  const hora = document.querySelector("#hora").value;

  try {
    const resp = await fetch(`${API_URL}/reservas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente, idCancha, fecha, hora })
    });
    const data = await resp.json();

    if (!resp.ok) {
      mostrarMensaje(data.mensaje, "error");
      return;
    }

    mostrarMensaje("Reserva registrada con éxito", "exito");
    formulario.reset();
    cargarTodo();
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudo conectar con el servidor", "error");
  }
});

async function registrarPago(idReserva) {
  try {
    const resp = await fetch(`${API_URL}/reservas/${idReserva}/pago`, {
      method: "PUT"
    });
    const data = await resp.json();

    if (!resp.ok) {
      mostrarMensaje(data.mensaje, "error");
      return;
    }

    mostrarMensaje("Pago registrado con éxito", "exito");
    cargarTodo();
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudo conectar con el servidor", "error");
  }
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo === "exito" ? "pagada" : "pendiente";
  setTimeout(() => {
    mensaje.textContent = "";
    mensaje.className = "";
  }, 4000);
}

function cargarTodo() {
  cargarCanchas();
  cargarReservas();
  cargarRecaudacion();
}

cargarTodo();
