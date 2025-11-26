# 🧩 Configuración de QA para Producción - Catálogo Indumentaria

**Fecha de creación:** 26/11/2025  
**Entorno:** Producción  
**Versión:** 1.0.0

---

## 🌐 URLs Clave

### Dominio Principal

- **Base URL:** `https://catalogo-indumentaria.vercel.app`
- **Home:** `https://catalogo-indumentaria.vercel.app/`
- **Catálogo:** `https://catalogo-indumentaria.vercel.app/catalogo`
- **Carrito:** `https://catalogo-indumentaria.vercel.app/carrito`
- **Producto:** `https://catalogo-indumentaria.vercel.app/producto/[id]`

### Checkout y Pago

- **Checkout:** Integrado en `/carrito` (no hay página separada de checkout)
- **Success:** `https://catalogo-indumentaria.vercel.app/pago/success`
- **Failure:** `https://catalogo-indumentaria.vercel.app/pago/failure`
- **Pending:** `https://catalogo-indumentaria.vercel.app/pago/pending`

### Admin (si aplica)

- **Admin:** `https://catalogo-indumentaria.vercel.app/admin` (requiere autenticación)

---

## 🔑 Variables de Entorno Relevantes

### Mercado Pago

- **MP_ACCESS_TOKEN:** Token de acceso de Mercado Pago (producción)
- **NEXT_PUBLIC_MP_PUBLIC_KEY:** Clave pública de Mercado Pago
- **MP_WEBHOOK_SECRET:** Secreto para validar webhooks (opcional)
- **Modo:** Producción (verificar que `MP_ACCESS_TOKEN` empiece con `APP_USR-`)

### Envíos

- **ENVIOPACK_API_KEY:** Clave API de Envíopack (opcional)
- **ENVIOPACK_API_SECRET:** Secreto API de Envíopack (opcional)
- **Nota:** Si no están configuradas, se usa cálculo simulado

### Base de Datos

- **SUPABASE_URL:** URL de Supabase
- **SUPABASE_ANON_KEY:** Clave anónima de Supabase
- **SUPABASE_SERVICE_ROLE_KEY:** Clave de servicio (solo backend)

### Otros

- **NEXT_PUBLIC_BASE_URL:** URL base de la aplicación
- **NODE_ENV:** `production`
- **VERCEL_ENV:** `production`

---

## 👤 Usuario/Admin de Prueba

**Nota:** Este proyecto no requiere autenticación para compras. Los usuarios pueden comprar sin registro.

Para pruebas de admin (si aplica):

- Verificar acceso a `/admin` requiere autenticación
- Usar credenciales de prueba proporcionadas por el equipo

---

## 🧪 Datos de Prueba Recomendados

### Productos de Prueba

- Usar productos con stock disponible
- Preferir productos con precio bajo para pruebas de pago
- Verificar que los productos tengan imágenes cargadas

### Códigos Postales de Prueba

- **CABA:** `C1000`, `C1001`, `C1425`
- **GBA:** `B1600`, `B1700`, `B1800`
- **Interior:** `X5000` (Córdoba), `S2000` (Rosario), `M5500` (Mendoza)
- **Interior Lejano:** `U9000` (Comodoro Rivadavia), `R9400` (Río Gallegos)

### Datos de Cliente de Prueba

- **Nombre:** Juan Pérez (o nombre de prueba)
- **Email:** test@example.com (usar email válido para recibir confirmaciones)
- **Teléfono:** +54 11 1234-5678
- **Dirección:** Calle Falsa 123
- **Código Postal:** Según zona a probar

---

## 💳 Tarjetas de Prueba de Mercado Pago

### Producción (Sandbox)

**⚠️ IMPORTANTE:** En producción real, usar tarjetas reales con montos mínimos.

### Tarjetas de Prueba (Sandbox - NO usar en producción real)

- **Aprobada:** `5031 7557 3453 0604` (CVV: 123, Vencimiento: 11/25)
- **Rechazada:** `5031 4332 1540 6351` (CVV: 123, Vencimiento: 11/25)
- **Pendiente:** `5031 4332 1540 6351` (CVV: 123, Vencimiento: 11/25)

**Nota:** Estas tarjetas solo funcionan en modo Sandbox. En producción real, usar tarjetas reales con montos mínimos.

---

## 🔍 Endpoints de API para Verificación

### Mercado Pago

- **Crear Preferencia:** `POST /api/pago`
- **Webhook:** `POST /api/mp/webhook`
- **Verificar Config:** `GET /api/mp/verify-config`
- **Test Token:** `GET /api/mp/test-token`

### Envíos

- **Calcular Envío:** `POST /api/envios/calcular`
  - Body: `{ codigoPostal: string, peso: number, precio: number, provincia?: string }`

### Productos

- **Listar:** `GET /api/productos`
- **Por ID:** `GET /api/productos/[id]`

---

## 📋 Checklist Pre-QA

Antes de comenzar las pruebas, verificar:

- [ ] El sitio está accesible en producción
- [ ] Mercado Pago está configurado correctamente (verificar con `/api/mp/verify-config`)
- [ ] Hay productos disponibles con stock
- [ ] Las imágenes de productos se cargan correctamente
- [ ] El carrito persiste en localStorage
- [ ] La calculadora de envíos responde correctamente
- [ ] Los webhooks de Mercado Pago están configurados

---

## 🚨 Consideraciones de Seguridad

1. **No usar datos reales sensibles** en pruebas
2. **No realizar compras reales** con montos altos
3. **Verificar que los webhooks** no se ejecuten múltiples veces
4. **No modificar datos productivos** sin autorización
5. **Documentar cualquier bug** encontrado en `qa/BUGS_PROD.md`

---

## 📝 Notas Adicionales

- El sistema usa **localStorage** para persistir el carrito
- Los cálculos de envío pueden ser **simulados** si Envíopack no está configurado
- Los webhooks de Mercado Pago requieren **URLs públicas** (no localhost)
- El sistema tiene **idempotencia** para evitar procesar pagos duplicados

---

**Última actualización:** 26/11/2025  
**Mantenido por:** Equipo de QA
