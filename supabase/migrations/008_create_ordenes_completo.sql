-- Migración COMPLETA y DEFINITIVA para crear tabla ordenes
-- Esta migración incluye TODOS los campos necesarios
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Fecha: 2024-11-26

-- Eliminar tabla si existe con estructura incorrecta (solo en desarrollo)
-- ⚠️ NO ejecutar esto en producción si ya hay órdenes
-- DROP TABLE IF EXISTS public.ordenes CASCADE;

-- Crear tabla ordenes con estructura COMPLETA
CREATE TABLE IF NOT EXISTS public.ordenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  productos JSONB NOT NULL,
  comprador JSONB NOT NULL,
  envio JSONB NOT NULL,
  total NUMERIC NOT NULL,
  estado TEXT DEFAULT 'pendiente' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  pago_preferencia_id TEXT,
  pago_id TEXT,
  pago_estado TEXT DEFAULT 'pendiente',
  pago_fecha TIMESTAMP
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS ordenes_created_idx ON public.ordenes (created_at DESC);
CREATE INDEX IF NOT EXISTS ordenes_estado_idx ON public.ordenes (estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_estado_idx ON public.ordenes (pago_estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_id_idx ON public.ordenes (pago_id) WHERE pago_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_comprador_email_idx ON public.ordenes ((comprador->>'email')) WHERE comprador->>'email' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_idx ON public.ordenes ((envio->>'tracking')) WHERE envio->>'tracking' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_number_idx ON public.ordenes ((envio->>'tracking_number')) WHERE envio->>'tracking_number' IS NOT NULL;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permitir operaciones desde el frontend y backend
DROP POLICY IF EXISTS "insert-public" ON public.ordenes;
CREATE POLICY "insert-public" ON public.ordenes
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "select-public" ON public.ordenes;
CREATE POLICY "select-public" ON public.ordenes
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "update-public" ON public.ordenes;
CREATE POLICY "update-public" ON public.ordenes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS trigger_update_ordenes_updated_at ON public.ordenes;
CREATE TRIGGER trigger_update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION update_ordenes_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.ordenes IS 'Órdenes de compra con estructura simplificada (productos, comprador, envio como JSONB)';
COMMENT ON COLUMN public.ordenes.productos IS 'Array JSON con productos: [{id, nombre, precio, cantidad, talle, subtotal, imagenPrincipal}]';
COMMENT ON COLUMN public.ordenes.comprador IS 'Datos del comprador: {nombre, email, telefono}';
COMMENT ON COLUMN public.ordenes.envio IS 'Datos de envío: {tipo, metodo, costo, direccion, tracking, proveedor}';
COMMENT ON COLUMN public.ordenes.total IS 'Total de la orden (productos + envío)';
COMMENT ON COLUMN public.ordenes.estado IS 'Estado de la orden: pendiente, pagada, enviada, entregada, cancelada';
COMMENT ON COLUMN public.ordenes.pago_preferencia_id IS 'ID de la preferencia de pago de Mercado Pago';
COMMENT ON COLUMN public.ordenes.pago_id IS 'ID del pago de Mercado Pago (se completa cuando se aprueba el pago)';
COMMENT ON COLUMN public.ordenes.pago_estado IS 'Estado del pago: pendiente, aprobado, rechazado, cancelado';
COMMENT ON COLUMN public.ordenes.pago_fecha IS 'Fecha en que se aprobó el pago';

-- Verificar que la migración se aplicó correctamente
DO $$
DECLARE
  tabla_existe BOOLEAN;
  campos_count INTEGER;
BEGIN
  -- Verificar que la tabla existe
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ordenes'
  ) INTO tabla_existe;

  IF tabla_existe THEN
    -- Contar campos críticos
    SELECT COUNT(*) INTO campos_count
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'ordenes'
    AND column_name IN ('id', 'productos', 'comprador', 'envio', 'total', 'estado', 'created_at');
    
    IF campos_count = 7 THEN
      RAISE NOTICE '✅ Migración completada exitosamente. Tabla ordenes creada con estructura correcta.';
    ELSE
      RAISE WARNING '⚠️ Migración incompleta. Campos encontrados: % de 7 esperados', campos_count;
    END IF;
  ELSE
    RAISE EXCEPTION '❌ ERROR: La tabla ordenes no se creó correctamente';
  END IF;
END $$;

