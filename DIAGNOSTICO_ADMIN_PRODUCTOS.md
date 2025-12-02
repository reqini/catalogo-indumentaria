# 🔍 DIAGNÓSTICO: Admin no ve productos

## ✅ Cambios Realizados

Se mejoró el manejo de errores y se agregaron logs detallados para identificar el problema.

## 🔍 Cómo Diagnosticar

### Paso 1: Abrir la Consola del Navegador

1. Abrir el sitio en el navegador
2. Presionar `F12` o `Cmd+Option+I` (Mac) para abrir DevTools
3. Ir a la pestaña **Console**

### Paso 2: Intentar Login

1. Ir a `/admin/login`
2. Ingresar credenciales
3. **Revisar los logs en la consola:**

**✅ Logs esperados (login exitoso):**

```
[API-CLIENT] 📤 Iniciando login para: admin@catalogo.com
[API-CLIENT] ✅ Token agregado al header Authorization
[API-CLIENT] ✅ Login exitoso: { hasToken: true, hasTenant: true, tenantId: "..." }
[ADMIN-LOGIN] ✅ Login exitoso, guardando token...
[ADMIN-LOGIN] ✅ Token guardado en cookie
[ADMIN-LOGIN] ✅ Token guardado en localStorage y contexto
```

**❌ Si ves estos logs (problema identificado):**

```
[API-CLIENT] ⚠️ No se encontró token en localStorage ni cookies
[API-LOGIN] ❌ Error obteniendo tenant: Supabase no está configurado
[SUPABASE-HELPERS] ❌ Supabase no está configurado. No se puede obtener tenant por email.
```

### Paso 3: Verificar Productos

1. Después del login, ir a `/admin/productos`
2. **Revisar los logs en la consola:**

**✅ Logs esperados (productos cargados):**

```
[ADMIN-PRODUCTOS] 📤 Iniciando carga de productos...
[API-CLIENT] 📤 Obteniendo productos con filtros: {}
[API-CLIENT] ✅ Token agregado al header Authorization
[API-CLIENT] 📤 URL: /api/productos
[API-PRODUCTOS] 📥 GET request recibido
[API-PRODUCTOS] ✅ Tenant obtenido del token: tenant-123
[API-PRODUCTOS] 🔍 Filtros aplicados: { tenantId: "tenant-123" }
[SUPABASE-HELPERS] ✅ Obtenidos 5 productos
[API-PRODUCTOS] ✅ Obtenidos 5 productos
[API-CLIENT] ✅ Respuesta recibida: { status: 200, productosCount: 5 }
[ADMIN-PRODUCTOS] ✅ Productos cargados: 5
```

**❌ Si ves estos logs (problema identificado):**

```
[SUPABASE-HELPERS] ❌ Supabase no está configurado. No se pueden obtener productos.
[API-PRODUCTOS] ⚠️ Supabase no configurado, retornando array vacío
[ADMIN-PRODUCTOS] ⚠️ No se encontraron productos
```

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "Supabase no está configurado"

**Síntomas:**

- Logs muestran: `Supabase no está configurado`
- No se ven productos (array vacío)
- Login puede funcionar pero productos no

**Solución:**

1. Configurar variables de entorno en Netlify/Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (opcional pero recomendado)
2. Hacer REDEPLOY después de agregar variables

### Problema 2: "Token no encontrado"

**Síntomas:**

- Logs muestran: `No se encontró token en localStorage ni cookies`
- No se pueden obtener productos del tenant específico
- Se muestran productos públicos en lugar de los del admin

**Solución:**

1. Verificar que el login guarde el token correctamente
2. Verificar que el token esté en `localStorage.getItem('token')`
3. Verificar que el interceptor de axios agregue el token al header

### Problema 3: "Tenant no encontrado"

**Síntomas:**

- Logs muestran: `Tenant no encontrado para email: ...`
- Login falla o retorna error 401

**Solución:**

1. Verificar que el usuario exista en Supabase (tabla `tenants`)
2. Verificar que el email sea correcto (case-insensitive)
3. Verificar que el tenant esté activo (`activo = true`)

### Problema 4: "No hay productos para este tenant"

**Síntomas:**

- Login funciona
- Token se envía correctamente
- Pero no hay productos en la respuesta

**Solución:**

1. Verificar que existan productos en Supabase (tabla `productos`)
2. Verificar que los productos tengan `tenant_id` correcto
3. Verificar que los productos estén activos (`activo = true`)

## 📋 Checklist de Verificación

- [ ] Variables de Supabase configuradas en Netlify/Vercel
- [ ] REDEPLOY realizado después de agregar variables
- [ ] Login funciona y retorna token
- [ ] Token se guarda en localStorage
- [ ] Token se envía en header Authorization
- [ ] Tenant se obtiene correctamente del token
- [ ] Existen productos en Supabase para el tenant
- [ ] Los productos tienen `tenant_id` correcto
- [ ] Los productos están activos

## 🔧 Verificar en Supabase Dashboard

1. Ir a https://supabase.com/dashboard
2. Seleccionar tu proyecto
3. Ir a **Table Editor**
4. Verificar tabla `tenants`:
   - Debe existir tu usuario
   - Email debe coincidir
   - `activo` debe ser `true`
5. Verificar tabla `productos`:
   - Debe haber productos
   - `tenant_id` debe coincidir con tu `tenant_id`
   - `activo` debe ser `true` (si quieres verlos)

## 📝 Logs Importantes a Revisar

### En el Navegador (Console):

- `[API-CLIENT]` - Cliente haciendo peticiones
- `[ADMIN-LOGIN]` - Proceso de login
- `[ADMIN-PRODUCTOS]` - Carga de productos

### En el Servidor (Vercel/Netlify Logs):

- `[API-LOGIN]` - Login en servidor
- `[API-PRODUCTOS]` - Obtención de productos
- `[SUPABASE-HELPERS]` - Operaciones con Supabase

## 🎯 Próximos Pasos

1. **Abrir consola del navegador** y revisar logs
2. **Intentar login** y ver qué logs aparecen
3. **Ir a productos** y ver qué logs aparecen
4. **Compartir los logs** para identificar el problema específico

Los logs ahora son muy detallados y te dirán exactamente dónde está el problema.
