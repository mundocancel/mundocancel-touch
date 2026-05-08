# MundoCancel Core — Descripción

**MundoCancel Core** es una plataforma SaaS interna para la operación integral de un taller de cancelería (fabricación de ventanas, puertas y canceles de aluminio/vidrio). Es la **columna vertebral digital** que conecta la venta con el taller, sustituyendo Excel, WhatsApp y libretas por un solo plano de trabajo.

---

## 🎯 Propósito

Tomar un proyecto desde la **medición en obra** hasta la **entrega terminada**, garantizando trazabilidad, control financiero y disciplina de inventario en cada etapa.

---

## 🏗️ Arquitectura

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Tailwind + lucide-react |
| Backend | FastAPI (Python) |
| Base de datos | MongoDB |
| Autenticación | JWT custom con cookies httpOnly + Bearer token |
| Multi-tenancy | Aislamiento por `company_id` en cada consulta |

---

## 🎨 Estética

**Blueprint arquitectónico monocromático premium.** Inspirado en planos técnicos hechos a mano:
- Paleta: **graphite #1A1A1A sobre bone #F9F8F6** (sin gradientes, sin colores)
- Tipografías: **IBM Plex Sans / Mono** + **Caveat** para anotaciones manuscritas
- Detalles: rejilla milimétrica de fondo, marcas de registro en esquinas (crosshairs), líneas de cota (`—↔—`), sellos arquitectónicos como badges, etiquetas tipo `DET. 01` y `FIG. 01`
- Cero `border-radius`, cero shadows, todo geometría pura

---

## 👥 Roles (3)

| Rol | Capacidades |
|---|---|
| **Admin** | Configura empresa, materiales, plantillas, usuarios; valida pagos |
| **Vendedor** | Capta clientes, crea proyectos, mediciones y cotizaciones |
| **Operario** | Avanza producción y registra movimientos de inventario |

---

## 🔄 Máquina de Estados de Proyecto

```
medición → cotización → producción → terminada
```

**Regla de oro**: para pasar a `producción` se requiere ≥ 50% del total cotizado en pagos verificados. Si no, el backend devuelve `403 Forbidden`.

---

## 🧩 Módulos implementados

### 1. **Dashboard**
KPIs en vivo: proyectos activos, stock crítico, facturado total, saldo por cobrar. Pipeline visual con conteo por estado y lista de proyectos recientes.

### 2. **Clientes**
CRUD completo con datos de contacto, domicilio y notas.

### 3. **Proyectos** (vista Kanban)
4 columnas según estado, con tarjetas que muestran código (`MC-AAMM-XXXX`), cliente, total y mediciones registradas. Click → detalle.

### 4. **Detalle de Proyecto**
- **Mediciones builder**: filas editables con etiqueta, plantilla, ancho × alto, cantidad
- **Cotización semi-automática**: calcula precio por m² × área × cantidad + IVA 16%
- **Pagos**: registro con barra de progreso 50%, métodos (efectivo/transferencia/tarjeta), badge "verificado"
- **Avance de estado**: botón con validación de la regla 50%

### 5. **Cotizador**
Simulador rápido: selecciona plantilla, ingresa medidas y obtiene área, precio unitario, subtotal y total con IVA, acompañado de un **mini-render arquitectónico** acotado (escala 1:50).

### 6. **Inventario**
Tabla de materiales con stock físico, reservado, disponible, costo, badge "Bajo" cuando se cruza el mínimo, y movimientos manuales (+/–).

### 7. **Pagos**
Bitácora consolidada de todos los cobros con método y estado de verificación.

---

## 🌱 Datos sembrados al arranque

- 1 empresa default (*MundoCancel — Taller Centro*)
- 3 usuarios demo (admin, vendedor, operario)
- 8 materiales reales (perfiles aluminio, vidrios, felpa, herrajes)
- 5 plantillas de cancelería (Corrediza 2", Fija 3", Puerta abatible, Cancel baño, Domo)
- 4 clientes y 4 proyectos en distintos estados (uno por columna del kanban)

---

## 🔌 Integraciones

- **OmniMatrix** — enlazada en el sidebar bajo "herramientas conectadas" (abre en pestaña nueva).

---

## 📱 Responsive

- **Desktop**: sidebar de 260 px contraíble a 72 px (solo iconos).
- **Móvil**: drawer retráctil con backdrop, topbar con título dinámico de la sección.

---

## 🧪 Estado de calidad

- Backend: **11/11 tests pytest pasando** (auth, CRUD, regla 50%, KPIs)
- Frontend: **smoke tests Playwright pasando** (login, navegación, kanban, cotizador)
- Todos los elementos interactivos con `data-testid` para automatización

---

## 🚧 Roadmap próximo

1. **Motor de despiece real** con las fórmulas por serie (S-80, S-45, S-100 AR, S-150, S-35, S-50, S-60, S-70, Fijos, Cortina HV) que ya documentaste
2. Subida de evidencia de pago (object storage)
3. Vista de operario con orden de producción paso a paso
4. Exportación PDF de cotizaciones con membrete arquitectónico
5. Aprobación pública del cliente vía link compartible

---

**En una frase**: *MundoCancel Core es el plano técnico digital de tu taller — donde cada cliente, medida, pago y tornillo viven con la misma precisión que un trazo a tinta.* 🪟📐# app.io
inicia la creacion de una aplicacion 
