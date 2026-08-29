# Handoff — Cierre de Caja (Gastos de Evento)

> Documento de traspaso de contexto. Resume el estado del proyecto, decisiones tomadas
> y próximos pasos, para retomar el trabajo sin perder el hilo.

**Última actualización:** 2026-08-29
**Repositorio:** https://github.com/Nancyms1012/cierre-caja (rama `main`)
**Dueña / usuaria:** Nancy (GitHub: Nancyms1012)

---

## 1. Qué es la app

Web app de **una sola página, estática** (HTML + CSS + JS, sin backend) para hacer el
**cierre de caja de gastos de un evento** de ciclismo/triatlón.

Flujo de uso:
1. Se ingresa un **monto entregado** (fondo/adelanto que le dieron a la persona).
2. Se van registrando **facturas**: fecha, número, concepto, lugar, observaciones y monto.
3. La app calcula automáticamente: `Monto entregado − Total gastado = Saldo restante`.
4. Se puede **imprimir / guardar PDF** con encabezado (evento, responsable, fecha) y firma.

Idioma: **español**. Moneda: **colones (₡)**, formato `es-CR`.

---

## 2. Estado actual (funcionalidades implementadas)

- [x] Datos del evento: nombre, responsable, fecha.
- [x] Monto entregado (fondo).
- [x] Alta de facturas con: **fecha, N.º, concepto, lugar (opcional), observaciones (opcional), monto**.
- [x] Tabla de facturas con totales y contador.
- [x] Cálculo automático de total gastado y **saldo restante** (con alerta si es negativo).
- [x] **Editar** una factura ya cargada (botón ✎; el formulario pasa a modo "Guardar cambios" + botón Cancelar).
- [x] **Eliminar** factura (botón ✕, con confirmación).
- [x] **Imprimir / PDF**: oculta los controles y muestra encabezado + línea de firma.
- [x] **Guardado automático en el navegador (localStorage, clave `cierreCaja_v1`)**: los datos
      persisten al refrescar o cerrar la pestaña. Botón **💾 Guardar** para guardado manual con confirmación.
- [x] Botón **Limpiar todo** (borra facturas + datos guardados en el navegador, con confirmación).
- [x] Diseño responsivo (celular y computadora).

---

## 3. Estructura del proyecto

```
.
├── index.html    # Estructura de la página
├── styles.css    # Estilos (incluye reglas de impresión)
├── app.js        # Lógica: facturas (alta/edición/borrado), cálculos, guardado, imprimir
├── README.md     # Descripción + instrucciones de despliegue
└── HANDOFF.md    # Este documento
```

### Detalles técnicos clave (en `app.js`)
- Estado principal: array `facturas` (objetos con `fecha, num, concepto, lugar, observaciones, monto`).
- `editIndex`: índice de la factura en edición (`null` = alta nueva).
- Persistencia: `guardar()` / `cargar()` usan `localStorage` con la clave **`cierreCaja_v1`**.
  `render()` llama a `guardar()` en cada cambio (guardado automático).
- La clave guarda: evento, responsable, fecha, montoEntregado y facturas.

---

## 4. Historial de cambios (commits)

1. `Cierre de caja: app de gastos de evento (v1)` — versión inicial.
2. `Agregar campo de fecha de la factura`.
3. `Agregar campos de lugar y observaciones a las facturas`.
4. `Permitir editar facturas cargadas`.
5. `Guardado automatico en el navegador + boton Guardar` — persistencia en localStorage.

---

## 5. Despliegue

App estática → **Cloudflare Pages** (conectada al repo de GitHub).
- Framework preset: **None**
- Build command: *(vacío)*
- Build output directory: `/`
- Cada `git push` a `main` redespliega automáticamente (tarda ~1–2 min).

> ⚠️ Nota importante aprendida: tras un push, el deploy tarda un poco. Si se refresca la app
> antes de que termine, se sigue viendo la versión anterior.

---

## 6. Incidente conocido (contexto importante)

Nancy perdió datos al refrescar **antes** de que estuviera desplegada la versión con guardado
(estaba usando la versión vieja, que no persistía). **Esos datos no eran recuperables** porque
no se guardaban en ningún lado. Desde la versión con localStorage esto ya no ocurre.

Verificación recomendada tras cada deploy: agregar una factura de prueba → refrescar → confirmar
que sigue presente.

---

## 7. Próximos pasos sugeridos (pendientes)

### Prioridad alta — Respaldo portable (recomendado hacer ya)
- [ ] Botón **⬇️ Exportar respaldo**: descargar un archivo `.json` con todo el cierre.
- [ ] Botón **⬆️ Importar respaldo**: volver a cargar un `.json` previamente exportado.
- Motivo: el localStorage es local a **ese** navegador/dispositivo. Un respaldo `.json`
  da una copia portable independiente del navegador.

### Prioridad media — Para el evento del próximo mes (~septiembre 2026)
- [ ] Guardado **en la nube con Cloudflare Workers KV** (acceso desde cualquier dispositivo, historial de cierres).
- [ ] Posible envío del reporte por **correo (Resend)**.
- [ ] Adjuntar foto de cada factura.

---

## 8. Preferencias / contexto de la usuaria

- UI y textos en **español**.
- No puede instalar software en su máquina del trabajo → **todo se despliega vía dashboard web o `git push`**.
- Stack habitual: **Cloudflare Pages + Workers KV**, **Resend** para correo, dominio `raceclubhub.com`.
- Los eventos son de triatlón/ciclismo (ej. XTERRA Costa Rica).
