# Guía de Despliegue en Vercel

## 📋 Requisitos Previos

1. Cuenta en [Vercel](https://vercel.com)
2. Repositorio en GitHub (recomendado) o GitLab/Bitbucket
3. MongoDB Atlas o MongoDB local configurado
4. Credenciales de Mercado Pago (opcional)

## 🚀 Despliegue Rápido

### Opción 1: Desde GitHub (Recomendado)

1. **Conectar repositorio en Vercel:**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Conecta tu repositorio de GitHub
   - Selecciona el proyecto `catalogo-indumentaria`

2. **Configurar variables de entorno:**
   - En la configuración del proyecto, ve a "Environment Variables"
   - Agrega todas las variables necesarias (ver sección siguiente)

3. **Desplegar:**
   - Vercel detectará automáticamente Next.js
   - El build se ejecutará automáticamente
   - Tu app estará disponible en `tu-proyecto.vercel.app`

### Opción 2: Desde CLI

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Desplegar:**
```bash
vercel
```

4. **Desplegar a producción:**
```bash
vercel --prod
```

## 🔐 Variables de Entorno Requeridas

### Variables Obligatorias

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret (generar uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Base URL (Vercel la proporciona automáticamente, pero puedes sobrescribirla)
NEXT_PUBLIC_BASE_URL=https://tu-proyecto.vercel.app
```

### Variables Opcionales (pero recomendadas)

```env
# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxx
MP_WEBHOOK_SECRET=tu_webhook_secret
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxx

# Cloudinary (para subida de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app
EMAIL_FROM=info@catalogo.com
```

## 📝 Configurar Variables en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en "Settings" → "Environment Variables"
3. Agrega cada variable:
   - **Key**: Nombre de la variable (ej: `MONGODB_URI`)
   - **Value**: Valor de la variable
   - **Environment**: Selecciona Production, Preview, Development según corresponda
4. Click en "Save"

## 🔧 Configuración Adicional

### Build Settings

Vercel detectará automáticamente:
- **Framework**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### Domains Personalizados

1. Ve a "Settings" → "Domains"
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

### Webhooks de Mercado Pago

Si usas Mercado Pago, configura el webhook:
1. En Mercado Pago Dashboard, ve a "Webhooks"
2. Agrega la URL: `https://tu-proyecto.vercel.app/api/mp/webhook`
3. Copia el secret y agrégalo como `MP_WEBHOOK_SECRET` en Vercel

## 🧪 Verificar Despliegue

Después del despliegue, verifica:

1. **Home page**: `https://tu-proyecto.vercel.app/`
2. **API Status**: `https://tu-proyecto.vercel.app/status`
3. **Admin Panel**: `https://tu-proyecto.vercel.app/admin`
4. **Catálogo**: `https://tu-proyecto.vercel.app/catalogo`

## 🔄 Actualizaciones Automáticas

Si conectaste desde GitHub:
- Cada push a `main` despliega automáticamente a producción
- Cada pull request crea un preview deployment
- Puedes ver el estado en el dashboard de Vercel

## 🐛 Troubleshooting

### Error: "MongoDB connection failed"
- Verifica que `MONGODB_URI` esté correctamente configurada
- Asegúrate de que MongoDB Atlas permita conexiones desde cualquier IP (0.0.0.0/0)

### Error: "Build failed"
- Revisa los logs en Vercel Dashboard
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que `pnpm` esté disponible (Vercel lo detecta automáticamente)

### Error: "Environment variables not found"
- Verifica que las variables estén en el ambiente correcto (Production/Preview/Development)
- Asegúrate de que los nombres de las variables coincidan exactamente

## 📊 Monitoreo

Vercel proporciona:
- **Analytics**: Tráfico y rendimiento
- **Logs**: Logs en tiempo real
- **Deployments**: Historial de despliegues
- **Functions**: Métricas de API routes

## 🔒 Seguridad

- ✅ Las variables de entorno están encriptadas
- ✅ Solo accesibles en runtime, no en el código
- ✅ `.env.local` está en `.gitignore` (no se sube a GitHub)
- ✅ Headers de seguridad configurados en `vercel.json`

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables de Entorno en Vercel](https://vercel.com/docs/environment-variables)

