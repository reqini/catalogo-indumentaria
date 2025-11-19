# Variables de Entorno - Producción

## 📋 Lista Completa de Variables Requeridas

### 🔴 CRÍTICAS (Obligatorias)

#### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

**Dónde encontrarlas:**
- Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (⚠️ mantener secreto)

---

#### JWT y Autenticación
```env
JWT_SECRET=tu-secret-key-muy-seguro-y-largo-minimo-32-caracteres
```

**Generar un secret seguro:**
```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: OpenSSL
openssl rand -hex 32
```

**⚠️ IMPORTANTE:** Usa un secret diferente en producción que en desarrollo.

---

#### Mercado Pago
```env
MP_ACCESS_TOKEN=APP_USR-tu-access-token-de-produccion
MP_WEBHOOK_SECRET=tu-webhook-secret-de-produccion
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key-de-produccion
```

**Dónde encontrarlas:**
- Mercado Pago Dashboard → Credenciales
- **Producción:** Usa las credenciales de producción (no test)
- **Webhook Secret:** Configurar en Mercado Pago → Webhooks

---

#### Base URL
```env
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

**⚠️ IMPORTANTE:** 
- En producción: URL real del dominio
- No usar `localhost` ni `127.0.0.1`
- Debe incluir `https://`

---

### 🟡 OPCIONALES (Recomendadas)

#### Email (si usas Nodemailer)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=noreply@tu-dominio.com
```

**Configuración Gmail:**
1. Activar verificación en 2 pasos
2. Generar "App Password"
3. Usar el app password en `SMTP_PASS`

---

#### Super Admin (si aplica)
```env
SUPER_ADMIN_EMAIL=admin@tu-dominio.com
SUPER_ADMIN_PASS=password-seguro-y-largo
```

---

## 🔧 Configuración en Vercel

### Paso a Paso:

1. **Ir a Vercel Dashboard**
   - Selecciona tu proyecto
   - Settings → Environment Variables

2. **Agregar Variables**
   - Click en "Add New"
   - Ingresa nombre y valor
   - Selecciona entornos: Production, Preview, Development

3. **Variables por Entorno**
   - **Production:** Todas las variables con valores de producción
   - **Preview:** Pueden usar valores de staging/test
   - **Development:** Valores locales (opcional)

4. **Verificar**
   - Después de agregar, hacer redeploy
   - Verificar en logs que las variables se cargan correctamente

---

## ✅ Checklist de Verificación

Antes de hacer deploy, verifica:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `JWT_SECRET` configurada y es segura (mínimo 32 caracteres)
- [ ] `MP_ACCESS_TOKEN` es de producción (no test)
- [ ] `MP_WEBHOOK_SECRET` configurada
- [ ] `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` configurada
- [ ] `NEXT_PUBLIC_BASE_URL` apunta a dominio real (https://)
- [ ] Todas las variables tienen valores válidos
- [ ] No hay variables de desarrollo en producción

---

## 🧪 Script de Verificación

Ejecutar después de configurar variables:

```bash
# Verificar Supabase
pnpm verify-supabase

# Verificar configuración completa
node scripts/verificar-config-completa.mjs
```

---

## 🔒 Seguridad

### ⚠️ NUNCA:
- Committear variables de entorno al repositorio
- Compartir `SUPABASE_SERVICE_ROLE_KEY` públicamente
- Compartir `JWT_SECRET` públicamente
- Usar secrets de desarrollo en producción

### ✅ SÍ:
- Usar Vercel Environment Variables
- Rotar secrets periódicamente
- Usar diferentes secrets por entorno
- Documentar variables requeridas (sin valores)

---

## 📝 Template para .env.local (Desarrollo)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-dev
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-dev

# JWT
JWT_SECRET=dev-secret-key-change-in-production

# Mercado Pago (TEST)
MP_ACCESS_TOKEN=TEST-tu-test-token
MP_WEBHOOK_SECRET=test-webhook-secret
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-tu-test-public-key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=noreply@localhost
```

---

**Última actualización:** Noviembre 2025

