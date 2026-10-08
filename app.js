// ===== Cierre de Caja — Gastos de Evento =====
// App estática, sin backend. Los datos se guardan en el navegador (localStorage).

const STORAGE_KEY = "cierreCaja_v1";

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

const inputEvento = document.getElementById("evento");
const inputResponsable = document.getElementById("responsable");
const inputFecha = document.getElementById("fecha");

const btnImprimir = document.getElementById("btnImprimir");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnGuardar = document.getElementById("btnGuardar");
const btnExportar = document.getElementById("btnExportar");
const btnImportar = document.getElementById("btnImportar");
const inputImportar = document.getElementById("inputImportar");
const btnAgregar = document.getElementById("btnAgregar");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
const guardadoEstado = document.getElementById("guardadoEstado");

const thFecha = document.getElementById("thFecha");
const fechaSortIcon = document.getElementById("fechaSortIcon");

// Índice de la factura en edición (null = agregando una nueva)
let editIndex = null;

// Dirección del orden por fecha: "asc", "desc" o null (sin ordenar)
let ordenFecha = null;

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

// --- Ordenar facturas por fecha (alterna ascendente / descendente) ---
function ordenarPorFecha() {
  // Si estamos editando, salimos del modo edición para evitar que el índice se desalinee
  if (editIndex !== null) {
    salirModoEdicion();
    form.reset();
    setFechaFacturaHoy();
  }
  ordenFecha = ordenFecha === "asc" ? "desc" : "asc";
  ordenarFacturasActual();
  render();
}

// Reordena el array `facturas` según `ordenFecha` (si hay un orden activo).
function ordenarFacturasActual() {
  if (!ordenFecha) return;
  const dir = ordenFecha === "asc" ? 1 : -1;
  facturas.sort((a, b) => {
    // Fechas en formato ISO (aaaa-mm-dd) se comparan como texto correctamente
    const fa = a.fecha || "";
    const fb = b.fecha || "";
    if (fa < fb) return -1 * dir;
    if (fa > fb) return 1 * dir;
    return 0;
  });
}

if (thFecha) {
  thFecha.addEventListener("click", ordenarPorFecha);
  thFecha.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      ordenarPorFecha();
    }
  });
}

// --- Recalcular al cambiar el monto entregado ---
inputMontoEntregado.addEventListener("input", render);

// --- Limpiar todo ---
btnLimpiar.addEventListener("click", () => {
  if (facturas.length === 0 && !inputMontoEntregado.value) return;
  if (confirm("¿Seguro que querés borrar todas las facturas y reiniciar el cierre? Esto también borra los datos guardados en este navegador.")) {
    facturas = [];
    inputMontoEntregado.value = "";
    inputEvento.value = "";
    inputResponsable.value = "";
    form.reset();
    salirModoEdicion();
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    inputFecha.value = hoyISO();
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

  // Ícono de orden por fecha
  if (fechaSortIcon) {
    fechaSortIcon.textContent = ordenFecha === "asc" ? "▲" : ordenFecha === "desc" ? "▼" : "⇅";
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

  // Guardado automático en el navegador
  guardar();
}

// ===== Persistencia en el navegador (localStorage) =====

// Guarda todo el estado. Se llama automáticamente en cada cambio.
function guardar(mostrarAviso = false) {
  const estado = {
    evento: inputEvento.value,
    responsable: inputResponsable.value,
    fecha: inputFecha.value,
    montoEntregado: inputMontoEntregado.value,
    facturas,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    if (mostrarAviso) mostrarGuardado("✔ Guardado");
  } catch (e) {
    if (mostrarAviso) mostrarGuardado("⚠️ No se pudo guardar", true);
  }
}

// Carga el estado guardado (si existe) al abrir la página.
function cargar() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return false;
  }
  if (!raw) return false;
  try {
    const estado = JSON.parse(raw);
    inputEvento.value = estado.evento || "";
    inputResponsable.value = estado.responsable || "";
    if (estado.fecha) inputFecha.value = estado.fecha;
    inputMontoEntregado.value = estado.montoEntregado || "";
    facturas = Array.isArray(estado.facturas) ? estado.facturas : [];
    return true;
  } catch (e) {
    return false;
  }
}

// Muestra un aviso breve de estado de guardado.
let avisoTimer = null;
function mostrarGuardado(texto, esError = false) {
  if (!guardadoEstado) return;
  guardadoEstado.textContent = texto;
  guardadoEstado.classList.toggle("error", esError);
  guardadoEstado.classList.add("visible");
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => guardadoEstado.classList.remove("visible"), 2000);
}

// Botón Guardar (guardado manual con confirmación).
btnGuardar.addEventListener("click", () => guardar(true));

// ===== Respaldo: exportar / importar archivo .json =====

// Nombre de archivo sugerido para el respaldo (incluye evento y fecha).
function nombreArchivoRespaldo() {
  const base = (inputEvento.value.trim() || "cierre-caja")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${hoyISO()}.json`;
}

// Exportar: ordena las facturas por fecha (ascendente) y descarga el .json.
btnExportar.addEventListener("click", () => {
  // Salir de edición y ordenar por fecha ascendente antes de exportar
  if (editIndex !== null) {
    salirModoEdicion();
    form.reset();
    setFechaFacturaHoy();
  }
  ordenFecha = "asc";
  ordenarFacturasActual();
  render();

  const estado = {
    app: "cierre-caja",
    version: 1,
    exportado: new Date().toISOString(),
    evento: inputEvento.value,
    responsable: inputResponsable.value,
    fecha: inputFecha.value,
    montoEntregado: inputMontoEntregado.value,
    facturas,
  };

  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivoRespaldo();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  mostrarGuardado("✔ Respaldo exportado");
});

// Importar: abre el selector de archivos.
btnImportar.addEventListener("click", () => inputImportar.click());

inputImportar.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const estado = JSON.parse(reader.result);
      if (!estado || !Array.isArray(estado.facturas)) {
        throw new Error("Formato no reconocido");
      }
      if (facturas.length > 0 && !confirm("Esto reemplazará los datos actuales por los del respaldo. ¿Continuar?")) {
        return;
      }
      inputEvento.value = estado.evento || "";
      inputResponsable.value = estado.responsable || "";
      if (estado.fecha) inputFecha.value = estado.fecha;
      inputMontoEntregado.value = estado.montoEntregado || "";
      facturas = estado.facturas;
      salirModoEdicion();
      // Ordenar por fecha al importar para dejarlo prolijo
      ordenFecha = "asc";
      ordenarFacturasActual();
      render();
      mostrarGuardado("✔ Respaldo importado");
    } catch (err) {
      alert("No se pudo leer el archivo. Asegurate de seleccionar un respaldo .json válido de esta app.");
    } finally {
      inputImportar.value = ""; // permitir volver a importar el mismo archivo
    }
  };
  reader.onerror = () => {
    alert("No se pudo leer el archivo.");
    inputImportar.value = "";
  };
  reader.readAsText(file);
});

// Guardar automáticamente cuando cambian los datos del evento.
[inputEvento, inputResponsable, inputFecha].forEach((el) => {
  if (el) el.addEventListener("input", () => guardar());
});

// --- Fecha de hoy (aaaa-mm-dd) ---
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}
function setFechaFacturaHoy() {
  if (inputFechaFactura) inputFechaFactura.value = hoyISO();
}

// --- Inicialización: cargar datos guardados o poner fecha de hoy ---
(function init() {
  const cargado = cargar();
  if (!cargado && inputFecha && !inputFecha.value) {
    inputFecha.value = hoyISO();
  }
  setFechaFacturaHoy();
})();

// Render inicial
render();
