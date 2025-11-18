# Catálogo Simple - SaaS Mode

Plataforma SaaS multitenant para gestión de catálogos de productos.

## 🚀 Características

- ✅ **Multi-tenant**: Cada usuario tiene su propio catálogo independiente
- ✅ **Planes de suscripción**: Free, Pro, Premium con límites configurables
- ✅ **Mercado Pago**: Integración completa para suscripciones recurrentes
- ✅ **Branding personalizado**: Logo, colores y tipografía por tenant
- ✅ **Límites por plan**: Control automático de productos y banners
- ✅ **Panel SuperAdmin**: Gestión global de tenants y planes
- ✅ **Catálogos públicos**: URLs personalizadas por tenant

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Inicializar SaaS (crea planes y superadmin)
pnpm init-saas

# Crear planes (alternativa)
pnpm seed-plans

# Iniciar desarrollo
pnpm dev
```

## 🔐 Credenciales

### SuperAdmin
- Email: `superadmin@catalogo.com` (o `SUPER_ADMIN_EMAIL`)
- Password: `SuperAdmin123!` (o `SUPER_ADMIN_PASS`)

### Variables de Entorno

```env
MONGODB_URI=mongodb://localhost:27017/catalogo_indumentaria
JWT_SECRET=your-secret-key-change-in-production
MP_ACCESS_TOKEN=your-mercadopago-access-token
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SUPER_ADMIN_EMAIL=superadmin@catalogo.com
SUPER_ADMIN_PASS=SuperAdmin123!
```

## 📋 Planes

### Free
- Hasta 10 productos
- Sin banners
- Soporte por email

### Pro ($999 ARS/mes)
- Hasta 200 productos
- 5 banners personalizados
- Dominio personalizado
- Soporte prioritario

### Premium ($1999 ARS/mes)
- Productos ilimitados
- Banners ilimitados
- Dominio personalizado
- Analytics avanzado
- Soporte 24/7

## 🛠️ Estructura

```
/models
  - Tenant.ts      # Modelo de tenant/usuario
  - Plan.ts        # Modelo de planes
  - Venta.ts       # Modelo de ventas/suscripciones
  - Producto.ts    # Productos con tenantId
  - Banner.ts     # Banners con tenantId

/lib
  - tenant.ts      # Utilidades de tenant

/app
  - [tenant]/catalogo  # Catálogo público por tenant
  - auth/register      # Registro de nuevos tenants
  - planes             # Página de planes
  - superadmin         # Panel superadmin
  - admin              # Panel de tenant

/api
  - auth/register      # Registro
  - suscripcion/create # Crear suscripción MP
  - mp/subscription    # Webhook de suscripción
  - limit-check        # Verificar límites
```

## 🔄 Flujo de Suscripción

1. Usuario se registra → Plan Free automático
2. Usuario elige plan en `/planes`
3. Se crea suscripción en Mercado Pago
4. Webhook actualiza plan al confirmar pago
5. Límites se aplican automáticamente

## 📊 Límites por Plan

Los límites se verifican automáticamente al:
- Crear productos
- Crear banners

Si se alcanza el límite, se muestra mensaje y se bloquea la acción.

## 🎨 Branding

Cada tenant puede personalizar:
- Logo
- Color primario
- Color secundario
- Tipografía (Inter, Montserrat, Roboto)

Se aplica automáticamente en su catálogo público.

## 📈 Próximos Pasos

- [ ] Panel superadmin completo
- [ ] Analytics individual y global
- [ ] Facturación PDF
- [ ] Cron jobs de mantenimiento
- [ ] Tests E2E para SaaS

## 📝 Notas

- El sistema está diseñado para escalar
- Cada tenant tiene datos completamente aislados
- Los límites se verifican en cada operación
- Las suscripciones se renuevan automáticamente vía MP

