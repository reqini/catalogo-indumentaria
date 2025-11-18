-- Esquema de base de datos para Supabase (PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
  descuento DECIMAL(5, 2) DEFAULT 0 CHECK (descuento >= 0 AND descuento <= 100),
  color VARCHAR(50),
  categoria VARCHAR(100) NOT NULL,
  talles TEXT[] DEFAULT '{}',
  stock JSONB DEFAULT '{}',
  imagenes TEXT[] DEFAULT '{}',
  imagen_principal TEXT,
  id_mercado_pago VARCHAR(255),
  destacado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Tabla de banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255),
  subtitulo VARCHAR(255),
  imagen TEXT NOT NULL,
  link TEXT,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla de promociones
CREATE TABLE IF NOT EXISTS promociones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('producto', 'categoria', 'fecha', 'cantidad')),
  valor DECIMAL(10, 2) NOT NULL,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  categoria VARCHAR(100),
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  cantidad_minima INTEGER,
  activa BOOLEAN DEFAULT true,
  mostrar_en_home BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) DEFAULT 'user' CHECK (rol IN ('admin', 'user')),
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla de compras (logs)
CREATE TABLE IF NOT EXISTS compras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES productos(id),
  nombre_producto VARCHAR(255),
  talle VARCHAR(10),
  cantidad INTEGER,
  precio_unitario DECIMAL(10, 2),
  precio_total DECIMAL(10, 2),
  id_pago_mercado_pago VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_destacado ON productos(destacado);
CREATE INDEX IF NOT EXISTS idx_banners_activo_orden ON banners(activo, orden);
CREATE INDEX IF NOT EXISTS idx_promociones_activa ON promociones(activa);
CREATE INDEX IF NOT EXISTS idx_promociones_fechas ON promociones(fecha_inicio, fecha_fin);

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar fecha_actualizacion
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Usuario admin por defecto (password: admin123)
-- Hash generado con bcrypt para 'admin123'
INSERT INTO usuarios (email, password_hash, rol)
VALUES ('admin@catalogo.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'admin')
ON CONFLICT (email) DO NOTHING;



