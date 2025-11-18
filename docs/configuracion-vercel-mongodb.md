# Configuración de MongoDB en Vercel

## Paso 1: Obtener tu cadena de conexión de MongoDB

### Si usas MongoDB Atlas (recomendado):

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Inicia sesión en tu cuenta
3. Selecciona tu cluster
4. Haz clic en **"Connect"**
5. Selecciona **"Connect your application"**
6. Copia la cadena de conexión que aparece (algo como):
   ```
   mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/nombre-db?retryWrites=true&w=majority
   ```
7. Reemplaza `<password>` con tu contraseña real
8. Reemplaza `nombre-db` con el nombre de tu base de datos (ej: `catalogo_indumentaria`)

### Si usas MongoDB local o otro servicio:

Tu cadena de conexión será algo como:
```
mongodb://usuario:password@host:puerto/nombre-db
```

## Paso 2: Configurar en Vercel

### Opción A: Desde el Dashboard de Vercel (Recomendado)

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **catalogo-indumentaria**
3. Ve a **Settings** (Configuración)
4. En el menú lateral, haz clic en **Environment Variables** (Variables de Entorno)
5. Haz clic en **Add New** (Agregar Nueva)
6. Completa los campos:
   - **Name (Nombre)**: `MONGODB_URI`
   - **Value (Valor)**: Pega tu cadena de conexión completa
   - **Environment (Entorno)**: Selecciona:
     - ✅ Production (Producción)
     - ✅ Preview (Vista Previa)
     - ✅ Development (Desarrollo) - opcional
7. Haz clic en **Save** (Guardar)
8. **IMPORTANTE**: Ve a **Deployments** y haz clic en los 3 puntos (⋯) del último deployment
9. Selecciona **Redeploy** (Redesplegar) para aplicar los cambios

### Opción B: Desde Vercel CLI

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Agregar variable de entorno
vercel env add MONGODB_URI

# Te pedirá:
# - El valor de la variable (pega tu cadena de conexión)
# - Para qué entornos (production, preview, development)

# Redesplegar
vercel --prod
```

## Paso 3: Verificar que funciona

1. Después de redesplegar, ve a tu sitio en Vercel
2. Abre la consola del navegador (F12)
3. Deberías ver que las llamadas a `/api/productos` y `/api/banners` funcionan correctamente
4. Si aún hay errores, revisa los logs en Vercel:
   - Ve a **Deployments** > Selecciona el último deployment > **Functions** > Revisa los logs

## Ejemplo de cadena de conexión completa

```
mongodb+srv://admin:tu_password_aqui@cluster0.xxxxx.mongodb.net/catalogo_indumentaria?retryWrites=true&w=majority
```

## Variables de entorno adicionales recomendadas

También deberías configurar estas variables en Vercel:

- `JWT_SECRET`: Una cadena aleatoria secreta para JWT (ej: `openssl rand -base64 32`)
- `MP_ACCESS_TOKEN`: Tu Access Token de Mercado Pago
- `MP_WEBHOOK_SECRET`: Tu Webhook Secret de Mercado Pago (si lo usas)
- `NEXT_PUBLIC_BASE_URL`: La URL de tu sitio en Vercel (ej: `https://catalogo-indumentaria.vercel.app`)

## Solución de problemas

### Error: "MongoNetworkError: failed to connect"

- Verifica que tu IP esté en la whitelist de MongoDB Atlas
- En MongoDB Atlas, ve a **Network Access** > **Add IP Address** > **Allow Access from Anywhere** (0.0.0.0/0) para desarrollo

### Error: "Authentication failed"

- Verifica que el usuario y contraseña sean correctos
- Asegúrate de que la contraseña no tenga caracteres especiales que necesiten encoding (usa `encodeURIComponent()` si es necesario)

### Error: "Database name not found"

- Verifica que el nombre de la base de datos en la cadena de conexión sea correcto
- MongoDB creará la base de datos automáticamente si no existe, pero es mejor especificarla

## Notas importantes

- ⚠️ **NUNCA** subas tu `.env.local` a GitHub
- ✅ Las variables de entorno en Vercel son seguras y privadas
- 🔄 Después de agregar variables, siempre redesplega la aplicación
- 📝 Puedes ver todas tus variables en **Settings > Environment Variables**

