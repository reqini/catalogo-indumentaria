# 🔐 Configurar Variables de Entorno - Supabase

## 📍 Dónde configurar las variables

### ✅ En TU PROYECTO (local y Vercel)
Las variables de entorno se configuran en **tu proyecto**, no en Supabase.

### 📋 En Supabase solo obtienes las credenciales

---

## Paso 1: Obtener credenciales de Supabase

### 1.1 Ve a tu proyecto en Supabase
1. Inicia sesión en: https://supabase.com/dashboard
2. Selecciona tu proyecto `catalogo-indumentaria`

### 1.2 Obtener las credenciales
1. Ve a **Settings** (⚙️) → **API**
2. Encontrarás 3 valores importantes:

#### 🔑 Project URL
```
https://xxxxx.supabase.co
```
Copia este valor → será `NEXT_PUBLIC_SUPABASE_URL`

#### 🔑 anon public key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk...
```
Copia este valor → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 🔑 service_role key (⚠️ SECRETO)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OT...
```
Copia este valor → será `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANTE**: El `service_role` key es SECRETO. Solo úsalo en el servidor (rutas API), nunca en el cliente.

---

## Paso 2: Configurar en tu proyecto LOCAL

### 2.1 Crear/editar `.env.local`

En la raíz de tu proyecto, crea o edita el archivo `.env.local`:

```bash
# En la raíz del proyecto
touch .env.local
```

### 2.2 Agregar las variables

Abre `.env.local` y agrega:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Reemplaza** los valores `xxxxx` y `eyJhbGciOi...` con tus credenciales reales de Supabase.

### 2.3 Verificar que funciona

```bash
# Probar conexión
pnpm test-supabase
```

---

## Paso 3: Configurar en Vercel (Producción)

### 3.1 Ve a Vercel Dashboard
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto `catalogo-indumentaria`

### 3.2 Agregar variables de entorno
1. Ve a **Settings** → **Environment Variables**
2. Haz clic en **"Add New"**
3. Agrega cada variable una por una:

#### Variable 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://xxxxx.supabase.co` (tu URL de Supabase)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (tu anon key)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 3:
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (tu service_role key)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### 3.3 Guardar y redesplegar
1. Haz clic en **"Save"** después de cada variable
2. **IMPORTANTE**: Ve a **Deployments**
3. Haz clic en los 3 puntos (⋯) del último deployment
4. Selecciona **"Redeploy"** para aplicar los cambios

---

## 📝 Resumen

### ✅ En Supabase:
- Solo **obtienes** las credenciales (URL y keys)
- No configuras variables de entorno ahí

### ✅ En tu proyecto:
- **Configuras** las variables de entorno en:
  1. `.env.local` (desarrollo local)
  2. Vercel Dashboard (producción)

---

## 🔍 Verificar configuración

### Local:
```bash
pnpm test-supabase
```

### En Vercel:
1. Ve a tu sitio desplegado
2. Abre la consola del navegador (F12)
3. Deberías ver que las llamadas a `/api/productos` funcionan sin errores

---

## ⚠️ Importante

- ❌ **NUNCA** subas `.env.local` a GitHub (ya está en `.gitignore`)
- ✅ Las variables en Vercel son seguras y privadas
- 🔄 Después de agregar variables en Vercel, siempre **REDESPLIEGA**
- 🔐 El `service_role` key es SECRETO, solo para servidor

---

## 🆘 Problemas comunes

### Error: "Missing Supabase environment variables"
- Verifica que `.env.local` existe y tiene las variables
- Reinicia el servidor de desarrollo (`pnpm dev`)

### Error: "Invalid API key"
- Verifica que copiaste las keys completas (son muy largas)
- Asegúrate de no tener espacios al inicio/final

### Error: "relation does not exist"
- Ejecuta primero la migración SQL en Supabase Dashboard
- Verifica que las tablas se crearon correctamente

