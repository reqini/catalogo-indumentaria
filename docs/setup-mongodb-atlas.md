# 🚀 Configuración Rápida de MongoDB Atlas (GRATIS)

## Paso 1: Crear cuenta y cluster en MongoDB Atlas

### 1.1 Crear cuenta
1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Regístrate con Google/GitHub o email
3. Completa el formulario (nombre, empresa, etc.)

### 1.2 Crear cluster gratuito
1. En el dashboard, selecciona **"Build a Database"**
2. Elige el plan **FREE (M0)** - es completamente gratis
3. Selecciona un **Cloud Provider** (AWS, Google Cloud, o Azure)
4. Elige una **región** cercana a ti (ej: `us-east-1` para Estados Unidos)
5. Deja el nombre del cluster como está (ej: `Cluster0`)
6. Haz clic en **"Create"**
7. ⏳ Espera 3-5 minutos mientras se crea el cluster

## Paso 2: Configurar acceso

### 2.1 Crear usuario de base de datos
1. En la pantalla de "Security Quickstart", crea un usuario:
   - **Username**: `admin` (o el que prefieras)
   - **Password**: Genera una contraseña segura (guárdala bien)
   - Haz clic en **"Create User"**

### 2.2 Configurar acceso de red
1. En "Network Access", haz clic en **"Add IP Address"**
2. Para desarrollo, selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Haz clic en **"Confirm"**

## Paso 3: Obtener cadena de conexión

1. Haz clic en **"Connect"** en tu cluster
2. Selecciona **"Connect your application"**
3. Elige **"Node.js"** como driver
4. Copia la cadena de conexión que aparece:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Reemplaza**:
   - `<username>` con tu usuario (ej: `admin`)
   - `<password>` con tu contraseña
   - Agrega el nombre de la base de datos: `/catalogo_indumentaria` antes del `?`
   
   **Resultado final debería ser:**
   ```
   mongodb+srv://admin:tu_password_aqui@cluster0.xxxxx.mongodb.net/catalogo_indumentaria?retryWrites=true&w=majority
   ```

## Paso 4: Configurar en Vercel

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto `catalogo-indumentaria`
3. Ve a **Settings** → **Environment Variables**
4. Haz clic en **"Add New"**
5. Completa:
   - **Name**: `MONGODB_URI`
   - **Value**: Pega tu cadena de conexión completa (la del Paso 3)
   - **Environment**: Selecciona todas (Production, Preview, Development)
6. Haz clic en **"Save"**
7. **IMPORTANTE**: Ve a **Deployments** → Haz clic en los 3 puntos (⋯) del último deployment → **"Redeploy"**

## Paso 5: Probar la conexión

Después de redesplegar en Vercel:
1. Ve a tu sitio: `https://catalogo-indumentaria.vercel.app`
2. Abre la consola del navegador (F12)
3. Deberías ver que las llamadas a `/api/productos` funcionan sin errores 500

## Paso 6: Migrar datos locales (Opcional)

Si tienes datos en tu MongoDB local y quieres migrarlos a Atlas:

```bash
# Ejecutar el script de migración
pnpm migrate-to-atlas
```

O manualmente:
```bash
# Exportar desde local
mongodump --uri="mongodb://localhost:27017/catalogo_indumentaria" --out=./backup

# Importar a Atlas (reemplaza con tu URI de Atlas)
mongorestore --uri="mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/catalogo_indumentaria" ./backup/catalogo_indumentaria
```

## ✅ Listo!

Tu aplicación ahora está conectada a MongoDB Atlas (gratis) y funcionando en Vercel.

## 📝 Notas importantes

- ⚠️ **NUNCA** compartas tu cadena de conexión públicamente
- ✅ El plan FREE de MongoDB Atlas es suficiente para desarrollo y proyectos pequeños
- 🔄 Si cambias la contraseña, actualiza la variable en Vercel
- 📊 Puedes ver tus datos en MongoDB Atlas → **Collections**

## 🆘 Solución de problemas

### Error: "Authentication failed"
- Verifica que el usuario y contraseña sean correctos
- Asegúrate de que no haya espacios en la cadena de conexión

### Error: "IP not whitelisted"
- Ve a MongoDB Atlas → Network Access → Agrega 0.0.0.0/0

### Error: "Connection timeout"
- Verifica que la región del cluster sea cercana a Vercel
- Revisa que la cadena de conexión esté completa

