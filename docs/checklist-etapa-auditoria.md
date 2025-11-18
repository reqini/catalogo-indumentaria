## Checklist Auditoría Final CatalogoIndumentaria

### 1. Login y autenticación

- **API login**: `POST /api/login` (`app/api/login/route.ts`)
  - Valida credenciales contra `Tenant`.
  - Genera JWT con `tenantId`, `plan`, `rol`.
- **Cookie httpOnly**:
  - `POST /api/auth/set-token` guarda `auth_token` como httpOnly, `sameSite=lax`, `secure` en producción.
- **Middleware**: `middleware.ts`
  - Protege `/admin` y `/api/admin/*` verificando `auth_token`.
  - Redirige a `/admin/login` si el token es inválido o falta.
- **Flujo validado**:
  - Login en `/admin/login` → set-token → redirect `/admin/dashboard` sin errores.

### 2. Productos, ABM y stock

- **Seed**: `scripts/seed.mjs`
  - 10 productos reales (dataset ETAPA 8) con imágenes, talles, colores, categorías, stock por talle y `idMercadoPago`.
  - 3 banners creados.
- **Admin productos**: `app/admin/productos/page.tsx`
  - Alta, edición, duplicado y eliminación de productos.
  - Actualización inmediata de la tabla sin recargar página.
  - `onStockUpdate` usa `updateStock` y refresca el listado.
- **Catálogo / Home**:
  - `/catalogo` muestra productos con stock real.
  - `ProductCard` + `getStockStatus`:
    - `stock == 0` → badge **Agotado** y botón deshabilitado.
    - `stock < 5` → badge **Últimas unidades**.
- **Webhook MP**: `app/api/mp/webhook/route.ts`
  - Decrementa stock en transacción `mongoose` al aprobar pago.

### 3. Mercado Pago

- **Creación de preferencia**: `app/api/pago/route.ts`
  - Valida `MP_ACCESS_TOKEN` y stock disponible antes de crear preferencia.
  - `back_urls` configuradas para `/pago/success`, `/pago/failure`, `/pago/pending`.
- **Webhook**: `app/api/mp/webhook/route.ts`
  - Verifica firma opcional con `MP_WEBHOOK_SECRET`.
  - Idempotencia via `CompraLog` (`mpPaymentId` + `estado = 'aprobado'`).
  - Actualiza stock y loguea venta en `StockLog` y `CompraLog`.

### 4. Emails

- **Infraestructura**: `lib/email.ts`
  - Usa SMTP real si hay configuración (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
  - Modo simulado: log `[Email SIMULADO]` en consola si falta configuración.
- **Recuperación admin**: `app/api/admin/recovery/route.ts`
  - Genera token y fecha de expiración.
  - Envía email (real o simulado) con enlace `/admin/reset/{token}`.
  - En desarrollo también devuelve `resetLink` en el JSON.
- **Documentación**: `docs/emails.md` detalla cada flujo de email.

### 5. Home y UI (sin placeholders)

- **Home**: `app/page.tsx`
  - Hero principal + CTA al catálogo.
  - Carrusel `Carousel` con banners reales (sin fondos grises planos).
  - **Destacados de la semana**: slider horizontal con productos `destacado === true`.
  - **Nuevos ingresos**: últimos 4 productos por `createdAt`.
  - **Ofertas activas**: productos con `descuento > 0`.
  - Secciones adicionales: colecciones, trust badges, reseñas y newsletter.
- **Imágenes reales**:
  - `ProductCard`, `ProductoClient`, `ProductModal`, carrito → usan `imagenPrincipal` o una imagen real por defecto (`/images/urban-runner-1.jpg`), nunca `placeholder.jpg`.
  - Carousel utiliza imágenes de banners (seed).
- **Estado de carga**:
  - Se mantienen skeletons solo como estados transitorios de carga, no como contenido final.

### 6. QA automático

Comandos ejecutados:

- `pnpm lint`
  - 0 errores, 4 warnings menores (@next/next/no-img-element, react-hooks/exhaustive-deps en admin).
- `pnpm typecheck`
  - Sin errores de TypeScript.
- `pnpm test`
  - 30 tests pasando (utils + AutoFix).

### 7. TODO mínimo

- Conectar emails de compra y registro usando `sendEmail` en:
  - Webhook MP (`app/api/mp/webhook/route.ts`) para enviar comprobante de compra.
  - Flujo de registro de tenant (`app/api/auth/register/route.ts`) para bienvenida.
- Añadir más imágenes reales en `/public/images` para futuras colecciones y categorías.

### 8. Mensaje final en consola

Al ejecutar `pnpm seed` y arrancar en desarrollo, se muestran mensajes confirmando:

- `CatalogoIndumentaria — ETAPA 8: CARGA DE PRODUCTOS REAL COMPLETA`.
- Home actualizada con datos reales.
- Admin funcionando (alta, edición, stock).
- Stock visible y validado en catálogo.


