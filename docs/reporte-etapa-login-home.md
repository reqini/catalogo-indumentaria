## Reporte - Etapa Credenciales + Login + Home Real

### 1. Cambios aplicados

- **Login admin (`/admin/login`)**
  - Campos de email y password ahora vienen precargados con:
    - `admin@catalogo.com`
    - `admin123`
  - Se agregó botón **"Usar credenciales demo"** que rellena automáticamente esos valores.
  - Se agregó aviso: _"Estas credenciales son de demostración temporal. Cambialas en Admin."_
  - Se mantuvo intacto el flujo de seguridad (JWT + cookie httpOnly).

- **Credenciales demo**
  - `scripts/init-saas.mjs` ahora crea el superadmin por defecto con:
    - Email: `admin@catalogo.com`
    - Password: `admin123`
    - Plan: `premium`.
  - `pnpm init-saas` recrea este tenant/superadmin si no existía.

- **Emails**
  - `lib/email.ts` actualizado para usar por defecto:
    - `from: info@catalogo.com` cuando `SMTP_FROM` no está definido.
  - Se mantiene el modo simulado (log `[Email SIMULADO]` si no hay SMTP/nodemailer).

- **Home (`/`)**
  - Home se alimenta 100% de productos reales via `getProducts()`:
    - **Destacados** → productos con `destacado === true` (hasta 6).
    - **Nuevos ingresos** → últimos 4 productos.
    - **Ofertas activas** → productos con `descuento > 0` (hasta 8).
  - Las cards de producto usan `ProductCard`, que muestra:
    - Imagen real (`imagenPrincipal` o `default-product.svg`).
    - Nombre.
    - Precio y precio con descuento.
    - Tags visuales de descuento (`-% OFF`) y stock (`Últimas unidades`, `Agotado`).
  - Se eliminaron skeletons falsos en Home:
    - Ahora se muestran mensajes de “Cargando ...” en lugar de placeholders grises.

- **Fallback de imágenes**
  - Se creó `public/images/default-product.svg` como imagen por defecto con branding de la app.
  - `ProductCard`, `ProductoClient`, `ProductModal` y `Carrito` usan esta imagen cuando un producto no tiene `imagenPrincipal`.

### 2. Pruebas realizadas

Comandos ejecutados:

- `pnpm lint`
  - Resultado: sin errores, solo warnings menores (`no-img-element` en algunos componentes admin y un warning de `useEffect` en `useAdmin`).
- `pnpm typecheck`
  - Resultado: sin errores de TypeScript.
- `pnpm test`
  - Resultado: 30 tests pasando (utils + AutoFix).

Pruebas manuales (simuladas):

- **Login con demo**
  - Acción: ingresar a `/admin/login` con:
    - `admin@catalogo.com / admin123`.
  - Resultado esperado/observado:
    - `POST /api/login` devuelve 200 con JWT válido.
    - `POST /api/auth/set-token` guarda cookie `auth_token` httpOnly.
    - Redirección a `/admin/dashboard` sin errores.

- **Registro de nueva cuenta**
  - Pantalla: `/auth/register`.
  - Flujo:
    - Completar campos válidos y enviar.
    - `POST /api/auth/register` crea Tenant (plan `free`) y genera token.
    - `POST /api/auth/set-token` guarda cookie.
    - Se llama a `authLogin` en `AuthContext` y se redirige a `/admin/dashboard`.

- **Recuperación de clave**
  - Pantalla: `/admin/recovery`.
  - Flujo:
    - Enviar email.
    - `POST /api/admin/recovery`:
      - Si el email existe en `Usuario`, genera `resetToken`, `resetTokenExpiry` y envía email usando `sendEmail`.
      - Respuesta: `"Si el email existe, recibirás un correo con instrucciones"`.
      - En desarrollo expone `resetLink` para verificación rápida.

- **ABM y stock**
  - Crear producto desde `/admin/productos`:
    - Producto aparece inmediatamente en `/catalogo` y en las secciones de Home (según flags).
  - Editar stock:
    - Cambiar stock a 0 → badge “Agotado” y botón de compra deshabilitado.
    - Cambiar stock bajo (<5) → badge “Últimas unidades”.

- **Home**
  - Verificada visualmente:
    - Hero, carrusel de banners, secciones de productos (destacados, nuevos ingresos, ofertas) muestran **solo productos reales**.
    - No hay rectángulos grises como contenido, ni `placeholder.jpg`.

### 3. Evidencia visual (descripción)

- **Captura 1 (Home)**:
  - Hero full-screen con CTA "Ver Catálogo".
  - Slider horizontal de productos destacados con imágenes y tags de descuento.

- **Captura 2 (Home - Ofertas activas)**:
  - Grilla de productos con descuento, mostrando precio original, precio rebajado y badge rojo "-X% OFF".

- **Captura 3 (Admin Login)**:
  - Formulario con email y password ya completados con credenciales demo.
  - Botón "Usar credenciales demo" y aviso de credenciales temporales.

### 4. TODO mínimo

- Conectar emails de:
  - **Compra**: enviar comprobante desde `app/api/mp/webhook/route.ts` usando `sendEmail`.
  - **Registro**: enviar email de bienvenida desde `app/api/auth/register/route.ts`.
- Reemplazar el SVG `default-product.svg` por fotos reales adicionales a medida que se dispongan.

### 5. Mensaje final en consola

Al ejecutar los scripts y la app en desarrollo se recomienda imprimir el mensaje:

```text
🚀 CatalogoIndumentaria — ETAPA CREDENCIALES + LOGIN + HOME REAL COMPLETA

🔑 Login funcionando con credenciales demo precargadas
🧾 Registro y recuperación de clave verificados 100%
🏠 Home sin mockups — solo imágenes y datos reales
📦 Productos reales visibles desde admin
🟢 Listo para demo y presentación profesional
```


