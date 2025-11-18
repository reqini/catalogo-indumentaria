# ✅ Checklist de Despliegue en Vercel

## 📋 Antes de Desplegar

### 1. Repositorio Git
- [ ] Repositorio inicializado (`git init`)
- [ ] Código commitado (`git add .` y `git commit`)
- [ ] Repositorio conectado a GitHub/GitLab/Bitbucket (opcional pero recomendado)

### 2. Variables de Entorno Locales
- [ ] Archivo `.env.local` configurado localmente
- [ ] Todas las variables funcionan en desarrollo

### 3. Build Local
- [ ] `pnpm build` ejecuta sin errores
- [ ] `pnpm start` funciona correctamente
- [ ] No hay errores de TypeScript (`pnpm typecheck`)

## 🔐 Variables de Entorno en Vercel

### Obligatorias
- [ ] `MONGODB_URI` - URI de MongoDB (Atlas recomendado)
- [ ] `JWT_SECRET` - Secret para JWT (generar uno seguro)

### Opcionales pero Recomendadas
- [ ] `MP_ACCESS_TOKEN` - Token de Mercado Pago
- [ ] `MP_WEBHOOK_SECRET` - Secret del webhook de Mercado Pago
- [ ] `NEXT_PUBLIC_MP_PUBLIC_KEY` - Public key de Mercado Pago
- [ ] `NEXT_PUBLIC_BASE_URL` - URL base (Vercel la proporciona automáticamente)
- [ ] `CLOUDINARY_CLOUD_NAME` - Para subida de imágenes
- [ ] `CLOUDINARY_API_KEY` - API key de Cloudinary
- [ ] `CLOUDINARY_API_SECRET` - API secret de Cloudinary
- [ ] `SMTP_HOST` - Host SMTP para emails
- [ ] `SMTP_PORT` - Puerto SMTP
- [ ] `SMTP_USER` - Usuario SMTP
- [ ] `SMTP_PASS` - Password SMTP
- [ ] `EMAIL_FROM` - Email remitente

## 🚀 Pasos de Despliegue

### Opción 1: Desde GitHub (Recomendado)
1. [ ] Subir código a GitHub
2. [ ] Ir a [vercel.com/new](https://vercel.com/new)
3. [ ] Conectar repositorio
4. [ ] Configurar variables de entorno en Vercel Dashboard
5. [ ] Desplegar

### Opción 2: Desde CLI
1. [ ] Instalar Vercel CLI: `npm i -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Ejecutar script: `./scripts/deploy-vercel.sh`
4. [ ] O manualmente: `vercel` y luego `vercel --prod`

## ✅ Después del Despliegue

### Verificaciones
- [ ] Home page carga correctamente: `https://tu-proyecto.vercel.app/`
- [ ] API Status funciona: `https://tu-proyecto.vercel.app/status`
- [ ] Admin panel accesible: `https://tu-proyecto.vercel.app/admin`
- [ ] Catálogo funciona: `https://tu-proyecto.vercel.app/catalogo`
- [ ] Conexión a MongoDB funciona
- [ ] Mercado Pago configurado (si aplica)

### Configuraciones Adicionales
- [ ] Dominio personalizado configurado (opcional)
- [ ] Webhook de Mercado Pago configurado (si aplica)
- [ ] Analytics habilitado (opcional)
- [ ] Monitoreo configurado (opcional)

## 🐛 Troubleshooting

Si algo falla:
1. [ ] Revisar logs en Vercel Dashboard
2. [ ] Verificar que todas las variables de entorno estén configuradas
3. [ ] Verificar que MongoDB permita conexiones desde Vercel IPs
4. [ ] Revisar `docs/vercel-deployment.md` para más detalles

## 📚 Documentación

- [ ] Leer `docs/vercel-deployment.md` para guía completa
- [ ] Revisar `.env.example` para referencia de variables
- [ ] Consultar [Vercel Docs](https://vercel.com/docs) si es necesario

