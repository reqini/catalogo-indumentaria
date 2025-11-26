-- Migración URGENTE: Crear tabla ordenes
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Fecha: 2024-11-26
-- PRIORIDAD: CRÍTICA - Resuelve error PGRST205

-- Crear tabla ordenes con estructura completa
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

-- Política para INSERT (permite crear órdenes desde frontend)
DROP POLICY IF EXISTS "insert-public" ON public.ordenes;
CREATE POLICY "insert-public" ON public.ordenes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para SELECT (permite leer órdenes)
DROP POLICY IF EXISTS "select-public" ON public.ordenes;
CREATE POLICY "select-public" ON public.ordenes
  FOR SELECT
  TO anon
  USING (true);

-- Política para UPDATE (permite actualizar órdenes desde backend)
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
COMMENT ON COLUMN public.ordenes.envio IS 'Datos de envío: {tipo, metodo, costo, direccion, tracking, tracking_number, provider}';
COMMENT ON COLUMN public.ordenes.pago_preferencia_id IS 'ID de la preferencia de pago de Mercado Pago';
COMMENT ON COLUMN public.ordenes.pago_id IS 'ID del pago de Mercado Pago (se completa cuando se aprueba el pago)';
COMMENT ON COLUMN public.ordenes.pago_estado IS 'Estado del pago: pendiente, aprobado, rechazado, cancelado';
