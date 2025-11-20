# ✅ Checklist de Deploy en Vercel

## 🎯 Pre-Deploy (Antes de hacer push)

### Código
- [x] Build local pasa sin errores (`pnpm run build`)
- [x] TypeScript sin errores (`pnpm typecheck`)
- [x] ESLint sin errores críticos (`pnpm lint`)
- [x] No hay importaciones rotas
- [x] No hay código muerto
- [x] Tests pasan (si aplica)

### Configuración
- [x] `vercel.json` configurado correctamente
- [x] `next.config.js` optimizado
- [x] `.vercelignore` configurado
- [x] Variables de entorno documentadas

---

## 🔐 Variables de Entorno en Vercel Dashboard

### Obligatorias
- [ ] `NEXT_PUBLIC_SUPABASE_URL` → `https://yqggrzxjhylnxjuagfyr.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `sb_publishable_TGYS5tsv3tEY9rxHx9-ZHQ_F9a64G0t`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → `sb_secret_Aes4CjU2mwX2R1zgJyWibQ_FytVUNSR`
- [ ] `JWT_SECRET` → Generar con `pnpm generar-jwt-secret`

### Opcionales (si aplica)
- [ ] `MP_PUBLIC_KEY`
- [ ] `MP_ACCESS_TOKEN`
- [ ] `MP_WEBHOOK_SECRET`
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `SMTP_FROM`

**Verificar que todas estén en**: Production ✅ Preview ✅ Development ✅

---

## 🚀 Deploy

### Paso 1: Push a GitHub
```bash
git add -A
git commit -m "fix: Preparar para deploy en Vercel"
git push origin main
```

### Paso 2: Verificar en Vercel
1. Ir a Vercel Dashboard
2. Verificar que el deploy se inició automáticamente
3. Revisar logs del build

### Paso 3: Verificar Build
- [ ] Build completó sin errores
- [ ] Todas las rutas se generaron correctamente
- [ ] No hay warnings críticos

---

## ✅ Post-Deploy (Después del deploy)

### Funcionalidades Básicas
- [ ] Home page carga correctamente
- [ ] Catálogo muestra productos
- [ ] Login funciona
- [ ] Admin panel accesible

### APIs
- [ ] `/api/productos` funciona
- [ ] `/api/login` funciona
- [ ] `/api/admin/upload-image` funciona
- [ ] `/api/pago` funciona (si aplica)

### Imágenes
- [ ] Imágenes de productos cargan
- [ ] Imágenes de Supabase Storage cargan
- [ ] Placeholders funcionan

### Autenticación
- [ ] Login funciona
- [ ] Rutas protegidas funcionan
- [ ] Logout funciona
- [ ] Tokens se generan correctamente

---

## 🐛 Troubleshooting Post-Deploy

### Si algo no funciona:

1. **Revisar Logs**:
   - Vercel Dashboard → Deployments → [Último Deploy] → Functions
   - Buscar errores en consola

2. **Verificar Variables**:
   - Settings → Environment Variables
   - Verificar que todas estén configuradas
   - Verificar que estén en el ambiente correcto

3. **Verificar Supabase**:
   - Verificar que el bucket `productos` exista
   - Verificar políticas RLS
   - Verificar que las tablas existan

4. **Verificar Build**:
   - Ver logs del build completo
   - Buscar warnings o errores

---

## 📊 Métricas de Éxito

### Build
- ✅ Tiempo de build < 5 minutos
- ✅ Sin errores de TypeScript
- ✅ Sin errores de ESLint críticos
- ✅ Todas las rutas generadas

### Runtime
- ✅ Home page carga < 2 segundos
- ✅ APIs responden < 500ms
- ✅ Imágenes cargan correctamente
- ✅ Sin errores en consola del navegador

---

**Fecha**: 2024-12-19
**Estado**: ✅ **LISTO PARA DEPLOY**

