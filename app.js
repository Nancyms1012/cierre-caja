// ===== Cierre de Caja — Gastos de Evento =====
// App estática, sin backend. Datos del momento (no se guardan).

/** @type {{fecha:string, num:string, concepto:string, lugar:string, observaciones:string, monto:number}[]} */
let facturas = [];

// --- Referencias al DOM ---
const form = document.getElementById("facturaForm");
const inputFechaFactura = document.getElementById("fechaFactura");
const inputNum = document.getElementById("numFactura");
const inputConcepto = document.getElementById("concepto");
const inputLugar = document.getElementById("lugar");
const inputObservaciones = document.getElementById("observaciones");
const inputMonto = document.getElementById("monto");
const inputMontoEntregado = document.getElementById("montoEntregado");

const facturasBody = document.getElementById("facturasBody");
const emptyState = document.getElementById("emptyState");
const contador = document.getElementById("contador");

const resMonto = document.getElementById("resMonto");
const resGastado = document.getElementById("resGastado");
const resSaldo = document.getElementById("resSaldo");
const resCantidad = document.getElementById("resCantidad");
const saldoRow = document.getElementById("saldoRow");
const alertaSobregiro = document.getElementById("alertaSobregiro");

const btnImprimir = document.getElementById("btnImprimir");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnAgregar = document.getElementById("btnAgregar");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");

// Índice de la factura en edición (null = agregando una nueva)
let editIndex = null;

// --- Formato de moneda (colones) ---
const formatoCRC = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  minimumFractionDigits: 2,
});
const fmt = (n) => formatoCRC.format(isFinite(n) ? n : 0);

// --- Formato de fecha (dd/mm/aaaa) ---
function fmtFecha(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// --- Escapar texto para evitar inyección de HTML ---
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- Agregar factura ---
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fecha = inputFechaFactura.value;
  const num = inputNum.value.trim();
  const concepto = inputConcepto.value.trim();
  const lugar = inputLugar.value.trim();
  const observaciones = inputObservaciones.value.trim();
  const monto = parseFloat(inputMonto.value);

  if (!fecha || !num || !concepto || !(monto >= 0) || isNaN(monto)) {
    alert("Completá la fecha, el número de factura, el concepto y un monto válido.");
    return;
  }

  const datos = { fecha, num, concepto, lugar, observaciones, monto };

  if (editIndex !== null) {
    // Guardar cambios de una factura existente
    facturas[editIndex] = datos;
    salirModoEdicion();
  } else {
    // Agregar nueva
    facturas.push(datos);
  }

  form.reset();
  setFechaFacturaHoy();
  inputNum.focus();
  render();
});

// --- Eliminar factura ---
function eliminarFactura(index) {
  if (!confirm("¿Eliminar esta factura?")) return;
  facturas.splice(index, 1);
  // Si estábamos editando esa u otra fila, salir del modo edición
  if (editIndex !== null) salirModoEdicion();
  render();
}

// --- Editar factura: cargar sus datos en el formulario ---
function editarFactura(index) {
  const f = facturas[index];
  if (!f) return;
  inputFechaFactura.value = f.fecha;
  inputNum.value = f.num;
  inputConcepto.value = f.concepto;
  inputLugar.value = f.lugar || "";
  inputObservaciones.value = f.observaciones || "";
  inputMonto.value = f.monto;

  editIndex = index;
  btnAgregar.textContent = "Guardar cambios";
  btnCancelarEdicion.classList.remove("hidden");

  render();
  inputFechaFactura.focus();
  // Llevar el formulario a la vista
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

// --- Salir del modo edición ---
function salirModoEdicion() {
  editIndex = null;
  btnAgregar.textContent = "Agregar";
  btnCancelarEdicion.classList.add("hidden");
}

// --- Cancelar edición ---
btnCancelarEdicion.addEventListener("click", () => {
  salirModoEdicion();
  form.reset();
  setFechaFacturaHoy();
  render();
});

// --- Recalcular al cambiar el monto entregado ---
inputMontoEntregado.addEventListener("input", render);

// --- Limpiar todo ---
btnLimpiar.addEventListener("click", () => {
  if (facturas.length === 0 && !inputMontoEntregado.value) return;
  if (confirm("¿Seguro que querés borrar todas las facturas y reiniciar el cierre?")) {
    facturas = [];
    inputMontoEntregado.value = "";
    form.reset();
    salirModoEdicion();
    setFechaFacturaHoy();
    render();
  }
});

// --- Imprimir / PDF ---
btnImprimir.addEventListener("click", () => {
  // Aseguramos que el resumen esté actualizado antes de imprimir
  render();
  // Llenamos el encabezado de impresión con los datos del evento
  const evento = document.getElementById("evento").value.trim() || "—";
  const responsable = document.getElementById("responsable").value.trim() || "—";
  const fechaVal = document.getElementById("fecha").value;
  const fechaTxt = fechaVal
    ? new Date(fechaVal + "T00:00:00").toLocaleDateString("es-CR", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "—";
  document.getElementById("phEvento").textContent = evento;
  document.getElementById("phResponsable").textContent = responsable;
  document.getElementById("phFecha").textContent = fechaTxt;
  window.print();
});

// --- Renderizar tabla + resumen ---
function render() {
  // Tabla
  facturasBody.innerHTML = "";
  if (facturas.length === 0) {
    emptyState.style.display = "";
  } else {
    emptyState.style.display = "none";
    facturas.forEach((f, i) => {
      const tr = document.createElement("tr");
      if (i === editIndex) tr.classList.add("editando");
      tr.innerHTML = `
        <td>${escapeHtml(fmtFecha(f.fecha))}</td>
        <td>${escapeHtml(f.num)}</td>
        <td>${escapeHtml(f.concepto)}</td>
        <td>${escapeHtml(f.lugar || "—")}</td>
        <td>${escapeHtml(f.observaciones || "—")}</td>
        <td class="text-right">${fmt(f.monto)}</td>
        <td class="no-print acciones-fila">
          <button class="btn-icon btn-editar" title="Editar" aria-label="Editar factura">✎</button>
          <button class="btn-icon btn-eliminar" title="Eliminar" aria-label="Eliminar factura">✕</button>
        </td>
      `;
      tr.querySelector(".btn-editar").addEventListener("click", () => editarFactura(i));
      tr.querySelector(".btn-eliminar").addEventListener("click", () => eliminarFactura(i));
      facturasBody.appendChild(tr);
    });
  }

  // Contador
  const n = facturas.length;
  contador.textContent = `${n} ${n === 1 ? "factura" : "facturas"}`;

  // Cálculos
  const montoEntregado = parseFloat(inputMontoEntregado.value) || 0;
  const totalGastado = facturas.reduce((acc, f) => acc + f.monto, 0);
  const saldo = montoEntregado - totalGastado;

  // Resumen
  resMonto.textContent = fmt(montoEntregado);
  resGastado.textContent = fmt(totalGastado);
  resSaldo.textContent = fmt(saldo);
  resCantidad.textContent = String(n);

  // Estado del saldo
  if (saldo < 0) {
    saldoRow.classList.add("negativo");
    alertaSobregiro.classList.remove("hidden");
  } else {
    saldoRow.classList.remove("negativo");
    alertaSobregiro.classList.add("hidden");
  }
}

// --- Fecha de hoy (aaaa-mm-dd) ---
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}
function setFechaFacturaHoy() {
  if (inputFechaFactura) inputFechaFactura.value = hoyISO();
}

// --- Fechas por defecto: hoy ---
(function initFechas() {
  const fecha = document.getElementById("fecha");
  if (fecha && !fecha.value) fecha.value = hoyISO();
  setFechaFacturaHoy();
})();

// Render inicial
render();
