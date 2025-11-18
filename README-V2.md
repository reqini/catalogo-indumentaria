# Catálogo de Indumentaria - Versión 2.0

## 🚀 Mejoras Implementadas

### Base de Datos
- ✅ Integración con Supabase (PostgreSQL)
- ✅ Esquema completo con tablas: productos, banners, promociones, usuarios, compras
- ✅ Fallback a datos mock si Supabase no está configurado

### API Mejorada
- ✅ Endpoints RESTful con validaciones Zod
- ✅ Validación de stock no negativo
- ✅ Validación de precios positivos
- ✅ Endpoints para stock, promociones, banners, login y pago

### Panel de Administración
- ✅ Dashboard con KPIs y gráficos (Recharts)
- ✅ Gestión de productos con tabla, búsqueda y paginación
- ✅ Edición inline de stock
- ✅ Duplicación de productos
- ✅ Layout con sidebar de navegación

### Sistema de Promociones
- ✅ Promociones por producto, categoría, fecha y cantidad
- ✅ Cálculo automático de descuentos
- ✅ Prioridad: descuento individual > promoción
- ✅ Promociones con fechas de inicio y fin

### Integración Mercado Pago
- ✅ Creación de preferencias de pago
- ✅ Logs de compras
- ✅ Redirección a checkout

## 📦 Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar Supabase (Opcional)**
   - Crear proyecto en https://supabase.com
   - Ejecutar el SQL de `lib/supabase-schema.sql` en el SQL Editor
   - Agregar variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

3. **Configurar variables de entorno**
```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu_public_key

# JWT
JWT_SECRET=tu_secret_key_seguro

# Admin (fallback si no hay Supabase)
NEXT_PUBLIC_ADMIN_USERNAME=admin@catalogo.com
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

4. **Ejecutar**
```bash
npm run dev
```

## 🎯 Estructura de Rutas Admin

- `/admin` - Login
- `/admin/dashboard` - Dashboard con KPIs
- `/admin/productos` - Gestión de productos
- `/admin/banners` - Gestión de banners (próximamente)
- `/admin/promociones` - Gestión de promociones (próximamente)

## 🔐 Credenciales por Defecto

- Email: `admin@catalogo.com`
- Password: `admin123`

## 📝 Notas

- Si Supabase no está configurado, el sistema usa datos mock
- Las imágenes se pueden subir localmente (FileReader) o integrar Cloudinary
- El sistema de promociones calcula automáticamente los descuentos
- El stock se actualiza en tiempo real desde la tabla

## 🚧 Próximas Mejoras

- [ ] Gestión de banners con drag & drop
- [ ] Panel completo de promociones
- [ ] Mejoras visuales premium con más animaciones
- [ ] Filtros por color con chips visuales
- [ ] Modo oscuro
- [ ] Carrusel de productos relacionados



