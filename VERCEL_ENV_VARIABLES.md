# 🔐 Variables de Entorno para Vercel

## 📋 Lista Completa de Variables Requeridas

### ✅ OBLIGATORIAS (Sin estas, la app no funcionará)

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://yqggrzxjhylnxjuagfyr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_TGYS5tsv3tEY9rxHx9-ZHQ_F9a64G0t
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Aes4CjU2mwX2R1zgJyWibQ_FytVUNSR
```

#### Autenticación JWT
```
JWT_SECRET=<generar con: pnpm generar-jwt-secret>
```
**Nota**: Generar un secret seguro y único. NO usar el mismo que en desarrollo.

---

### ⚠️ OPCIONALES (Requeridas solo para funcionalidades específicas)

#### Mercado Pago (Solo si usas pagos)
```
MP_PUBLIC_KEY=<tu public key de Mercado Pago>
MP_ACCESS_TOKEN=<tu access token de Mercado Pago>
MP_WEBHOOK_SECRET=<tu webhook secret de Mercado Pago>
```

#### Email (Solo si envías emails)
```
SMTP_HOST=<servidor SMTP, ej: smtp.gmail.com>
SMTP_PORT=<puerto, ej: 587>
SMTP_USER=<usuario SMTP>
SMTP_PASS=<contraseña SMTP>
SMTP_FROM=<email remitente, ej: noreply@tudominio.com>
```

#### Analytics (Opcional)
```
NEXT_PUBLIC_GA_ID=<Google Analytics ID>
```

---

## 🚀 Cómo Configurar en Vercel

### Método 1: Dashboard de Vercel (Recomendado)

1. Ir a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agregar cada variable:
   - **Key**: Nombre de la variable (ej: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Valor de la variable
   - **Environment**: Seleccionar dónde aplica:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
4. Guardar
5. Hacer redeploy para aplicar cambios

### Método 2: CLI de Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Agregar variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# (te pedirá el valor)

# Ver todas las variables
vercel env ls
```

---

## 🔍 Verificación de Variables

### Script de Verificación

Ejecutar después del deploy:

```bash
curl https://tu-app.vercel.app/api/verificar-env
```

O visitar: `https://tu-app.vercel.app/api/verificar-env`

**Nota**: Este endpoint solo muestra si las variables están configuradas, NO muestra los valores por seguridad.

---

## ⚠️ Seguridad

### ❌ NUNCA Hacer:
- Committear `.env.local` o `.env` al repositorio
- Compartir valores de variables en chats públicos
- Usar el mismo `JWT_SECRET` en desarrollo y producción
- Exponer `SUPABASE_SERVICE_ROLE_KEY` en el frontend

### ✅ SÍ Hacer:
- Usar Vercel Dashboard para variables sensibles
- Generar `JWT_SECRET` único para producción
- Usar diferentes proyectos de Supabase para dev/prod (recomendado)
- Rotar secrets periódicamente

---

## 📝 Checklist de Variables

Antes de hacer deploy, verificar que todas estas estén configuradas:

### Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Autenticación
- [ ] `JWT_SECRET`

### Mercado Pago (si aplica)
- [ ] `MP_PUBLIC_KEY`
- [ ] `MP_ACCESS_TOKEN`
- [ ] `MP_WEBHOOK_SECRET`

### Email (si aplica)
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `SMTP_FROM`

---

## 🔄 Actualizar Variables

Si necesitas actualizar una variable:

1. Ir a Vercel Dashboard → Settings → Environment Variables
2. Buscar la variable
3. Click en "Edit"
4. Actualizar el valor
5. Guardar
6. **IMPORTANTE**: Hacer redeploy para aplicar cambios

Las variables NO se actualizan automáticamente en deployments existentes.

---

## 🐛 Troubleshooting

### Variable No Se Aplica

**Problema**: Cambiaste una variable pero no se aplica

**Solución**:
1. Verificar que la variable esté en el ambiente correcto (Production/Preview/Development)
2. Hacer redeploy manual
3. Verificar logs del deploy para confirmar que se aplicó

### Variable Faltante en Build

**Problema**: Build falla porque falta una variable

**Solución**:
1. Verificar que la variable esté en el ambiente correcto
2. Verificar que el nombre sea exacto (case-sensitive)
3. Verificar que no tenga espacios al inicio/final
4. Verificar logs del build para ver qué variable falta

---

**Última actualización**: 2024-12-19

