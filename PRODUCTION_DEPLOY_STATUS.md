# 🚀 Estado de Deploy en Producción - Catálogo Indumentaria

**Fecha de generación:** ${new Date().toLocaleString('es-AR')}  
**Última actualización:** ${new Date().toISOString()}

---

## 📋 Configuración de Producción

### 🌐 Dominio Principal

**URL de Producción:** `https://catalogo-indumentaria.vercel.app`

**Estado:** ✅ Configurado como dominio principal único de producción

**Nota:** Este dominio está configurado para apuntar exclusivamente a la rama `main` y se actualiza automáticamente con cada deploy exitoso.

---

## 🌿 Branch de Producción

**Branch configurado:** `main`

**Estado:** ✅ Habilitado como única fuente de deploy productivo

**Auto-deploy:** ✅ Habilitado (`autoDeployOnPush: true`)

**Configuración:**

- Cada push a `main` genera deploy automático
- Cada merge a `main` genera deploy automático
- Cada actualización del historial de `main` genera deploy automático
- Deploys exitosos reemplazan automáticamente la versión anterior en producción

---

## 🔒 Restricciones de Deploy

### Branches habilitados para producción

- ✅ `main` - ÚNICO branch autorizado para producción
- ❌ Todos los demás branches - Solo generan previews temporales

### Previews

**Estado:** ✅ Habilitados solo para branches que NO sean `main`

**URLs:** Previews quedan en URLs temporales de Vercel (formato: `catalogo-indumentaria-[hash]-[team].vercel.app`)

**Comportamiento:**

- Previews NO pueden reemplazar el dominio principal
- Previews NO interfieren con producción
- Previews se eliminan automáticamente después de un tiempo

---

## 📦 Commit Activo Actual

**Commit SHA:** `903d85b`

**Mensaje:** `docs(qa): QA manual extremo completo - 32 casos de prueba documentados + checklist mobile + CSV exportable`

**Fecha:** ${new Date().toLocaleString('es-AR')}

**Branch:** `main`

**Estado:** ✅ Desplegado o pendiente de deploy automático

---

## 📝 Commit Estable de Referencia

**Commit SHA:** `b52e62c`

**Mensaje:** `fix(mercadopago): mejora crítica validación token + script diagnóstico completo`

**Nota:** Este commit fue marcado como versión estable. El sistema está configurado para que el dominio principal siempre refleje el último commit en `main`.

---

## ⚙️ Configuración de Vercel

### Archivo: `vercel.json`

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
    "autoJobCancelation": true,
    "silent": false
  }
}
```

### Configuración aplicada:

- ✅ **`deploymentEnabled.main: true`** - Solo `main` puede desplegar a producción
- ✅ **`autoDeployOnPush: true`** - Auto-deploy habilitado para pushes a `main`
- ✅ **`autoAlias: false`** - Evita aliases automáticos que puedan crear confusión
- ✅ **`autoJobCancelation: true`** - Cancela deploys anteriores si hay uno nuevo

---

## 🔄 Flujo de Deploy Automático

### Proceso actual:

1. **Push a `main`** → Vercel detecta el cambio automáticamente
2. **Build iniciado** → Vercel ejecuta `pnpm install --frozen-lockfile && pnpm prebuild:vercel && pnpm build`
3. **Deploy creado** → Si el build es exitoso, se crea un nuevo deploy
4. **Reemplazo automático** → El nuevo deploy reemplaza automáticamente la versión anterior en `catalogo-indumentaria.vercel.app`
5. **Verificación** → El dominio principal queda apuntando a la nueva versión

### Tiempo estimado:

- **Detección:** Inmediata (< 10 segundos)
- **Build:** 2-5 minutos (dependiendo de cambios)
- **Deploy:** 30-60 segundos
- **Total:** ~3-6 minutos desde push hasta producción

---

## ✅ Verificación de Estado

### Checklist de configuración:

- [x] Branch `main` configurado como producción
- [x] Auto-deploy habilitado para `main`
- [x] Dominio principal configurado: `catalogo-indumentaria.vercel.app`
- [x] Otros branches solo generan previews
- [x] Deploys manuales no interfieren con producción
- [x] Configuración documentada en `vercel.json`

### Estado del sistema:

**✅ Deploy automático habilitado permanentemente**

**✅ Dominio principal sincronizado con `main`**

---

## 📊 Historial de Deploys

### Último deploy:

- **Commit:** `903d85b`
- **Branch:** `main`
- **Estado:** ✅ Exitoso (o pendiente)
- **Timestamp:** ${new Date().toISOString()}

### Próximo deploy automático:

Se generará automáticamente cuando:

- Se haga push a `main`
- Se haga merge a `main`
- Se actualice el historial de `main`

---

## 🛠️ Comandos Útiles

### Verificar estado del deploy:

```bash
# Ver último commit en main
git log main --oneline -1

# Verificar configuración de Vercel
cat vercel.json | grep -A 10 "git"

# Verificar que estamos en main
git branch --show-current
```

### Forzar redeploy (si es necesario):

```bash
# Crear commit vacío para forzar redeploy
git commit --allow-empty -m "chore: forzar redeploy a producción"
git push origin main
```

---

## ⚠️ Notas Importantes

1. **No hacer deploy manual a producción** - Solo `main` debe desplegar automáticamente
2. **No cambiar el dominio principal** - `catalogo-indumentaria.vercel.app` es el único dominio de producción
3. **Previews son temporales** - No usar URLs de preview como producción
4. **Verificar antes de mergear** - Asegurarse de que los cambios en `main` son estables

---

## 📞 Soporte

Si hay problemas con el deploy automático:

1. Verificar que el push fue a `main`
2. Revisar logs en Vercel Dashboard
3. Verificar que `vercel.json` tiene la configuración correcta
4. Verificar variables de entorno en Vercel

---

**Generado automáticamente:** ${new Date().toISOString()}  
**Versión del reporte:** 1.0.0
