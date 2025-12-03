# 🔧 Solución: Error "Sistema no configurado"

## ❌ El Problema

El mensaje **"Sistema no configurado. Por favor, contacta al administrador."** aparece cuando:

1. **Supabase no está configurado** - Las variables de entorno de Supabase no están configuradas en Vercel
2. **No puedes hacer login** - El sistema necesita Supabase para autenticar usuarios
3. **No ves productos** - Los productos se almacenan en Supabase

## ✅ Solución Rápida (5 minutos)

### Paso 1: Obtener credenciales de Supabase

1. Ve a https://supabase.com/dashboard
2. Si no tienes proyecto, crea uno nuevo (es gratis)
3. En tu proyecto, ve a **Settings > API**
4. Copia estos valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (la clave pública, empieza con `eyJ...`)

### Paso 2: Configurar en Netlify/Vercel

#### Si usas Netlify:

1. Ve a tu proyecto en Netlify
2. Ve a **Site settings > Environment variables**
3. Agrega estas variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Si usas Vercel:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings > Environment Variables**
3. Agrega las mismas variables

### Paso 3: Redeploy

1. En Netlify: Ve a **Deploys** y haz clic en **Trigger deploy > Deploy site**
2. En Vercel: Ve a **Deployments** y haz clic en **Redeploy**

### Paso 4: Verificar

1. Espera a que termine el deploy (2-3 minutos)
2. Abre tu aplicación
3. Intenta hacer login nuevamente
4. Deberías poder iniciar sesión y ver productos

## 🔍 Diagnóstico

Si el problema persiste, visita:

```
https://tu-app.com/api/diagnostico-supabase
```

Este endpoint te mostrará:

- ✅ Qué variables están configuradas
- ❌ Qué variables faltan
- 🔗 Instrucciones detalladas

## 📋 Checklist de Variables Requeridas

Asegúrate de tener estas variables configuradas:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - La URL de tu proyecto Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - La clave pública anon
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - (Opcional) Para operaciones admin avanzadas
- [ ] `JWT_SECRET` - (Opcional) Para tokens JWT personalizados
- [ ] `MP_ACCESS_TOKEN` - (Opcional) Para pagos con Mercado Pago

## 🆘 ¿Necesitas ayuda?

1. **Verifica el diagnóstico**: Visita `/api/diagnostico-supabase`
2. **Revisa los logs**: En Vercel, ve a los logs del deploy
3. **Verifica Supabase**: Asegúrate de que tu proyecto Supabase esté activo

## 📝 Notas Importantes

- **Las variables deben empezar con `NEXT_PUBLIC_`** para que estén disponibles en el cliente
- **Después de agregar variables, SIEMPRE redeploya** la aplicación
- **Supabase tiene un plan gratuito** que es suficiente para empezar

## 🎯 Próximos Pasos

Una vez configurado Supabase:

1. **Crea un usuario admin** en Supabase (tabla `tenants`)
2. **Crea algunos productos** desde el panel admin
3. **Configura Mercado Pago** si quieres habilitar pagos

---

**¿Sigue sin funcionar?** Revisa los logs del servidor en Vercel para ver errores específicos.
