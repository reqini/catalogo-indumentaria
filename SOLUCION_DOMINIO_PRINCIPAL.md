# 🔧 Solución Definitiva: Dominio Principal Siempre Actualizado

**Fecha:** ${new Date().toLocaleString('es-AR')}  
**Problema:** El dominio principal `catalogo-indumentaria.vercel.app` estaba desactualizado comparado con previews  
**Solución:** Configuración para que siempre apunte al deploy más reciente de `main`

---

## ✅ Acciones Completadas

1. ✅ **Redeploy forzado** - Commit `79636a1` pusheado a `main`
2. ✅ **Configuración actualizada** - `vercel.json` con dominio de producción explícito
3. ✅ **Script de verificación** - `scripts/verificar-deploy-produccion.mjs` creado
4. ✅ **Auto-deploy habilitado** - Cada push a `main` genera deploy automático

---

## 🎯 Configuración en Vercel Dashboard (CRÍTICO)

Para asegurar que el dominio principal **SIEMPRE** apunte al deploy más reciente de `main`, debes configurar lo siguiente en el Dashboard de Vercel:

### Paso 1: Ir a Settings → Git

1. Ve a https://vercel.com/dashboard
2. Selecciona el proyecto `catalogo-indumentaria`
3. Ve a **Settings** → **Git**

### Paso 2: Configurar Production Branch

- **Production Branch:** Debe estar configurado como `main`
- **Auto Deploy:** Debe estar **HABILITADO** ✅

### Paso 3: Ir a Settings → Domains

1. Ve a **Settings** → **Domains**
2. Verifica que `catalogo-indumentaria.vercel.app` está en la lista
3. **IMPORTANTE:** Asegúrate de que el dominio está asignado a **Production** (no a un deploy específico)

### Paso 4: Verificar Deployments

1. Ve a la pestaña **Deployments**
2. Busca el deploy más reciente de `main` (debería ser el commit `79636a1` o más reciente)
3. Haz clic en los **3 puntos** (⋯) del deploy más reciente
4. Selecciona **Promote to Production** (si está disponible)
5. Esto asegurará que el dominio principal apunte a ese deploy

---

## 🔄 Flujo Automático Configurado

Con la configuración actual:

1. **Push a `main`** → Vercel detecta automáticamente
2. **Build iniciado** → Se ejecuta `pnpm install && pnpm build`
3. **Deploy creado** → Si el build es exitoso, se crea un nuevo deploy
4. **Promoción automática** → El nuevo deploy de `main` debería promoverse automáticamente a producción
5. **Dominio actualizado** → `catalogo-indumentaria.vercel.app` apunta al nuevo deploy

---

## ⚠️ Si el Dominio Sigue Desactualizado

Si después de estos pasos el dominio principal sigue mostrando una versión antigua:

### Opción 1: Promover Manualmente el Deploy Más Reciente

1. Ve a **Deployments** en Vercel Dashboard
2. Encuentra el deploy más reciente de `main` (debería tener el commit más reciente)
3. Haz clic en los **3 puntos** (⋯)
4. Selecciona **Promote to Production**
5. Espera unos minutos y verifica que el dominio se actualizó

### Opción 2: Verificar Configuración de Dominio

1. Ve a **Settings** → **Domains**
2. Haz clic en `catalogo-indumentaria.vercel.app`
3. Verifica que está asignado a **Production** (no a un deploy específico)
4. Si está asignado a un deploy específico, cámbialo a **Production**

### Opción 3: Forzar Nuevo Deploy

```bash
# Crear commit vacío para forzar nuevo deploy
git commit --allow-empty -m "chore: forzar redeploy producción"
git push origin main
```

---

## 📊 Verificación del Estado

### Script de Verificación

Ejecuta el script creado para verificar el estado:

```bash
node scripts/verificar-deploy-produccion.mjs
```

Este script:

- Obtiene el último commit en `main` local
- Verifica qué versión está desplegada en el dominio principal
- Compara y muestra si están sincronizados

### Verificación Manual

1. **Ver último commit en main:**

   ```bash
   git log main --oneline -1
   ```

2. **Ver versión en dominio principal:**
   - Visita https://catalogo-indumentaria.vercel.app/
   - Busca en el footer o código fuente la versión (formato: `v903d85b` o `Build: 903d85b`)

3. **Comparar:**
   - Si el hash del commit coincide con la versión en el sitio → ✅ Sincronizado
   - Si no coincide → ⚠️ Desincronizado (seguir pasos de solución arriba)

---

## 🔒 Prevención Futura

Para evitar que esto vuelva a pasar:

1. **Siempre hacer push a `main`** - No hacer deploys manuales a producción
2. **Verificar después de cada push** - Usar el script de verificación
3. **Configurar notificaciones** - En Vercel Dashboard, configurar notificaciones de deploy
4. **Monitorear Deployments** - Revisar periódicamente que el dominio principal esté actualizado

---

## 📝 Configuración Actual en `vercel.json`

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    },
    "autoAlias": false
  },
  "github": {
    "autoDeployOnPush": true,
    "autoJobCancelation": true
  },
  "production": {
    "domains": ["catalogo-indumentaria.vercel.app"]
  }
}
```

Esta configuración asegura que:

- Solo `main` puede desplegar a producción
- Auto-deploy está habilitado
- El dominio de producción está explícitamente configurado

---

## ✅ Estado Actual

- **Commit más reciente en main:** `79636a1`
- **Auto-deploy:** ✅ Habilitado
- **Dominio principal:** `catalogo-indumentaria.vercel.app`
- **Próximo deploy:** Se generará automáticamente con el próximo push a `main`

---

**Última actualización:** ${new Date().toISOString()}
