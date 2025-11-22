# 🚀 Deploy Automático a Producción

## 📋 Configuración Completa

Este proyecto está configurado para hacer **deploy automático a producción** cada vez que se hace push al branch `main`.

---

## ⚙️ Cómo Funciona

### Flujo Automático

```
Push a main
    ↓
GitHub Actions se activa
    ↓
Ejecuta tests (typecheck, lint)
    ↓
Deploy a Vercel Production
    ↓
catalogo-indumentaria.vercel.app actualizado
```

### Archivos Configurados

1. **`.github/workflows/deploy-prod.yml`**
   - Workflow de GitHub Actions
   - Se ejecuta automáticamente en push a `main`
   - Hace deploy directo a producción

2. **`vercel.json`**
   - Configuración de Vercel
   - `main` branch → producción automática
   - Preview builds desactivados para `main`

3. **`next.config.js`**
   - Expone variables de entorno de Vercel
   - Incluye `NEXT_PUBLIC_BUILD_ID` para versioning

4. **`components/Footer.tsx`**
   - Muestra versión actual del deploy
   - Visible en todas las páginas

---

## 🔑 Configuración Requerida

### 1. Secrets en GitHub

Ir a: **GitHub Repo → Settings → Secrets and variables → Actions**

Agregar los siguientes secrets:

#### `VERCEL_TOKEN`
- Ir a: **Vercel Dashboard → Settings → Tokens**
- Crear nuevo token o usar existente
- Copiar y pegar en GitHub Secrets

#### `VERCEL_ORG_ID`
- Ir a: **Vercel Dashboard → Settings → General**
- Buscar **"Team ID"** o **"Organization ID"**
- Copiar y pegar en GitHub Secrets

#### `VERCEL_PROJECT_ID`
- Ir a: **Vercel Dashboard → Tu Proyecto → Settings → General**
- Buscar **"Project ID"**
- Copiar y pegar en GitHub Secrets

---

## ✅ Verificación

### Después de Configurar Secrets

1. **Hacer push a `main`**:
   ```bash
   git add .
   git commit -m "test: Verificar deploy automático"
   git push origin main
   ```

2. **Verificar en GitHub**:
   - Ir a: **Actions** tab en GitHub
   - Ver workflow ejecutándose
   - Esperar a que complete

3. **Verificar en Vercel**:
   - Ir a: **Vercel Dashboard → Deployments**
   - Verificar que el último deploy es de producción
   - Verificar que la URL es `catalogo-indumentaria.vercel.app`

4. **Verificar en el sitio**:
   - Ir a: `https://catalogo-indumentaria.vercel.app`
   - Verificar footer muestra versión correcta
   - Verificar que es la última versión

---

## 🎯 Características

### ✅ Deploy Automático
- Cada push a `main` → deploy automático
- No requiere intervención manual
- No genera preview URLs para `main`

### ✅ Versioning Visible
- Footer muestra versión del commit
- Build ID único por deploy
- Fácil identificar qué versión está activa

### ✅ Tests Automáticos
- TypeScript typecheck
- ESLint
- Continúa aunque fallen (no bloquea deploy)

### ✅ Producción Única
- `main` siempre va a producción
- No hay confusión con previews
- URL única y estable

---

## 🔧 Troubleshooting

### El workflow no se ejecuta

**Problema:** GitHub Actions no se activa

**Solución:**
1. Verificar que el archivo `.github/workflows/deploy-prod.yml` existe
2. Verificar que está en el branch `main`
3. Verificar que los secrets están configurados

### Error: "VERCEL_TOKEN not found"

**Problema:** Falta configurar secrets

**Solución:**
1. Ir a GitHub → Settings → Secrets
2. Agregar `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
3. Hacer push nuevamente

### Error: "Project not found"

**Problema:** `VERCEL_PROJECT_ID` incorrecto

**Solución:**
1. Verificar Project ID en Vercel Dashboard
2. Actualizar secret en GitHub
3. Hacer push nuevamente

### Deploy va a preview en lugar de producción

**Problema:** Configuración de Vercel incorrecta

**Solución:**
1. Verificar `vercel.json` tiene `git.deploymentEnabled.main: true`
2. Verificar en Vercel Dashboard → Settings → Git
3. Asegurar que `main` está configurado para producción

---

## 📝 Comandos Útiles

### Ver logs del workflow
```bash
# En GitHub → Actions → Click en el workflow → Ver logs
```

### Verificar versión en producción
```bash
# Abrir https://catalogo-indumentaria.vercel.app
# Ver footer → Versión mostrada
```

### Deploy manual (si es necesario)
```bash
# Opción 1: Usar GitHub Actions
# Ir a Actions → Deploy to Production → Run workflow

# Opción 2: Usar Vercel CLI
vercel --prod
```

---

## 🎯 Resultado Esperado

Después de configurar correctamente:

- ✅ Push a `main` → Deploy automático
- ✅ No se generan preview URLs para `main`
- ✅ `catalogo-indumentaria.vercel.app` siempre actualizado
- ✅ Footer muestra versión correcta
- ✅ QA puede verificar versión fácilmente

---

## 📚 Referencias

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Vercel Git Integration](https://vercel.com/docs/concepts/git)

---

**¡Deploy automático configurado! 🚀**

