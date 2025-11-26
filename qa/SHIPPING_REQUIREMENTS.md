# 📦 Requerimientos del Sistema de Envíos

**Fecha de Auditoría:** 26/11/2025  
**Estado Actual:** ⚠️ **SIMULADO CON FALLBACK A REAL**

---

## 🔍 Estado Actual de la Integración

### Tipo de Integración Implementada

**Estado:** 🟡 **Híbrido (Simulado con preparación para real)**

- ✅ **Cálculo de costos:** Implementado con algoritmo simulado basado en zona geográfica
- ✅ **Estructura de datos:** Completa y lista para integración real
- ✅ **Manejo de errores:** Implementado con reintentos automáticos
- ✅ **Fallback:** Sistema robusto que funciona sin credenciales
- ⚠️ **Integración real:** Solo Envíopack tiene código preparado, pero requiere credenciales
- ❌ **OCA, Andreani, Correo Argentino:** Estructura lista pero sin integración real

### API/Servicio Preparado para Conectarse

**Proveedor Principal:** **Envíopack**

- ✅ Código de integración implementado en `lib/shipping/envioPack.ts`
- ✅ Función `calcularEnvioConEnvioPack()` lista para usar
- ✅ Función `createEnvioPackShipping()` implementada
- ✅ Endpoints preparados:
  - `POST https://api.enviopack.com/cotizar` (cotización)
  - `POST https://api.enviopack.com/envios` (crear envío)
  - `GET https://api.enviopack.com/envios/{trackingNumber}` (seguimiento)

**Proveedores Secundarios (Simulados):**

- OCA (Estándar y Express)
- Andreani (Estándar y Express)
- Correo Argentino
- Mercado Envíos (condicional)

---

## 📋 Endpoints Faltantes y a Implementar

### Endpoints Actuales

✅ **Implementados:**

- `POST /api/envios/calcular` - Calcula costos de envío (simulado o real según credenciales)

### Endpoints Faltantes

❌ **No Implementados (Recomendados):**

- `GET /api/envios/tracking/{trackingNumber}` - Obtener estado de seguimiento
- `POST /api/envios/etiqueta/{orderId}` - Generar etiqueta PDF para impresión
- `GET /api/envios/proveedores` - Listar proveedores disponibles y sus servicios
- `POST /api/envios/cancelar/{trackingNumber}` - Cancelar envío (si aplica)

---

## 🔑 Variables de Entorno Requeridas

### Variables Obligatorias para Envíopack (Producción Real)

```env
# Envíopack API Credentials
ENVIOPACK_API_KEY=tu_api_key_de_envioPack
ENVIOPACK_API_SECRET=tu_api_secret_de_envioPack
```

**Estado Actual:** ❌ **NO CONFIGURADAS** (sistema funciona en modo simulado)

### Variables Opcionales (Futuras Integraciones)

```env
# OCA API (si se integra)
OCA_API_KEY=tu_api_key_de_oca
OCA_API_SECRET=tu_api_secret_de_oca
OCA_CUENTA_CORRIENTE=tu_numero_de_cuenta

# Andreani API (si se integra)
ANDREANI_API_KEY=tu_api_key_de_andreani
ANDREANI_API_SECRET=tu_api_secret_de_andreani
ANDREANI_CLIENTE=tu_numero_de_cliente

# Correo Argentino API (si se integra)
CORREO_API_KEY=tu_api_key_de_correo
CORREO_API_SECRET=tu_api_secret_de_correo
```

---

## 📊 Datos Obligatorios por Orden

### Datos Mínimos Requeridos

El sistema actual requiere los siguientes datos para crear un envío:

#### Cliente

- ✅ **name** (string, obligatorio) - Nombre completo del cliente
- ✅ **email** (string, obligatorio) - Email del cliente
- ⚠️ **phone** (string, opcional) - Teléfono (recomendado para seguimiento)

#### Dirección

- ✅ **address.street** (string, obligatorio) - Calle
- ✅ **address.number** (string, obligatorio) - Número
- ⚠️ **address.floor/apartment** (string, opcional) - Piso/Departamento
- ✅ **address.postalCode** (string, obligatorio) - Código postal (4-8 caracteres)
- ✅ **address.city** (string, obligatorio) - Localidad
- ✅ **address.province** (string, obligatorio) - Provincia
- ⚠️ **address.country** (string, opcional) - País (default: "Argentina")

#### Envío

- ✅ **weight** (number, obligatorio) - Peso en kg (mínimo 0.1kg)
- ⚠️ **dimensions** (object, opcional) - Dimensiones del paquete:
  - `length` (cm)
  - `width` (cm)
  - `height` (cm)
- ⚠️ **insurance** (number, opcional) - Valor declarado para seguro
- ✅ **orderId** (string, obligatorio) - ID de la orden interna
- ⚠️ **tracking** (string, opcional) - Número de seguimiento (se genera automáticamente)

---

## 🔄 Webhooks y Notificaciones

### Webhook de Envíopack

**Estado:** ❌ **NO IMPLEMENTADO**

**Recomendación:** Implementar endpoint para recibir actualizaciones de estado:

```
POST /api/webhooks/envioPack
```

**Eventos a manejar:**

- `envio_creado` - Envío creado exitosamente
- `envio_en_transito` - Envío en camino
- `envio_entregado` - Envío entregado
- `envio_devuelto` - Envío devuelto
- `envio_cancelado` - Envío cancelado

**Validación requerida:**

- Verificar firma HMAC-SHA256 con `ENVIOPACK_WEBHOOK_SECRET`

---

## 🏷️ Etiquetas PDF

### Generación de Etiquetas

**Estado:** ❌ **NO IMPLEMENTADO**

**Recomendación:** Implementar endpoint para generar etiquetas:

```
POST /api/envios/etiqueta/{orderId}
```

**Requisitos:**

- Generar PDF con código de barras
- Formato estándar del proveedor (10x15cm o según especificación)
- Incluir datos del destinatario y remitente
- Código de seguimiento visible

**Dependencias:**

- Librería PDF (ej: `pdfkit`, `jspdf`)
- Librería de código de barras (ej: `barcode`)

---

## 🔐 Autenticación y Tokens

### Envíopack

**Tipo:** API Key + Secret (Bearer Token)

**Implementación actual:**

- ✅ Usa `Authorization: Bearer {ENVIOPACK_API_KEY}`
- ✅ Usa header `X-API-Secret: {ENVIOPACK_API_SECRET}`

**Estado:** ✅ **IMPLEMENTADO CORRECTAMENTE**

### Otros Proveedores (Futuro)

- **OCA:** Requiere cuenta corriente y credenciales específicas
- **Andreani:** Requiere número de cliente y API key
- **Correo Argentino:** Requiere credenciales de cuenta empresarial

---

## ⚠️ Riesgos y Mejoras Recomendadas

### Riesgos Identificados

1. **🟡 Cálculo Simulado en Producción**
   - **Riesgo:** Los costos calculados pueden no coincidir con costos reales
   - **Impacto:** Pérdidas económicas o sobreprecio para clientes
   - **Mitigación:** Implementar integración real lo antes posible

2. **🟡 Falta de Validación de CP Real**
   - **Riesgo:** Códigos postales inválidos pueden pasar
   - **Impacto:** Envíos fallidos o retrasados
   - **Mitigación:** Integrar API de códigos postales de Argentina

3. **🟡 Tracking Manual**
   - **Riesgo:** Sin webhook, los estados no se actualizan automáticamente
   - **Impacto:** Clientes no saben el estado real de su envío
   - **Mitigación:** Implementar webhook de Envíopack

4. **🟡 Sin Etiquetas PDF**
   - **Riesgo:** Requiere generación manual de etiquetas
   - **Impacto:** Proceso lento y propenso a errores
   - **Mitigación:** Implementar generación automática

5. **🟡 Peso Estimado**
   - **Riesgo:** El peso se estima en 0.5kg por producto
   - **Impacto:** Costos incorrectos si productos pesan más/menos
   - **Mitigación:** Agregar campo `peso` a productos en BD

### Mejoras Recomendadas

1. **Alta Prioridad:**
   - ✅ Configurar credenciales de Envíopack
   - ✅ Implementar webhook de Envíopack
   - ✅ Agregar campo `peso` a productos
   - ✅ Validar código postal con API real

2. **Media Prioridad:**
   - ⚠️ Implementar generación de etiquetas PDF
   - ⚠️ Agregar endpoint de seguimiento
   - ⚠️ Implementar cancelación de envíos

3. **Baja Prioridad:**
   - ⚠️ Integrar OCA API real
   - ⚠️ Integrar Andreani API real
   - ⚠️ Integrar Correo Argentino API real

---

## 📝 Checklist de Implementación

### Para Activar Envíopack Real

- [ ] Obtener credenciales de Envíopack (API Key y Secret)
- [ ] Configurar `ENVIOPACK_API_KEY` en Vercel Dashboard
- [ ] Configurar `ENVIOPACK_API_SECRET` en Vercel Dashboard
- [ ] Hacer redeploy de la aplicación
- [ ] Probar creación de envío real con orden de prueba
- [ ] Verificar que se genera tracking number real
- [ ] Configurar webhook de Envíopack (si aplica)

### Para Mejorar el Sistema

- [ ] Agregar campo `peso` a tabla `productos` en Supabase
- [ ] Implementar endpoint de seguimiento `/api/envios/tracking/{trackingNumber}`
- [ ] Implementar webhook handler `/api/webhooks/envioPack`
- [ ] Implementar generación de etiquetas PDF
- [ ] Integrar API de códigos postales de Argentina

---

**Última actualización:** 26/11/2025
