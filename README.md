# Cierre de Caja — Gastos de Evento

Web app simple (una sola página, sin backend) para llevar el control de gastos de un evento:
ingresás el **monto entregado** (fondo), vas registrando las **facturas** (número, concepto y monto),
y la app calcula automáticamente el **saldo restante**. Al final podés **imprimir o guardar el reporte en PDF**.

## Características

- 💵 Registro de monto entregado (fondo inicial) en colones (₡).
- 🧾 Agregar facturas con número, concepto y monto.
- ➖ Cálculo automático: `Monto entregado − Total gastado = Saldo restante`.
- ⚠️ Aviso visual si los gastos superan el monto entregado (saldo negativo).
- 🖨️ Botón para imprimir / guardar PDF con encabezado (evento, responsable, fecha) y línea de firma.
- 📱 Diseño responsivo (funciona en celular y computadora).
- 💾 **Guardado automático en el navegador** (localStorage): los datos NO se pierden al refrescar o cerrar la pestaña. También hay un botón **Guardar** para confirmar manualmente.
- 🔒 Todo corre en el navegador (los datos se guardan localmente en tu dispositivo, no en un servidor).

## Cómo usarla

1. Escribí el **nombre del evento**, **responsable** y **fecha**.
2. Ingresá el **monto entregado** (el fondo que te dieron).
3. Agregá cada **factura**: número, a qué corresponde y el monto. Presioná **Agregar**.
4. Revisá el **Resumen del cierre** (total gastado y saldo restante).
5. Presioná **🖨️ Imprimir / Guardar PDF** para generar el reporte.

> Nota: los datos se guardan automáticamente en el navegador que estés usando, así que podés refrescar o cerrar la pestaña sin perderlos. El botón **Limpiar todo** borra los datos guardados. Como el guardado es local a ese navegador/dispositivo, para tener un respaldo permanente generá el PDF al terminar.

## Estructura del proyecto

```
.
├── index.html    # Estructura de la página
├── styles.css    # Estilos (incluye estilos de impresión)
├── app.js        # Lógica: agregar/eliminar facturas, cálculos, imprimir
└── README.md
```

## Despliegue en Cloudflare Pages

Al ser archivos estáticos, el despliegue es directo:

### Opción A — Conectar el repositorio de GitHub (recomendado)

1. Subí estos archivos a un repositorio de GitHub.
2. En el dashboard de Cloudflare → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Seleccioná el repositorio.
4. Configuración de build:
   - **Framework preset:** None
   - **Build command:** *(dejar vacío)*
   - **Build output directory:** `/`
5. **Save and Deploy**. Cada `git push` a la rama principal vuelve a desplegar automáticamente.

### Opción B — Subida directa (Direct Upload)

1. En Cloudflare → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**.
2. Arrastrá los archivos (`index.html`, `styles.css`, `app.js`).
3. **Deploy**.

## Ideas para la próxima versión

- Guardar los cierres en Workers KV para consultarlos después.
- Enviar el reporte por correo con Resend.
- Categorías de gastos y filtros.
- Adjuntar foto de cada factura.
