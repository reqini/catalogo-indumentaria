# 🔍 Cómo Verificar Variables en Vercel

## Método 1: Desde Vercel Dashboard

1. Ve a [Vercel Dashboard](https://vercel.com)
2. Selecciona tu proyecto `catalogo-indumentaria`
3. Ve a **Settings** → **Environment Variables**
4. Verifica que todas estas variables estén presentes:

### ✅ Variables Requeridas:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `JWT_SECRET`
- [ ] `NEXT_PUBLIC_BASE_URL`

### ⚠️ Variables Opcionales (para Mercado Pago):

- [ ] `MP_ACCESS_TOKEN`
- [ ] `MP_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`

---

## Método 2: Endpoint de Verificación (Después del Deploy)

Después de hacer deploy, puedes verificar las variables visitando:

```
https://tu-proyecto.vercel.app/api/verificar-env
```

Este endpoint te mostrará:
- ✅ Variables presentes y válidas
- ❌ Variables faltantes
- ⚠️ Advertencias (formato incorrecto, etc.)

---

## Método 3: Verificar en Logs de Vercel

1. Ve a Vercel Dashboard → **Deployments**
2. Click en el último deployment
3. Click en **"Logs"**
4. Busca errores relacionados con variables de entorno

Errores comunes:
- `Environment variable not found`
- `Missing required environment variable`
- `Invalid environment variable format`

---

## Checklist de Verificación

### ✅ Formato Correcto:

#### NEXT_PUBLIC_SUPABASE_URL
- ✅ Debe comenzar con `https://`
- ✅ Debe terminar con `.supabase.co`
- ✅ Ejemplo: `https://yqggrzxjhylnxjuagfyr.supabase.co`

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ Debe comenzar con `sb_publishable_`
- ✅ Ejemplo: `sb_publishable_TGYS5tsv3tEY9rxHx9-ZHQ_F9a64G0t`

#### SUPABASE_SERVICE_ROLE_KEY
- ✅ Debe comenzar con `sb_secret_`
- ✅ Ejemplo: `sb_secret_Aes4CjU2mwX2R1zgJyWibQ_FytVUNSR`
- ⚠️ **SECRETO** - No compartir

#### JWT_SECRET
- ✅ Debe tener al menos 32 caracteres
- ✅ Ejemplo: `13563b39610b84049b90187f2338925c4bf0ade9eb99c76b2595c0e7d2ce954e`
- ⚠️ **SECRETO** - No compartir

#### NEXT_PUBLIC_BASE_URL
- ✅ Debe comenzar con `https://`
- ✅ No debe contener `localhost`
- ✅ Ejemplo: `https://catalogo-indumentaria.vercel.app`

---

## Errores Comunes y Soluciones

### Error: "Environment variable not found"

**Solución:**
1. Verificar que la variable esté en el ambiente correcto (Production/Preview/Development)
2. Verificar que el nombre coincida exactamente (case-sensitive)
3. Hacer redeploy después de agregar la variable

### Error: "Invalid format"

**Solución:**
1. Verificar que el valor no tenga espacios al inicio o final
2. Verificar que el formato coincida con los ejemplos
3. Copiar y pegar el valor completo sin cortarlo

### Error: "Build failed"

**Solución:**
1. Revisar logs en Vercel Dashboard
2. Verificar que todas las variables requeridas estén configuradas
3. Ejecutar `pnpm build` localmente para verificar errores

---

## Próximos Pasos

Una vez verificadas las variables:

1. ✅ Hacer deploy (si aún no lo hiciste)
2. ✅ Verificar que el sitio carga correctamente
3. ✅ Probar funcionalidades básicas
4. ✅ Verificar logs en Vercel Dashboard

---

**Última actualización:** Noviembre 2025

