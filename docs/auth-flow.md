## Flujo de Autenticación - CatalogoIndumentaria

### 1. Login Admin

- **Pantalla**: `/admin/login`
  - Campos precargados (editables):
    - Email: `admin@catalogo.com`
    - Password: `admin123`
  - Botón adicional: **"Usar credenciales demo"** que rellena esos valores.
  - Aviso: _"Estas credenciales son de demostración temporal. Cambialas en Admin."_

- **API**: `POST /api/login` (`app/api/login/route.ts`)
  - Valida con Zod (`loginSchema`) que `email` y `password` sean válidos.
  - Busca en `Tenant` por `email` (lowercase).
  - Verifica:
    - Que el tenant exista.
    - Que `activo === true`.
    - Que `bcrypt.compare(password, passwordHash)` sea true.
  - Genera JWT con:
    - `id`, `tenantId`, `email`, `plan`, `rol`.
  - Respuesta:
    - `{ token, tenant: { tenantId, nombreNegocio, email, plan, branding, rol } }`.
  - Errores:
    - 401 → `Credenciales inválidas`.
    - 403 → `Cuenta inactiva`.
    - 500 → `Error al iniciar sesión`.

- **Cookie httpOnly**: `POST /api/auth/set-token`
  - Body: `{ token }`.
  - Guarda cookie `auth_token` con:
    - `httpOnly: true`
    - `sameSite: 'lax'`
    - `secure: NODE_ENV === 'production'`
    - `maxAge: 7 días`.

- **Middleware**: `middleware.ts`
  - Protege:
    - `/admin/*` (excepto `/admin/login`).
    - `/api/admin/*`.
  - Si no hay `auth_token` o JWT inválido:
    - Redirige a `/admin/login` (rutas admin).
    - Devuelve 401 (API admin).

- **Redirección**:
  - En `app/admin/login/page.tsx`, si el login es exitoso:
    - Llama a `/api/auth/set-token`.
    - Muestra toast "Inicio de sesión exitoso".
    - `router.push('/admin/dashboard')` y `router.refresh()`.

### 2. Registro de Tenant

- **Pantalla**: `/auth/register` (`app/auth/register/page.tsx`)
  - Campos:
    - `nombreNegocio` (obligatorio).
    - `email` (obligatorio, formato email).
    - `password` (obligatorio, min 6).
    - `mpId` (opcional).
  - Validaciones en cliente:
    - `required`, longitud mínima en password.
  - Flujo:
    - `POST /api/auth/register`.
    - Si OK:
      - `POST /api/auth/set-token` para guardar `auth_token`.
      - `authLogin(data.token, data.tenant)` vía `AuthContext`.
      - Toast "¡Cuenta creada exitosamente!".
      - Redirección a `/admin/dashboard`.

- **API**: `POST /api/auth/register` (`app/api/auth/register/route.ts`)
  - Valida con `registerSchema` (Zod):
    - `nombreNegocio`, `email`, `password`, `mpId?`.
  - Verifica que el email no exista en `Tenant`.
  - Crea `Tenant` con:
    - `tenantId` (UUID).
    - `plan: 'free'`.
    - `activo: true`.
    - `rol: 'tenant'`.
    - `branding` por defecto (negro/blanco, Inter).
  - Genera JWT (7 días).
  - Respuesta:
    - `{ token, tenant: { tenantId, nombreNegocio, email, plan, branding } }`.

### 3. Recuperación de Contraseña (Admin legacy)

- **Pantalla**: `/admin/recovery` (`app/admin/recovery/page.tsx`)
  - Formulario de email.
  - Mensaje después de enviar:
    - "Email Enviado" + explicación.
  - Nota: a nivel backend el flujo real está en `app/api/admin/recovery/route.ts`.

- **API**: `POST /api/admin/recovery`
  - Modelo: `Usuario` (admin legacy).
  - Body: `{ email }`.
  - Si falta email → 400.
  - Si el usuario no existe:
    - Devuelve siempre 200 con:
      - `"message": "Si el email existe, recibirás un correo con instrucciones"`.
  - Si existe:
    - Genera `resetToken` (random 32 bytes hex).
    - `resetTokenExpiry` (+1 hora).
    - Construye `resetLink`: `BASE_URL/admin/reset/{token}`.
    - Llama a `sendEmail` (`lib/email.ts`) con:
      - `from`: `info@catalogo.com` (o `SMTP_FROM` si está configurado).
      - `subject`: "Recuperación de contraseña - CatalogoIndumentaria".
      - `type: 'recovery'`.
      - `text` + `html` con el link.
    - Respuesta:
      - Igual mensaje genérico.
      - En desarrollo agrega `resetLink` en el JSON.

### 4. Reset de Contraseña

- **Pantalla**: `/admin/reset/[token]` (`app/admin/reset/[token]/page.tsx`)
  - Campos:
    - Nueva contraseña.
    - Confirmación.
  - Validaciones:
    - Contraseñas coinciden.
    - Longitud mínima 8.
  - Enviar:
    - `POST /api/admin/reset-password` con `token` y `password`.
  - Si OK:
    - Toast "Contraseña actualizada exitosamente".
    - Redirige a `/admin/login`.

### 5. Emails

- **Módulo**: `lib/email.ts`
  - Variables de entorno:
    - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
  - Si están configuradas e instalado `nodemailer`:
    - Envía email real.
  - Si faltan:
    - Modo simulado: log `[Email SIMULADO]` con:
      - type, from, to, subject, text/html.
  - From por defecto:
    - `info@catalogo.com` (demo).

### 6. Resumen de seguridad

- Autenticación basada en **JWT** almacenado en **cookie httpOnly** (`auth_token`).
- Middleware protege rutas `/admin/*` y `/api/admin/*`.
- Tokens expiran a los **7 días**.
- Recuperación de contraseña:
  - Tokens de reset con expiración (1 hora).
  - Mensajes genéricos para no filtrar existencia de emails.


