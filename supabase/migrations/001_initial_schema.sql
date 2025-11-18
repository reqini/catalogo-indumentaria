-- Migración inicial: Esquema completo de Catálogo Indumentaria
-- Ejecutar en Supabase SQL Editor

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: tenants (usuarios/negocios)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id TEXT UNIQUE NOT NULL,
  nombre_negocio TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  mp_id TEXT,
  branding JSONB DEFAULT '{"primaryColor": "#000000", "secondaryColor": "#ffffff", "font": "Inter"}'::jsonb,
  subdomain TEXT UNIQUE,
  dominio TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_alta TIMESTAMPTZ DEFAULT NOW(),
  fecha_renovacion TIMESTAMPTZ,
  rol TEXT DEFAULT 'tenant' CHECK (rol IN ('tenant', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para tenants
CREATE INDEX IF NOT EXISTS idx_tenants_tenant_id ON tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_plan_activo ON tenants(plan, activo);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);

-- Tabla: productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
  descuento DECIMAL(5, 2) CHECK (descuento >= 0 AND descuento <= 100),
  color TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('Running', 'Training', 'Lifestyle', 'Kids', 'Outdoor', 'remeras', 'pantalones', 'buzos', 'accesorios')),
  stock JSONB DEFAULT '{}'::jsonb,
  talles TEXT[] NOT NULL,
  imagen_principal TEXT,
  imagenes_sec TEXT[] DEFAULT '{}',
  id_mercado_pago TEXT,
  tags TEXT[] DEFAULT '{}',
  destacado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_tenant_id_activo ON productos(tenant_id, activo);
CREATE INDEX IF NOT EXISTS idx_productos_tenant_id_categoria ON productos(tenant_id, categoria);
CREATE INDEX IF NOT EXISTS idx_productos_categoria_destacado ON productos(categoria, destacado);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_tags ON productos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos USING GIN(to_tsvector('spanish', nombre));

-- Tabla: banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  titulo TEXT,
  imagen_url TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para banners
CREATE INDEX IF NOT EXISTS idx_banners_tenant_id_activo ON banners(tenant_id, activo);
CREATE INDEX IF NOT EXISTS idx_banners_tenant_id_orden ON banners(tenant_id, orden);
CREATE INDEX IF NOT EXISTS idx_banners_activo_orden ON banners(activo, orden);

-- Tabla: planes
CREATE TABLE IF NOT EXISTS planes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  limite_productos INTEGER NOT NULL,
  limite_banners INTEGER NOT NULL,
  beneficios TEXT[] DEFAULT '{}',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: compra_logs
CREATE TABLE IF NOT EXISTS compra_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  preferencia_id TEXT,
  mp_payment_id TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
  fecha TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para compra_logs
CREATE INDEX IF NOT EXISTS idx_compra_logs_fecha ON compra_logs(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_compra_logs_estado_fecha ON compra_logs(estado, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_compra_logs_preferencia_id ON compra_logs(preferencia_id);

-- Tabla: categorias
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: stock_logs
CREATE TABLE IF NOT EXISTS stock_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  accion TEXT NOT NULL CHECK (accion IN ('alta', 'baja', 'modificacion')),
  cantidad INTEGER NOT NULL,
  talle TEXT,
  usuario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para stock_logs
CREATE INDEX IF NOT EXISTS idx_stock_logs_producto_id ON stock_logs(producto_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_created_at ON stock_logs(created_at DESC);

-- Tabla: ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  plan_id UUID REFERENCES planes(id),
  mp_subscription_id TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activa', 'cancelada', 'vencida')),
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ,
  monto DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para ventas
CREATE INDEX IF NOT EXISTS idx_ventas_tenant_id ON ventas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planes_updated_at BEFORE UPDATE ON planes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at BEFORE UPDATE ON ventas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Políticas básicas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer productos activos
CREATE POLICY "Productos activos son públicos" ON productos
  FOR SELECT USING (activo = true);

-- Política: Todos pueden leer banners activos
CREATE POLICY "Banners activos son públicos" ON banners
  FOR SELECT USING (activo = true);

-- Política: Todos pueden leer planes activos
CREATE POLICY "Planes activos son públicos" ON planes
  FOR SELECT USING (activo = true);

-- Política: Todos pueden leer categorias activas
CREATE POLICY "Categorias activas son públicas" ON categorias
  FOR SELECT USING (activa = true);

-- Nota: Las políticas de escritura se configurarán según la autenticación
-- Por ahora, el servicio usará service_role_key para operaciones admin

