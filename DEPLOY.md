# 🚀 Guía Rápida de Despliegue en Vercel

## ✅ Estado Actual

Todo está listo para desplegar. Los archivos de configuración están preparados.

## 📋 Pasos Rápidos

### 1️⃣ Preparar Variables de Entorno

Antes de desplegar, necesitas estas variables en Vercel:

**Obligatorias:**
- `MONGODB_URI` - Tu URI de MongoDB (Atlas recomendado)
- `JWT_SECRET` - Un secret seguro (generar con: `openssl rand -base64 32`)

**Opcionales:**
- `MP_ACCESS_TOKEN` - Token de Mercado Pago
- `MP_WEBHOOK_SECRET` - Secret del webhook
- `NEXT_PUBLIC_MP_PUBLIC_KEY` - Public key de Mercado Pago
- `CLOUDINARY_*` - Para subida de imágenes
- `SMTP_*` - Para envío de emails

### 2️⃣ Desplegar

#### Opción A: Desde GitHub (Más Fácil) ⭐

1. **Subir a GitHub:**
   ```bash
   git remote add origin https://github.com/TU_USUARIO/catalogo-indumentaria.git
   git push -u origin main
   ```

2. **En Vercel:**
   - Ir a [vercel.com/new](https://vercel.com/new)
   - Conectar tu repositorio de GitHub
   - Seleccionar el proyecto
   - **Configurar variables de entorno** (Settings → Environment Variables)
   - Click en "Deploy"

3. **¡Listo!** Tu app estará en `tu-proyecto.vercel.app`

#### Opción B: Desde CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Desplegar (usa el script automático)
./scripts/deploy-vercel.sh

# O manualmente:
vercel          # Preview
vercel --prod   # Producción
```

**⚠️ IMPORTANTE:** Después del primer despliegue, configura las variables de entorno en Vercel Dashboard.

### 3️⃣ Configurar Variables en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Click en "Settings" → "Environment Variables"
3. Agrega cada variable:
   - Key: `MONGODB_URI`
   - Value: Tu URI de MongoDB
   - Environment: Production, Preview, Development
4. Repite para todas las variables necesarias
5. Click en "Save"

### 4️⃣ Verificar Despliegue

Después del despliegue, verifica:

- ✅ Home: `https://tu-proyecto.vercel.app/`
- ✅ Status: `https://tu-proyecto.vercel.app/status`
- ✅ Admin: `https://tu-proyecto.vercel.app/admin`
- ✅ Catálogo: `https://tu-proyecto.vercel.app/catalogo`

## 🔧 Configuración de MongoDB Atlas

Si usas MongoDB Atlas:

1. Crear cluster en [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crear usuario de base de datos
3. Configurar Network Access:
   - Agregar IP: `0.0.0.0/0` (permite desde cualquier lugar)
   - O agregar IPs de Vercel específicas
4. Obtener connection string
5. Agregar como `MONGODB_URI` en Vercel

## 📚 Documentación Completa

- **Guía detallada:** `docs/vercel-deployment.md`
- **Checklist:** `VERCEL-CHECKLIST.md`
- **Variables de ejemplo:** Ver `.env.example` (si existe)

## 🐛 Problemas Comunes

### Build falla
- Verifica que todas las variables obligatorias estén configuradas
- Revisa los logs en Vercel Dashboard

### MongoDB no conecta
- Verifica que `MONGODB_URI` esté correcta
- Asegúrate de que Atlas permita conexiones desde cualquier IP

### Variables no funcionan
- Verifica que estén en el ambiente correcto (Production/Preview)
- Asegúrate de que los nombres coincidan exactamente

## ✅ Checklist Final

- [ ] Código subido a GitHub (o listo para CLI)
- [ ] Variables de entorno preparadas
- [ ] MongoDB configurado y accesible
- [ ] Despliegue iniciado
- [ ] Variables configuradas en Vercel Dashboard
- [ ] App verificada y funcionando

## 🎉 ¡Listo!

Una vez desplegado, tu app estará disponible en producción con:
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Deployments automáticos desde GitHub
- ✅ Preview deployments para PRs
- ✅ Analytics y logs

