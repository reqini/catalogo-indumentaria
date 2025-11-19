# 🚀 Guía Paso a Paso para Producción

## 📋 Paso 1: Generar JWT_SECRET

**Ejecuta:**
```bash
pnpm generar-jwt-secret
```

**Copia el secret generado** - Lo necesitarás en el siguiente paso.

---

## 📋 Paso 2: Configurar Variables en Vercel

### 2.1. Acceder a Vercel Dashboard

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto `catalogo-indumentaria`
4. Ve a **Settings** → **Environment Variables**

### 2.2. Agregar Variables Críticas

Para cada variable, haz click en **"Add New"** y completa:

#### ✅ Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://yqggrzxjhylnxjuagfyr.supabase.co` (tu Project URL)
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

#### ✅ Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `sb_publishable_TGYS5tsv3tEY9rxHx9-ZHQ_F9a64G0t` (tu anon key)
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

#### ✅ Variable 3: SUPABASE_SERVICE_ROLE_KEY
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `sb_secret_Aes4CjU2mwX2R1zgJyWibQ_FytVUNSR` (tu service role key)
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- ⚠️ **IMPORTANTE:** Esta es una clave secreta, no la compartas

#### ✅ Variable 4: JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** [El secret que generaste en el Paso 1]
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- ⚠️ **IMPORTANTE:** Debe tener al menos 32 caracteres

#### ✅ Variable 5: NEXT_PUBLIC_BASE_URL
- **Key:** `NEXT_PUBLIC_BASE_URL`
- **Value:** `https://tu-dominio.vercel.app` (por ahora usa el dominio de Vercel)
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- 📝 **Nota:** Después de configurar dominio personalizado, actualiza esto

#### ⚠️ Variable 6: MP_ACCESS_TOKEN (Opcional por ahora)
- **Key:** `MP_ACCESS_TOKEN`
- **Value:** [Token de producción de Mercado Pago]
- **Environment:** ✅ Production
- 📝 **Nota:** Si aún no tienes el token de producción, puedes dejarlo para después

#### ⚠️ Variable 7: MP_WEBHOOK_SECRET (Opcional por ahora)
- **Key:** `MP_WEBHOOK_SECRET`
- **Value:** [Webhook secret de Mercado Pago]
- **Environment:** ✅ Production
- 📝 **Nota:** Se configura después de crear el webhook

#### ⚠️ Variable 8: NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY (Opcional por ahora)
- **Key:** `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
- **Value:** [Public key de producción de Mercado Pago]
- **Environment:** ✅ Production
- 📝 **Nota:** Si aún no tienes el token de producción, puedes dejarlo para después

### 2.3. Verificar Variables

Después de agregar todas las variables:
1. Verifica que todas estén en la lista
2. Verifica que estén marcadas para "Production"
3. Haz click en **"Save"**

---

## 📋 Paso 3: Hacer Deploy

### Opción A: Deploy Automático (si está conectado a GitHub)

1. Los cambios ya están en GitHub (commit `b8c0a1f`)
2. Vercel detectará automáticamente el push
3. Ir a Vercel Dashboard → **Deployments**
4. Verificar que el deploy esté en progreso o completado

### Opción B: Deploy Manual

Si no está conectado a GitHub:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Deploy a producción
vercel --prod
```

---

## 📋 Paso 4: Verificar Deploy

Después del deploy:

1. **Ir a Vercel Dashboard → Deployments**
2. **Click en el último deployment**
3. **Click en "Visit"** para abrir el sitio
4. **Verificar que carga correctamente**

### Checklist de Verificación Inicial:

- [ ] El sitio carga sin errores
- [ ] La home page se ve correctamente
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs de Vercel

---

## 📋 Paso 5: Probar Funcionalidades Básicas

### 5.1. Probar Home y Catálogo

1. Visitar: `https://tu-proyecto.vercel.app/`
2. Verificar que se muestran productos (si hay en la DB)
3. Visitar: `https://tu-proyecto.vercel.app/catalogo`
4. Verificar que el catálogo carga

### 5.2. Probar Admin

1. Visitar: `https://tu-proyecto.vercel.app/admin/login`
2. Intentar login con credenciales de admin
3. Verificar que el dashboard carga

**Credenciales de prueba:**
- Email: `admin@catalogo.com`
- Password: `admin123`

---

## 📋 Paso 6: Configurar Dominio Personalizado (Opcional)

### 6.1. Agregar Dominio en Vercel

1. Ir a Vercel Dashboard → **Settings** → **Domains**
2. Click en **"Add"**
3. Ingresar tu dominio (ej: `micatalogo.com`)
4. Seguir las instrucciones de Vercel

### 6.2. Configurar DNS

Vercel te dará instrucciones específicas, generalmente:

- **Tipo A:** Apuntar a la IP de Vercel
- **Tipo CNAME:** Apuntar a `cname.vercel-dns.com`

### 6.3. Actualizar NEXT_PUBLIC_BASE_URL

Después de que el dominio esté funcionando:

1. Ir a Vercel Dashboard → **Settings** → **Environment Variables**
2. Editar `NEXT_PUBLIC_BASE_URL`
3. Cambiar a: `https://tu-dominio.com`
4. Guardar
5. Hacer redeploy

---

## 📋 Paso 7: Configurar Mercado Pago (Cuando esté listo)

### 7.1. Crear Aplicación en Mercado Pago

1. Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crear una nueva aplicación
3. Seleccionar **"Producción"** (no test)
4. Copiar el **Access Token** de producción

### 7.2. Configurar Webhook

1. En Mercado Pago Dashboard, ir a **Webhooks**
2. Agregar nuevo webhook:
   - **URL:** `https://tu-dominio.com/api/mp/webhook`
   - **Eventos:** payment, merchant_order
3. Copiar el **Webhook Secret**

### 7.3. Agregar Variables en Vercel

1. Ir a Vercel Dashboard → **Settings** → **Environment Variables**
2. Agregar:
   - `MP_ACCESS_TOKEN` = [Token de producción]
   - `MP_WEBHOOK_SECRET` = [Webhook secret]
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` = [Public key de producción]
3. Guardar
4. Hacer redeploy

### 7.4. Probar Flujo de Pago

1. Agregar producto al carrito
2. Ir a checkout
3. Completar pago de prueba
4. Verificar que el webhook funciona
5. Verificar que el stock se actualiza

---

## 📋 Paso 8: Verificar Supabase Storage

### 8.1. Verificar Bucket

1. Ir a Supabase Dashboard → **Storage**
2. Verificar que existe el bucket `productos`
3. Verificar que es **público**

### 8.2. Probar Subida de Imagen

1. Ir a Admin → Productos
2. Crear nuevo producto
3. Intentar subir una imagen
4. Verificar que se guarda en Supabase Storage

---

## 📋 Paso 9: Configurar Backups

1. Ir a Supabase Dashboard → **Database** → **Backups**
2. Configurar backups automáticos:
   - **Frecuencia:** Diario
   - **Retención:** 30 días
3. Guardar configuración

---

## 📋 Paso 10: Testing Completo

Ejecutar el checklist completo de pruebas:

### Funcionalidades Básicas:
- [ ] Home page carga correctamente
- [ ] Catálogo muestra productos
- [ ] Búsqueda funciona
- [ ] Filtros funcionan

### Admin:
- [ ] Login funciona
- [ ] Crear producto funciona
- [ ] Editar producto funciona
- [ ] Eliminar producto funciona
- [ ] Subir imagen funciona
- [ ] Búsqueda y filtros en admin funcionan

### Compra:
- [ ] Agregar al carrito funciona
- [ ] Carrito muestra productos correctamente
- [ ] Checkout funciona
- [ ] Mercado Pago redirige correctamente
- [ ] Webhook funciona
- [ ] Stock se actualiza después de compra

---

## 🆘 Troubleshooting

### Error: "Environment variables not found"
- Verificar que las variables estén en "Production"
- Verificar que los nombres coincidan exactamente
- Hacer redeploy después de agregar variables

### Error: "Supabase connection failed"
- Verificar que las variables de Supabase estén correctas
- Verificar que el proyecto de Supabase esté activo
- Revisar logs en Vercel Dashboard

### Error: "Build failed"
- Revisar logs en Vercel Dashboard
- Verificar que `pnpm build` funciona localmente
- Verificar que todas las variables requeridas estén configuradas

---

## 📞 Próximos Pasos

Una vez completados estos pasos:

1. ✅ Variables configuradas
2. ✅ Deploy funcionando
3. ✅ Dominio configurado (opcional)
4. ✅ Mercado Pago configurado (cuando esté listo)
5. ✅ Testing completo

**¡Tu aplicación estará lista para producción!** 🎉

---

**Última actualización:** Noviembre 2025

