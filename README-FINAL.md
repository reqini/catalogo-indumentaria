# Catálogo de Indumentaria - Versión Final

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
# o
pnpm install
```

### 2. Configurar variables de entorno
Copiar `.env.example` a `.env.local` y completar:
```bash
cp .env.example .env.local
```

Variables requeridas:
- `MONGODB_URI` - URI de MongoDB
- `JWT_SECRET` - Secret para JWT

Variables opcionales:
- `CLOUDINARY_*` - Para subida de imágenes
- `MP_ACCESS_TOKEN` - Para Mercado Pago

### 3. Ejecutar seed (opcional)
```bash
npm run seed
```

Esto crea:
- Usuario admin: `admin@demo.com` / `Admin123!`
- 12 productos demo
- 3 banners activos

### 4. Iniciar servidor
```bash
npm run dev
```

El servidor iniciará en `http://localhost:3000` y mostrará las URLs en consola.

## 📍 URLs

- **Catálogo (Home)**: http://localhost:3000/
- **Catálogo (Listado)**: http://localhost:3000/catalogo
- **Admin**: http://localhost:3000/admin
- **API Docs**: http://localhost:3000/api
- **Status/Health**: http://localhost:3000/status

## 🔐 Credenciales Admin

- Email: `admin@demo.com`
- Password: `Admin123!`

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:ui
```

### QA Completo
```bash
npm run qa
```

## 🏗️ Build

```bash
npm run build
npm start
```

El prebuild ejecuta automáticamente `qa` (lint + typecheck + tests).

## 📦 Estructura

```
/app
  /api          - API Routes
  /admin        - Panel de administración
  /catalogo     - Listado de productos
  /producto     - Vista individual
  /status       - Health checks
/components    - Componentes React
/models        - Modelos Mongoose
/lib           - Utilidades y conexiones
/tests         - Tests unitarios
/e2e           - Tests E2E
/scripts       - Scripts de utilidad
```

## 🔒 Seguridad

- Validación de inputs con Zod
- Rate limiting en API
- JWT para autenticación
- Sanitización de datos
- Error boundaries

## 📝 QA Automático

- **Pre-commit**: ESLint + Prettier
- **Pre-push**: QA completo (lint + typecheck + tests)
- **Pre-build**: QA completo antes de build
- **CI**: GitHub Actions con MongoDB service

## 🐛 Troubleshooting

### MongoDB no conecta
Verificar `MONGODB_URI` en `.env.local` y que MongoDB esté corriendo.

### Tests fallan
Asegurarse de que MongoDB esté disponible para tests.

### Build falla
Ejecutar `npm run qa` para ver errores específicos.

## 📄 Licencia

MIT

