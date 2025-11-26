-- Migración para crear tabla ordenes si no existe
-- Ejecutar en Supabase Dashboard → SQL Editor

-- Verificar y crear tabla ordenes
CREATE TABLE IF NOT EXISTS public.ordenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información del cliente
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  cliente_telefono VARCHAR(50),
  
  -- Dirección de envío (puede ser NULL si es retiro en local)
  direccion_calle VARCHAR(255),
  direccion_numero VARCHAR(50),
  direccion_piso_depto VARCHAR(50),
  direccion_codigo_postal VARCHAR(10),
  direccion_localidad VARCHAR(255),
  direccion_provincia VARCHAR(255),
  direccion_pais VARCHAR(100) DEFAULT 'Argentina',
  
  -- Envío
  envio_tipo VARCHAR(50) NOT NULL, -- 'estandar', 'express', 'retiro_local'
  envio_metodo VARCHAR(100), -- 'OCA Estándar', 'Andreani Express', 'Retiro en local', etc.
  envio_costo DECIMAL(10, 2) DEFAULT 0,
  envio_tracking VARCHAR(255), -- Número de seguimiento (NULL si es retiro)
  envio_proveedor VARCHAR(100), -- 'OCA', 'Andreani', 'Correo Argentino', NULL si es retiro
  
  -- Productos (JSONB para flexibilidad)
  items JSONB NOT NULL DEFAULT '[]',
  -- Estructura: [{ id, nombre, precio, cantidad, talle, subtotal, imagenPrincipal }]
  
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
CREATE TABLE IF NOT EXISTS public.ordenes_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_id UUID REFERENCES public.ordenes(id) ON DELETE CASCADE,
  accion VARCHAR(100) NOT NULL, -- 'creada', 'pago_aprobado', 'enviada', 'entregada', etc.
  usuario VARCHAR(255), -- Usuario que realizó la acción
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente_email ON public.ordenes(cliente_email);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON public.ordenes(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_pago_estado ON public.ordenes(pago_estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_pago_id ON public.ordenes(pago_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_pago_preferencia_id ON public.ordenes(pago_preferencia_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_created_at ON public.ordenes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ordenes_envio_tracking ON public.ordenes(envio_tracking);
CREATE INDEX IF NOT EXISTS idx_ordenes_envio_tipo ON public.ordenes(envio_tipo);
CREATE INDEX IF NOT EXISTS idx_ordenes_logs_orden_id ON public.ordenes_logs(orden_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_logs_created_at ON public.ordenes_logs(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_ordenes_updated_at ON public.ordenes;
CREATE TRIGGER update_ordenes_updated_at 
BEFORE UPDATE ON public.ordenes
FOR EACH ROW 
EXECUTE FUNCTION public.update_ordenes_updated_at();

-- Función para crear log de orden automáticamente
CREATE OR REPLACE FUNCTION public.log_orden_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ordenes_logs (orden_id, accion, datos_anteriores, datos_nuevos)
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
DROP TRIGGER IF EXISTS log_orden_changes ON public.ordenes;
CREATE TRIGGER log_orden_changes
AFTER INSERT OR UPDATE ON public.ordenes
FOR EACH ROW
EXECUTE FUNCTION public.log_orden_change();

-- Habilitar RLS (Row Level Security) si es necesario
-- Por ahora, permitir acceso completo desde el backend con service role key
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso completo desde backend (service role)
CREATE POLICY IF NOT EXISTS "Backend full access" ON public.ordenes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política para logs
ALTER TABLE public.ordenes_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Backend full access logs" ON public.ordenes_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE public.ordenes IS 'Órdenes de compra completas con datos de cliente, envío y pago. Soporta envío a domicilio y retiro en local.';
COMMENT ON TABLE public.ordenes_logs IS 'Logs de auditoría para cambios en órdenes';
COMMENT ON COLUMN public.ordenes.items IS 'Array JSON con productos: [{id, nombre, precio, cantidad, talle, subtotal, imagenPrincipal}]';
COMMENT ON COLUMN public.ordenes.metadata IS 'Datos adicionales flexibles en formato JSON';
COMMENT ON COLUMN public.ordenes.envio_tipo IS 'Tipo de envío: estandar, express, o retiro_local';
COMMENT ON COLUMN public.ordenes.direccion_codigo_postal IS 'Código postal (NULL si es retiro en local)';

