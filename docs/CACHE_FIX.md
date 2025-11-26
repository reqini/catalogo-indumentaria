# 🔧 Fix de Cache Agresivo - Solución Definitiva

**Fecha:** 2024-11-26  
**Prioridad:** 🔴 CRÍTICA  
**Estado:** ✅ **SOLUCIONADO**

---

## 🚨 Problemas Identificados

### Problema 1: Cache Agresivo en Producción

- **Síntoma:** Necesidad de borrar cache manualmente para ver última versión
- **Causa:** Service Worker cacheando páginas HTML con estrategia "Cache First"
- **Impacto:** Usuarios ven versiones viejas del sitio

### Problema 2: Versión Vieja en Local

- **Síntoma:** Versión vieja visible en desarrollo local
- **Causa:** Service Worker activo desde sesiones anteriores
- **Impacto:** Desarrollo bloqueado, no se ven cambios

---

## ✅ Soluciones Aplicadas

### 1. Desregistro Automático de Service Workers

**Archivo:** `app/layout.tsx`

**Cambio:**

- Script que desregistra TODOS los Service Workers existentes al cargar la página
- Limpia TODOS los caches del navegador automáticamente
- Se ejecuta en cada carga de página

**Código:**

```javascript
// Desregistrar todos los Service Workers existentes
navigator.serviceWorker.getRegistrations().then(function (registrations) {
  for (let registration of registrations) {
    registration.unregister()
  }
})

// Limpiar todos los caches
caches.keys().then(function (names) {
  for (let name of names) {
    caches.delete(name)
  }
})
```

---

### 2. Service Worker con Network First Siempre

**Archivo:** `public/sw.js`

**Cambios:**

- Cambiado a **Network First** siempre (nunca cache)
- Version dinámica del cache name para forzar actualización
- Páginas HTML nunca se cachean
- API requests nunca se cachean
- Solo fallback a cache si la red falla completamente

**Código clave:**

```javascript
const NETWORK_FIRST = true // Siempre usar red primero
const CACHE_NAME = 'catalogo-indumentaria-v' + Date.now() // Version dinámica

// Network First siempre
event.respondWith(
  fetch(request, { cache: 'no-store' }).then((response) => {
    // No cachear páginas HTML
    return response
  })
)
```

---

### 3. Headers de No-Cache Mejorados

**Archivo:** `next.config.js`

**Cambios:**

- Agregado `Pragma: no-cache`
- Agregado `Expires: 0`
- Mantenido `Cache-Control: no-store, no-cache, must-revalidate`

**Código:**

```javascript
{
  key: 'Cache-Control',
  value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, Pragma: no-cache',
},
{
  key: 'Pragma',
  value: 'no-cache',
},
{
  key: 'Expires',
  value: '0',
}
```

---

### 4. Configuración de Vercel

**Archivo:** `vercel.json`

**Cambios:**

- Headers de no-cache para todas las rutas (`/(.*)`)
- Cache solo para assets estáticos de Next.js (`/_next/static/(.*)`)
- Headers explícitos para producción

---

## 🧪 Cómo Verificar que Funciona

### En Producción:

1. **Abrir DevTools → Application → Service Workers**
   - ✅ No debe haber Service Workers registrados
   - ✅ Si hay alguno, debe estar "unregistered"

2. **Abrir DevTools → Application → Cache Storage**
   - ✅ No debe haber caches activos
   - ✅ Si hay alguno, debe estar vacío o eliminado

3. **Abrir DevTools → Network → Disable cache**
   - ✅ Desactivar "Disable cache"
   - ✅ Recargar página
   - ✅ Verificar que carga versión nueva sin borrar cache manualmente

4. **Verificar Headers de Respuesta:**
   - ✅ `Cache-Control: no-store, no-cache...`
   - ✅ `Pragma: no-cache`
   - ✅ `Expires: 0`

### En Local:

1. **Limpiar cache manualmente UNA VEZ:**

   ```bash
   # En DevTools:
   # Application → Clear storage → Clear site data
   ```

2. **Verificar que Service Worker se desregistra:**
   - Abrir consola
   - Ver logs: `[CACHE FIX] Desregistrando Service Worker`
   - Ver logs: `[CACHE FIX] Eliminando cache`

3. **Recargar página:**
   - ✅ Debe cargar versión nueva automáticamente
   - ✅ No debe necesitar borrar cache manualmente

---

## 🔍 Troubleshooting

### Si Aún Ves Versión Vieja:

1. **Limpiar cache manualmente UNA VEZ:**
   - Chrome: `Ctrl+Shift+Delete` → Clear browsing data → Cached images and files
   - Firefox: `Ctrl+Shift+Delete` → Cache
   - Safari: `Cmd+Option+E` → Empty Caches

2. **Desregistrar Service Workers manualmente:**
   - DevTools → Application → Service Workers
   - Click en "Unregister" en cada uno

3. **Hard Reload:**
   - Chrome: `Ctrl+Shift+R` o `Cmd+Shift+R`
   - Firefox: `Ctrl+F5` o `Cmd+Shift+R`
   - Safari: `Cmd+Option+R`

4. **Verificar que el deploy se completó:**
   - Vercel Dashboard → Deployments
   - Verificar que el último deploy está activo

---

## 📋 Checklist Post-Deploy

- [ ] Verificar que Service Workers se desregistran (consola del navegador)
- [ ] Verificar que caches se limpian (consola del navegador)
- [ ] Verificar headers de respuesta (DevTools → Network)
- [ ] Probar recarga sin borrar cache manualmente
- [ ] Verificar que carga versión nueva
- [ ] Probar en modo incógnito (no debe tener cache previo)

---

## 🎯 Resultado Esperado

**Antes:**

- ❌ Necesidad de borrar cache manualmente
- ❌ Versión vieja visible
- ❌ Service Worker cacheando agresivamente

**Después:**

- ✅ Cache se limpia automáticamente
- ✅ Versión nueva visible inmediatamente
- ✅ Service Worker deshabilitado o usando Network First
- ✅ Headers de no-cache en todas las respuestas

---

**Última actualización:** 2024-11-26  
**Estado:** ✅ **SOLUCIONADO**
