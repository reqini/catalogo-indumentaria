# 🔧 Configuración de Variables de Entorno - VERCEL

## ✅ Netlify Eliminado - Solo Vercel

Todas las referencias a Netlify han sido eliminadas. El proyecto ahora funciona **exclusivamente con Vercel**.

---

## 📋 Variables de Entorno Necesarias

### 🔴 OBLIGATORIAS (sin estas no funciona)

```bash
# Autenticación
JWT_SECRET=tu-jwt-secret-super-seguro-aqui

# Mercado Pago
MP_ACCESS_TOKEN=tu-access-token-de-mercadopago

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-de-supabase
```

### 🟡 OPCIONALES (funciona sin estas pero con funcionalidades limitadas)

```bash
# Cloudinary (para imágenes)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Reportes automáticos
DAILY_REPORT_SECRET_TOKEN=tu-token-secreto

# Webhooks
MP_WEBHOOK_SECRET=tu-webhook-secret-de-mercadopago
ENVIOPACK_WEBHOOK_SECRET=tu-webhook-secret-de-enviopack

# URL Base (se detecta automáticamente en Vercel)
# NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
```

---

## 🚀 Configuración Local

### Paso 1: Crear archivo `.env.local`

```bash
# En la raíz del proyecto
cp .env.local.example .env.local
```

### Paso 2: Completar valores

Abre `.env.local` y completa con los **mismos valores** que tienes en Vercel:

```bash
# Obtén estos valores desde Vercel Dashboard:
# 1. Ve a tu proyecto en Vercel
# 2. Settings > Environment Variables
# 3. Copia cada valor y pégalo en .env.local
```

### Paso 3: Verificar

```bash
# Reinicia el servidor de desarrollo
pnpm dev
```

---

## 🌐 Configuración en Vercel

### Las variables ya están configuradas ✅

Si necesitas agregar o modificar variables en Vercel:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Agrega/modifica las variables necesarias
5. **IMPORTANTE:** Haz clic en **Redeploy** para aplicar cambios

---

## 🔍 Verificar Variables en Vercel

### Desde el Dashboard:

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Verifica que todas las variables obligatorias estén presentes

### Desde el código:

```bash
# Verificar configuración de Mercado Pago
pnpm diagnose-mp-complete

# Verificar configuración de Supabase
curl http://localhost:3000/api/diagnostico-supabase
```

---

## ⚠️ Problemas Comunes

### "MP_ACCESS_TOKEN no está configurado"

**Solución:**

1. Verifica que `MP_ACCESS_TOKEN` esté en Vercel Dashboard
2. Si acabas de agregarla, haz **Redeploy**
3. Verifica que el nombre sea exactamente `MP_ACCESS_TOKEN` (sin espacios)

### "Supabase no está configurado"

**Solución:**

1. Verifica que estas 3 variables estén en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Haz **Redeploy** después de agregarlas

### Variables no se aplican en local

**Solución:**

1. Verifica que el archivo se llame exactamente `.env.local` (no `.env`)
2. Reinicia el servidor (`pnpm dev`)
3. Verifica que no haya espacios antes/después del `=`

---

## 📝 Notas Importantes

1. **NUNCA** subas `.env.local` a Git (ya está en `.gitignore`)
2. Las variables `NEXT_PUBLIC_*` son accesibles en el cliente
3. Las demás variables son solo del servidor
4. Después de agregar variables en Vercel, **siempre haz Redeploy**
5. En desarrollo local, usa `.env.local`
6. En producción (Vercel), las variables se configuran en el Dashboard

---

## ✅ Checklist

- [ ] Variables obligatorias configuradas en Vercel
- [ ] Archivo `.env.local` creado localmente
- [ ] Valores copiados desde Vercel a `.env.local`
- [ ] Servidor reiniciado después de cambios
- [ ] Verificación ejecutada (`pnpm diagnose-mp-complete`)

---

**¿Necesitas ayuda?** Revisa los logs en Vercel Dashboard > Deployments > [último deploy] > Logs
