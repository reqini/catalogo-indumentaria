-- Schema de órdenes para circuito de compra completo
-- Ejecutar en el SQL Editor de Supabase

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS ordenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información del cliente
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  cliente_telefono VARCHAR(50),
  
  -- Dirección de envío
  direccion_calle VARCHAR(255) NOT NULL,
  direccion_numero VARCHAR(50) NOT NULL,
  direccion_piso_depto VARCHAR(50),
  direccion_codigo_postal VARCHAR(10) NOT NULL,
  direccion_localidad VARCHAR(255) NOT NULL,
  direccion_provincia VARCHAR(255) NOT NULL,
  direccion_pais VARCHAR(100) DEFAULT 'Argentina',
  
  -- Envío
  envio_tipo VARCHAR(50) NOT NULL, -- 'estandar', 'express', 'retiro_local'
  envio_metodo VARCHAR(100), -- 'OCA Estándar', 'Andreani Express', etc.
  envio_costo DECIMAL(10, 2) DEFAULT 0,
  envio_tracking VARCHAR(255), -- Número de seguimiento
  envio_proveedor VARCHAR(100), -- 'OCA', 'Andreani', 'Correo Argentino', etc.
  
  -- Productos (JSONB para flexibilidad)
  items JSONB NOT NULL DEFAULT '[]',
  -- Estructura: [{ id, nombre, precio, cantidad, talle, subtotal }]
  
  -- Totales
  subtotal DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  envio_costo_total DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Pago
  pago_metodo VARCHAR(50) DEFAULT 'mercadopago',
  pago_estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado', 'cancelado'
  pago_preferencia_id VARCHAR(255),
  pago_id VARCHAR(255), -- Payment ID de Mercado Pago
  pago_fecha TIMESTAMP,
  
  -- Estado de la orden
  estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'pagada', 'enviada', 'entregada', 'cancelada'
  estado_fecha TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  notas TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de logs de órdenes (para auditoría)
CREATE TABLE IF NOT EXISTS ordenes_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_id UUID REFERENCES ordenes(id) ON DELETE CASCADE,
  accion VARCHAR(100) NOT NULL, -- 'creada', 'pago_aprobado', 'enviada', 'entregada', etc.
  usuario VARCHAR(255), -- Usuario que realizó la acción
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente_email ON ordenes(cliente_email);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_pago_estado ON ordenes(pago_estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_pago_id ON ordenes(pago_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_pago_preferencia_id ON ordenes(pago_preferencia_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_created_at ON ordenes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ordenes_envio_tracking ON ordenes(envio_tracking);
CREATE INDEX IF NOT EXISTS idx_ordenes_logs_orden_id ON ordenes_logs(orden_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_logs_created_at ON ordenes_logs(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_ordenes_updated_at 
BEFORE UPDATE ON ordenes
FOR EACH ROW 
EXECUTE FUNCTION update_ordenes_updated_at();

-- Función para crear log de orden automáticamente
CREATE OR REPLACE FUNCTION log_orden_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ordenes_logs (orden_id, accion, datos_anteriores, datos_nuevos)
  VALUES (
    NEW.id,
    CASE 
      WHEN OLD.estado IS NULL THEN 'creada'
      WHEN NEW.estado != OLD.estado THEN 'estado_cambiado'
      WHEN NEW.pago_estado != OLD.pago_estado THEN 'pago_actualizado'
      ELSE 'actualizada'
    END,
    row_to_json(OLD),
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para logs automáticos
CREATE TRIGGER log_orden_changes
AFTER INSERT OR UPDATE ON ordenes
FOR EACH ROW
EXECUTE FUNCTION log_orden_change();

-- Comentarios para documentación
COMMENT ON TABLE ordenes IS 'Órdenes de compra completas con datos de cliente, envío y pago';
COMMENT ON TABLE ordenes_logs IS 'Logs de auditoría para cambios en órdenes';
COMMENT ON COLUMN ordenes.items IS 'Array JSON con productos: [{id, nombre, precio, cantidad, talle, subtotal}]';
COMMENT ON COLUMN ordenes.metadata IS 'Datos adicionales flexibles en formato JSON';

