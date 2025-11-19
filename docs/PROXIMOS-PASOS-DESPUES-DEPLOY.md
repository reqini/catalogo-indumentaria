# 📋 Próximos Pasos Después del Deploy

## ✅ Paso 1: Verificar que el Deploy fue Exitoso

### 1.1. Revisar Estado en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto: `catalogo-indumentaria`
3. Ve a la pestaña **Deployments**
4. Verifica que el último deployment tenga status: **✅ Ready**

### 1.2. Verificar Logs

1. Click en el último deployment
2. Click en **"Logs"**
3. Verifica que no haya errores críticos
4. Busca mensajes como:
   - ✅ "Build completed"
   - ✅ "Deployment ready"
   - ❌ Si ves errores, compártelos para corregirlos

---

## ✅ Paso 2: Verificar que el Sitio Carga Correctamente

### 2.1. Abrir el Sitio

1. En Vercel Dashboard, click en **"Visit"** del último deployment
2. O visita directamente: `https://tu-proyecto.vercel.app/`

### 2.2. Checklist de Verificación Inicial

- [ ] El sitio carga sin errores
- [ ] No hay errores en la consola del navegador (F12 → Console)
- [ ] La página se ve correctamente
- [ ] No hay errores 404 o 500

---

## ✅ Paso 3: Verificar Variables de Entorno

### 3.1. Usar el Endpoint de Verificación

Visita:
```
https://tu-proyecto.vercel.app/api/verificar-env
```

Deberías ver un JSON con:
```json
{
  "status": "ok",
  "required": {
    "valid": {
      "NEXT_PUBLIC_SUPABASE_URL": true,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": true,
      "SUPABASE_SERVICE_ROLE_KEY": true,
      "JWT_SECRET": true,
      "NEXT_PUBLIC_BASE_URL": true
    },
    "missing": []
  },
  "warnings": []
}
```

### 3.2. Si Hay Problemas

- Si `status` es `"warning"` o hay `missing`, revisa las variables en Vercel Dashboard
- Si hay `warnings`, revisa los formatos de las variables

---

## ✅ Paso 4: Probar Funcionalidades Básicas

### 4.1. Home Page

1. Visita: `https://tu-proyecto.vercel.app/`
2. Verifica que:
   - [ ] La página carga correctamente
   - [ ] Se muestran productos (si hay en la DB)
   - [ ] Las imágenes cargan
   - [ ] Los banners se muestran (si hay)

### 4.2. Catálogo

1. Visita: `https://tu-proyecto.vercel.app/catalogo`
2. Verifica que:
   - [ ] El catálogo carga
   - [ ] Los productos se muestran
   - [ ] Los filtros funcionan
   - [ ] La búsqueda funciona

### 4.3. Admin Panel

1. Visita: `https://tu-proyecto.vercel.app/admin/login`
2. Intenta hacer login con:
   - Email: `admin@catalogo.com`
   - Password: `admin123`
3. Verifica que:
   - [ ] El login funciona
   - [ ] El dashboard carga
   - [ ] Puedes ver la lista de productos

---

## ✅ Paso 5: Probar CRUD de Productos

### 5.1. Crear Producto

1. Ve a Admin → Productos
2. Click en **"Nuevo Producto"**
3. Completa el formulario:
   - Nombre, precio, descripción
   - Categoría, colores, talles
   - Stock por talle
   - Sube una imagen
4. Click en **"Guardar"**
5. Verifica que:
   - [ ] El producto se crea correctamente
   - [ ] Aparece en la lista
   - [ ] Se muestra en el catálogo público

### 5.2. Editar Producto

1. Click en el botón de editar de un producto
2. Modifica algún campo
3. Guarda los cambios
4. Verifica que:
   - [ ] Los cambios se guardan
   - [ ] Se reflejan en el catálogo

### 5.3. Eliminar Producto

1. Click en eliminar un producto
2. Confirma la eliminación
3. Verifica que:
   - [ ] El producto se elimina
   - [ ] Ya no aparece en el catálogo

---

## ✅ Paso 6: Verificar Supabase Storage

### 6.1. Verificar Bucket

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Storage**
4. Verifica que existe el bucket `productos`
5. Verifica que es **público**

### 6.2. Probar Subida de Imagen

1. En Admin → Productos → Crear/Editar
2. Intenta subir una imagen
3. Verifica que:
   - [ ] La imagen se sube correctamente
   - [ ] Se muestra el preview
   - [ ] Se guarda en Supabase Storage
   - [ ] Se muestra en el producto

---

## ⚠️ Paso 7: Configurar Dominio Personalizado (Opcional)

### 7.1. Agregar Dominio en Vercel

1. Ve a Vercel Dashboard → **Settings** → **Domains**
2. Click en **"Add"**
3. Ingresa tu dominio (ej: `micatalogo.com`)
4. Sigue las instrucciones de Vercel

### 7.2. Configurar DNS

Vercel te dará instrucciones específicas:
- Generalmente necesitas agregar un registro CNAME o A
- Puede tardar hasta 48 horas en propagarse

### 7.3. Actualizar NEXT_PUBLIC_BASE_URL

1. Ve a Vercel Dashboard → **Settings** → **Environment Variables**
2. Edita `NEXT_PUBLIC_BASE_URL`
3. Cambia a: `https://tu-dominio.com`
4. Guarda
5. Haz redeploy

---

## ⚠️ Paso 8: Configurar Mercado Pago (Cuando Esté Listo)

### 8.1. Crear Aplicación en Mercado Pago

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crea una nueva aplicación
3. Selecciona **"Producción"** (no test)
4. Copia el **Access Token** de producción

### 8.2. Configurar Webhook

1. En Mercado Pago Dashboard → **Webhooks**
2. Agrega nuevo webhook:
   - **URL:** `https://tu-dominio.com/api/mp/webhook`
   - **Eventos:** payment, merchant_order
3. Copia el **Webhook Secret**

### 8.3. Agregar Variables en Vercel

1. Ve a Vercel Dashboard → **Settings** → **Environment Variables**
2. Agrega:
   - `MP_ACCESS_TOKEN` = [Token de producción]
   - `MP_WEBHOOK_SECRET` = [Webhook secret]
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` = [Public key de producción]
3. Guarda
4. Haz redeploy

### 8.4. Probar Flujo de Compra

1. Agrega un producto al carrito
2. Ve a checkout
3. Completa el pago de prueba
4. Verifica que:
   - [ ] El webhook funciona
   - [ ] El stock se actualiza
   - [ ] Se registra la compra

---

## ✅ Paso 9: Testing Completo

### 9.1. Checklist de Funcionalidades

#### Home y Catálogo:
- [ ] Home carga correctamente
- [ ] Banners se muestran
- [ ] Productos destacados se muestran
- [ ] Catálogo muestra todos los productos
- [ ] Filtros funcionan
- [ ] Búsqueda funciona
- [ ] Detalle de producto funciona

#### Admin:
- [ ] Login funciona
- [ ] Dashboard carga
- [ ] Crear producto funciona
- [ ] Editar producto funciona
- [ ] Eliminar producto funciona
- [ ] Subir imagen funciona
- [ ] Búsqueda y filtros en admin funcionan
- [ ] Historial de cambios funciona

#### Compra:
- [ ] Agregar al carrito funciona
- [ ] Carrito muestra productos correctamente
- [ ] Modificar cantidad funciona
- [ ] Eliminar del carrito funciona
- [ ] Checkout funciona
- [ ] Mercado Pago redirige correctamente
- [ ] Webhook funciona
- [ ] Stock se actualiza después de compra

---

## ✅ Paso 10: Configurar Backups

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Database** → **Backups**
4. Configura backups automáticos:
   - **Frecuencia:** Diario
   - **Retención:** 30 días
5. Guarda configuración

---

## 📊 Resumen de Próximos Pasos

### Inmediatos (Hoy):
1. ✅ Verificar que el deploy fue exitoso
2. ✅ Verificar que el sitio carga
3. ✅ Verificar variables de entorno
4. ✅ Probar funcionalidades básicas

### Esta Semana:
5. ✅ Probar CRUD completo de productos
6. ✅ Verificar Supabase Storage
7. ⚠️ Configurar dominio personalizado (opcional)

### Cuando Esté Listo:
8. ⚠️ Configurar Mercado Pago en producción
9. ✅ Testing completo
10. ✅ Configurar backups

---

## 🆘 Si Algo No Funciona

### Error: "Site not found"
- Verifica que el deploy fue exitoso
- Verifica que estás usando la URL correcta

### Error: "Variables not found"
- Ve a Vercel Dashboard → Settings → Environment Variables
- Verifica que todas las variables estén configuradas
- Haz redeploy después de agregar variables

### Error: "Supabase connection failed"
- Verifica las variables de Supabase en Vercel
- Verifica que el proyecto de Supabase esté activo

### Error: "Build failed"
- Revisa los logs en Vercel Dashboard
- Comparte los errores para corregirlos

---

**Última actualización:** Noviembre 2025

