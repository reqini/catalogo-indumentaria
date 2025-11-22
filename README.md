# Catálogo de Indumentaria

## 🚀 Deploy Automático

Este proyecto está configurado para **deploy automático a producción** cada vez que se hace push al branch `main`.

### Flujo de Deploy

```
Push a main → GitHub Actions → Deploy a Vercel Production → catalogo-indumentaria.vercel.app
```

### Configuración Requerida

1. **Secrets en GitHub** (Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN` - Token de Vercel (Settings → Tokens)
   - `VERCEL_ORG_ID` - Organization ID (Settings → General)
   - `VERCEL_PROJECT_ID` - Project ID (Project Settings → General)

2. **Verificar Deploy**:
   - Cada push a `main` dispara deploy automático
   - Ver versión en footer del sitio
   - Ver logs en GitHub Actions

### Documentación Completa

Ver [`docs/DEPLOY_AUTOMATICO.md`](docs/DEPLOY_AUTOMATICO.md) para guía detallada.

---

## ⚙️ Configuración de Build en Vercel

### Scripts Críticos para Producción

**⚠️ IMPORTANTE:** Los siguientes scripts son **CRÍTICOS** para el funcionamiento correcto del proyecto y **NO deben eliminarse** del deployment:

- `scripts/verify-mp-config.mjs` - Verificación de configuración de Mercado Pago (ejecutado en prebuild)
- `scripts/create-pwa-icons.mjs` - Generación de íconos PWA
- `scripts/create-real-pwa-icons.mjs` - Generación de íconos PWA con branding
- `scripts/generar-jwt-secret.mjs` - Generación de JWT secrets
- `scripts/verificar-produccion.mjs` - Verificación de configuración de producción

### Configuración de `.vercelignore`

El archivo `.vercelignore` está configurado para:
- ✅ **PERMITIR** scripts críticos necesarios para el build
- ❌ **IGNORAR** scripts de desarrollo, tests y migraciones

**NO modificar** `.vercelignore` para excluir scripts críticos, ya que esto causará errores en el build de Vercel.

### Lifecycle Scripts de Dependencias

El proyecto autoriza explícitamente los siguientes lifecycle scripts de dependencias transitivas:

- `core-js` - Polyfills necesarios (viene de `cloudinary`)
- `esbuild` - Bundler usado por `vite/vitest`
- `unrs-resolver` - Resolver TypeScript para ESLint

Esta configuración se maneja mediante:
- `.pnpmfile.cjs` - Autorización explícita de scripts
- `.npmrc` - Configuración `enable-pre-post-scripts=true`
- `vercel.json` - Variable de entorno `VERCEL_ALLOW_RUN_SCRIPTS`

### Build Command

El build en Vercel ejecuta automáticamente:
```bash
pnpm approve-builds && pnpm prebuild:vercel && pnpm build
```

Esto garantiza:
1. Autorización de lifecycle scripts necesarios
2. Ejecución de validaciones (lint, typecheck, verify-mp-config)
3. Build de producción limpio

### Solución de Problemas

Si aparecen warnings sobre "Ignored build scripts":
1. Verificar que `.pnpmfile.cjs` existe y contiene las dependencias correctas
2. Verificar que `vercel.json` tiene `VERCEL_ALLOW_RUN_SCRIPTS` configurado
3. Verificar que `package.json` ejecuta `pnpm approve-builds` antes del build

**Documentación completa:** Ver [`docs/VERCEL_BUILD_CONFIG.md`](docs/VERCEL_BUILD_CONFIG.md)

---

## 📦 Sistema de Envíos

El sistema de envíos está implementado con soporte para:
- **Envíopack** (recomendado - múltiples transportistas)
- **OCA** (directo)
- **Correo Argentino** (directo)
- **Mercado Envíos Flex**

### Configuración de Envíopack

1. Registrarse en https://www.enviopack.com
2. Obtener `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET`
3. Configurar en `.env.local` y Vercel

Ver [`docs/CHECKLIST_ENVIOS_PRODUCTIVOS.md`](docs/CHECKLIST_ENVIOS_PRODUCTIVOS.md) para checklist completo.

---

# Catálogo de Indumentaria

Catálogo premium de indumentaria desarrollado con Next.js 14, React 18 y TailwindCSS. Diseño moderno inspirado en Adidas.com, optimizado para móviles y con panel de administración completo.

## 🚀 Características

- **Diseño Moderno**: Estilo limpio y minimalista tipo Adidas.com
- **Mobile First**: Optimizado para dispositivos móviles con Lighthouse +90
- **Panel de Administración**: CRUD completo de productos, banners y descuentos
- **Filtros Avanzados**: Por categoría, color, nombre y precio
- **Gestión de Stock**: Control de inventario por talle
- **Carrito de Compras**: Context API para gestión del carrito
- **PWA**: Aplicación instalable como Progressive Web App
- **Integración Mercado Pago**: Preparado para checkout

## 📦 Instalación

1. Clonar el repositorio
```bash
git clone <repo-url>
cd catalogo-indumentaria
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.local.example .env.local
```

Editar `.env.local` con tus credenciales:
```
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu_public_key
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

4. Ejecutar en desarrollo
```bash
npm run dev
```

5. Abrir en el navegador
```
http://localhost:3000
```

## 🛠️ Scripts de Utilidad

El proyecto incluye varios scripts de utilidad para desarrollo y setup:

### Iconos PWA
```bash
# Generar iconos PWA básicos
pnpm pwa:icons

# Generar iconos PWA con branding "AS" (recomendado)
pnpm pwa:icons:real
```

**Nota:** Los iconos PWA deben estar commitados en el repositorio. No se generan automáticamente en el build.

### Generación de Secrets
```bash
# Generar JWT_SECRET seguro
pnpm jwt:generate
```

**Después de ejecutar:** Copia el valor generado y configúralo en `.env.local` y Vercel Dashboard.

### Guías Interactivas
```bash
# Guía paso a paso para configurar Supabase
pnpm supabase:help
```

**Nota:** Este script requiere terminal interactiva y NO debe ejecutarse en CI/CD.

### Documentación Completa
Ver [`docs/SCRIPTS_UTILIDADES.md`](docs/SCRIPTS_UTILIDADES.md) para documentación detallada de todos los scripts.

---

## 🏗️ Estructura del Proyecto

```
/app
  ├─ /catalogo          # Página de catálogo con filtros
  ├─ /producto/[id]     # Vista individual de producto
  ├─ /admin             # Panel de administración
  └─ /api               # API routes

/components
  ├─ ProductCard        # Tarjeta de producto
  ├─ ProductModal       # Modal de producto
  ├─ TalleSelector      # Selector de talles
  ├─ FilterBar          # Barra de filtros
  ├─ Carousel           # Carrusel de banners
  └─ Admin*             # Componentes del panel admin

/context
  ├─ CartContext        # Contexto del carrito
  └─ AuthContext        # Contexto de autenticación

/hooks
  ├─ useCart            # Hook del carrito
  ├─ useFilters         # Hook de filtros
  └─ useAdmin           # Hook de administración

/utils
  ├─ api                # Funciones de API
  ├─ formatPrice        # Formateo de precios
  └─ getStockStatus     # Estado de stock
```

## 🎨 Estilo Visual

- **Fuentes**: Inter y Montserrat (Google Fonts)
- **Colores**: Blanco, negro, grises y acentos en azul
- **Fotos**: Grandes y destacadas
- **Animaciones**: Suaves con Framer Motion
- **Responsive**: Mobile first, adaptado a todas las pantallas

## 🔐 Panel de Administración

Acceder a `/admin` con las credenciales configuradas en `.env.local`.

Funcionalidades:
- ✅ CRUD completo de productos
- ✅ Gestión de banners
- ✅ Control de stock por talle
- ✅ Aplicar descuentos
- ✅ Dashboard con estadísticas
- ✅ Subida de imágenes con preview

## 🛒 Funcionalidades del Catálogo

- Grid responsive de productos
- Modal de producto con galería
- Selector de talles con estado de stock
- Filtros combinables
- Etiquetas de descuento y "Últimas unidades"
- Control de stock en tiempo real

## 📱 PWA

La aplicación es instalable como PWA. Los usuarios pueden agregarla a la pantalla de inicio desde el navegador.

## 🚢 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Render
1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

## 🔧 Tecnologías

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **Framer Motion**
- **Axios**
- **React Hot Toast**
- **Zustand** (opcional)

## 📝 Notas

- Los datos se almacenan en memoria por defecto. Para producción, conectar a una base de datos real.
- Las imágenes se pueden subir localmente o integrar con Cloudinary.
- Mercado Pago requiere configuración adicional en producción.

## 📄 Licencia

MIT



