# 🚀 Configuración Rápida de MongoDB Atlas

## ⚡ Guía Express (5 minutos)

### 1. Crear cuenta y cluster en MongoDB Atlas

1. Ve a: **https://www.mongodb.com/cloud/atlas/register**
2. Regístrate (puedes usar Google/GitHub)
3. Crea un cluster **FREE (M0)**
4. Elige una región cercana
5. Espera 3-5 minutos

### 2. Configurar acceso

1. Crea un usuario:
   - Username: `admin`
   - Password: Genera una contraseña (guárdala)
2. En "Network Access", agrega IP: `0.0.0.0/0` (Allow from anywhere)

### 3. Obtener cadena de conexión

1. Haz clic en **"Connect"** en tu cluster
2. Selecciona **"Connect your application"**
3. Copia la cadena que aparece
4. Reemplaza `<password>` con tu contraseña
5. Agrega el nombre de la base de datos antes del `?`:
   ```
   mongodb+srv://admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/catalogo_indumentaria?retryWrites=true&w=majority
   ```

### 4. Probar conexión localmente

```bash
# Agrega a tu .env.local:
MONGODB_URI_ATLAS=mongodb+srv://admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/catalogo_indumentaria?retryWrites=true&w=majority

# Probar conexión:
pnpm test-atlas
```

### 5. Migrar datos locales (opcional)

Si tienes datos en MongoDB local:

```bash
# Agrega también a .env.local:
MONGODB_URI_LOCAL=mongodb://localhost:27017/catalogo_indumentaria

# Migrar:
pnpm migrate-to-atlas
```

### 6. Configurar en Vercel

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto
3. **Settings** → **Environment Variables**
4. Agrega:
   - **Name**: `MONGODB_URI`
   - **Value**: Tu cadena de conexión completa
   - **Environment**: Todas (Production, Preview, Development)
5. **Guarda** y **REDESPLIEGA**

### 7. Cargar datos iniciales

Después de configurar en Vercel, ejecuta desde tu máquina local (conectado a Atlas):

```bash
# Cargar planes
pnpm seed-plans

# Crear usuario admin
pnpm init-saas

# Cargar productos de ejemplo
pnpm seed
```

## ✅ ¡Listo!

Tu aplicación ahora está conectada a MongoDB Atlas y funcionando en Vercel.

## 📚 Documentación completa

Lee `docs/setup-mongodb-atlas.md` para más detalles.

## 🆘 Problemas comunes

- **Error de autenticación**: Verifica usuario y contraseña
- **IP no permitida**: Agrega `0.0.0.0/0` en Network Access
- **Timeout**: Verifica que el cluster esté activo

