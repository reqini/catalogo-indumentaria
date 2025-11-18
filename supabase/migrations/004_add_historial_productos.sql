-- Migración: Tabla de historial de cambios de productos
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS producto_historial (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  accion TEXT NOT NULL CHECK (accion IN ('crear', 'editar', 'eliminar', 'activar', 'desactivar', 'stock')),
  usuario_id TEXT NOT NULL,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  campo_modificado TEXT,
  valor_anterior TEXT,
  valor_nuevo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_historial_producto_id ON producto_historial(producto_id);
CREATE INDEX IF NOT EXISTS idx_historial_tenant_id ON producto_historial(tenant_id);
CREATE INDEX IF NOT EXISTS idx_historial_created_at ON producto_historial(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historial_accion ON producto_historial(accion);

-- Comentarios para documentación
COMMENT ON TABLE producto_historial IS 'Registro de todos los cambios realizados en productos';
COMMENT ON COLUMN producto_historial.accion IS 'Tipo de acción: crear, editar, eliminar, activar, desactivar, stock';
COMMENT ON COLUMN producto_historial.datos_anteriores IS 'Estado completo del producto antes del cambio (para crear es null)';
COMMENT ON COLUMN producto_historial.datos_nuevos IS 'Estado completo del producto después del cambio (para eliminar es null)';

