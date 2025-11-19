# 🔒 Verificación Segura de Variables de Entorno

## ⚠️ ADVERTENCIA DE SEGURIDAD

Si al visitar `/api/verificar-env` te redirige a un sitio sospechoso, **NO continúes**. Esto podría indicar:

1. **Problema de DNS**: El dominio podría estar comprometido
2. **Problema de Vercel**: El proyecto podría tener configuración incorrecta
3. **Phishing**: Podría ser un intento de robo de credenciales

---

## ✅ Métodos Seguros de Verificación

### Método 1: Verificar desde Vercel Dashboard (MÁS SEGURO)

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard) directamente (NO uses links externos)
2. Inicia sesión con tus credenciales oficiales
3. Selecciona tu proyecto: `catalogo-indumentaria`
4. Ve a **Settings** → **Environment Variables**
5. Verifica manualmente que estas variables estén presentes:

#### Checklist de Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - Debe ser: `https://yqggrzxjhylnxjuagfyr.supabase.co`

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Debe comenzar con: `sb_publishable_`

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - Debe comenzar con: `sb_secret_`

- [ ] `JWT_SECRET`
  - Debe tener 64 caracteres

- [ ] `NEXT_PUBLIC_BASE_URL`
  - Debe comenzar con: `https://`
  - NO debe contener: `localhost`

---

### Método 2: Verificar desde el Código (LOCAL)

Ejecuta este script localmente para verificar las variables:

```bash
# Verificar variables locales
pnpm verificar-produccion
```

Esto verificará la configuración local sin exponer información sensible.

---

### Método 3: Verificar Build Logs en Vercel

1. Ve a Vercel Dashboard → **Deployments**
2. Click en el último deployment
3. Click en **"Logs"**
4. Busca mensajes relacionados con variables de entorno

Si ves errores como:
- `Environment variable not found`
- `Missing required environment variable`

Significa que alguna variable falta o está mal configurada.

---

### Método 4: Verificar desde el Sitio (CON PRECAUCIÓN)

**⚠️ SOLO si estás 100% seguro de que el dominio es correcto:**

1. Verifica que la URL sea exactamente:
   ```
   https://tu-proyecto.vercel.app/api/verificar-env
   ```
   (Reemplaza `tu-proyecto` con el nombre real de tu proyecto)

2. Verifica que el certificado SSL sea válido (candado verde en el navegador)

3. Si ves cualquier redirección sospechosa, **CIERRA LA PESTAÑA INMEDIATAMENTE**

---

## 🚨 Si Detectaste un Problema de Seguridad

### Pasos Inmediatos:

1. **NO ingreses credenciales** en ningún sitio sospechoso
2. **Cambia todas las contraseñas** relacionadas:
   - Vercel
   - Supabase
   - GitHub
   - Mercado Pago
3. **Revisa los accesos** en cada plataforma
4. **Verifica los deployments** en Vercel Dashboard
5. **Revisa los logs** para detectar actividad sospechosa

### Verificar Dominio Correcto:

El dominio de tu proyecto en Vercel debería ser:
```
https://catalogo-indumentaria.vercel.app
```

O si configuraste un dominio personalizado:
```
https://tu-dominio-personalizado.com
```

**NUNCA uses dominios que no reconozcas o que parezcan sospechosos.**

---

## ✅ Verificación Manual Segura

### Paso 1: Verificar Variables en Vercel

1. Ve directamente a: `https://vercel.com/dashboard`
2. Inicia sesión
3. Selecciona tu proyecto
4. Ve a Settings → Environment Variables
5. Verifica que las 5 variables críticas estén presentes

### Paso 2: Verificar que el Sitio Funciona

1. Visita directamente: `https://tu-proyecto.vercel.app/`
2. Verifica que:
   - El sitio carga correctamente
   - No hay redirecciones sospechosas
   - El certificado SSL es válido (candado verde)

### Paso 3: Probar Funcionalidades Básicas

1. Intenta hacer login en Admin
2. Verifica que las funciones básicas trabajen
3. Si algo no funciona, revisa los logs en Vercel

---

## 🔐 Mejores Prácticas de Seguridad

1. **Siempre verifica la URL** antes de ingresar credenciales
2. **Usa solo sitios oficiales**: vercel.com, supabase.com, mercadopago.com
3. **Nunca hagas click en links sospechosos** de emails o mensajes
4. **Habilita autenticación de dos factores** en todas las plataformas
5. **Revisa regularmente** los accesos y logs de tus servicios

---

## 📞 Si Necesitas Ayuda

Si detectaste actividad sospechosa:

1. **Reporta el problema** a Vercel Support
2. **Revisa los logs** en Vercel Dashboard
3. **Verifica los deployments** recientes
4. **Cambia todas las credenciales** como medida preventiva

---

**Última actualización:** Noviembre 2025

