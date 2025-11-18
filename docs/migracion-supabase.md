# 🚀 Migración de MongoDB a Supabase

## Guía Completa de Migración

Esta guía te ayudará a migrar completamente de MongoDB a Supabase.

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Crear Proyecto en Supabase](#crear-proyecto-en-supabase)
3. [Ejecutar Migraciones SQL](#ejecutar-migraciones-sql)
4. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
5. [Migrar Datos](#migrar-datos)
6. [Verificar Migración](#verificar-migración)

## 1. Configuración Inicial

### Instalar dependencias

```bash
pnpm install @supabase/supabase-js
```

## 2. Crear Proyecto en Supabase

### Paso 1: Crear cuenta
1. Ve a: https://supabase.com
2. Haz clic en "Start your project"
3. Regístrate con GitHub o email

### Paso 2: Crear proyecto
1. Haz clic en "New Project"
2. Completa:
   - **Name**: `catalogo-indumentaria`
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Elige la más cercana
   - **Pricing Plan**: Free (suficiente para desarrollo)
3. Haz clic en "Create new project"
4. ⏳ Espera 2-3 minutos mientras se crea el proyecto

### Paso 3: Obtener credenciales
1. En el dashboard de Supabase, ve a **Settings** → **API**
2. Copia:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ secreta, solo para servidor)

## 3. Ejecutar Migraciones SQL

### Opción A: Desde Supabase Dashboard (Recomendado)

1. Ve a **SQL Editor** en el dashboard de Supabase
2. Haz clic en **"New query"**
3. Copia y pega el contenido de `supabase/migrations/001_initial_schema.sql`
4. Haz clic en **"Run"** o presiona `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
5. Verifica que todas las tablas se crearon correctamente

### Opción B: Desde CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Vincular con tu proyecto
supabase link --project-ref tu-project-ref

# Ejecutar migración
supabase db push
```

## 4. Configurar Variables de Entorno

### Local (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Remover MongoDB (opcional, mantener para migración)
# MONGODB_URI=mongodb://...
```

### Vercel

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **REDESPLIEGA** el proyecto

## 5. Migrar Datos

### Script de migración automática

```bash
# Migrar datos de MongoDB a Supabase
pnpm migrate-to-supabase
```

### Migración manual

Si tienes datos en MongoDB que quieres migrar:

1. Exporta datos de MongoDB:
```bash
mongodump --uri="mongodb://localhost:27017/catalogo_indumentaria" --out=./backup
```

2. Convierte a formato SQL o usa el script de migración

## 6. Verificar Migración

### Probar conexión

```bash
pnpm test-supabase
```

### Verificar en Supabase Dashboard

1. Ve a **Table Editor** en Supabase
2. Deberías ver todas las tablas creadas:
   - `tenants`
   - `productos`
   - `banners`
   - `planes`
   - `compra_logs`
   - `categorias`
   - `stock_logs`
   - `ventas`

## 📊 Estructura de Tablas

### tenants
- Almacena usuarios/negocios del sistema SaaS
- Campos principales: `tenant_id`, `email`, `plan`, `branding`

### productos
- Catálogo de productos
- Campos principales: `nombre`, `precio`, `categoria`, `stock` (JSONB)

### banners
- Banners del carousel/home
- Campos principales: `imagen_url`, `orden`, `activo`

### planes
- Planes de suscripción
- Campos principales: `nombre`, `precio`, `limite_productos`

### compra_logs
- Registro de compras/pagos
- Campos principales: `estado`, `preferencia_id`, `mp_payment_id`

### categorias
- Categorías de productos
- Campos principales: `nombre`, `slug`, `activa`

### stock_logs
- Historial de cambios de stock
- Campos principales: `producto_id`, `accion`, `cantidad`

### ventas
- Ventas/suscripciones
- Campos principales: `tenant_id`, `plan_id`, `estado`

## 🔐 Seguridad (RLS)

Row Level Security está habilitado en todas las tablas. Las políticas básicas permiten:
- Lectura pública de productos/banners activos
- Escritura solo con autenticación (service_role_key en servidor)

## 🆘 Solución de Problemas

### Error: "relation does not exist"
- Verifica que ejecutaste la migración SQL
- Revisa que el nombre de la tabla sea correcto (minúsculas)

### Error: "permission denied"
- Verifica que estás usando `service_role_key` en rutas API
- Revisa las políticas RLS en Supabase

### Error: "invalid input syntax"
- Verifica que los tipos de datos coincidan (JSONB para objetos, TEXT[] para arrays)

## 📝 Notas Importantes

- ⚠️ **NUNCA** expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente
- ✅ Usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el cliente
- 🔄 Los timestamps se manejan automáticamente con triggers
- 📊 JSONB permite almacenar objetos complejos (stock, metadata, branding)

## ✅ Checklist de Migración

- [ ] Proyecto creado en Supabase
- [ ] Migración SQL ejecutada
- [ ] Variables de entorno configuradas
- [ ] Cliente de Supabase configurado (`lib/supabase.ts`)
- [ ] Rutas API actualizadas
- [ ] Scripts de seed actualizados
- [ ] Datos migrados (si aplica)
- [ ] Pruebas realizadas
- [ ] Variables configuradas en Vercel
- [ ] Deployment verificado

## 🚀 Próximos Pasos

Después de completar la migración:
1. Actualiza todas las rutas API para usar Supabase
2. Actualiza scripts de seed
3. Prueba todas las funcionalidades
4. Elimina dependencias de MongoDB si ya no las necesitas

