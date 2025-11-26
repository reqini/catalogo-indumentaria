-- Migración simplificada para crear tabla ordenes
-- Estructura básica requerida para el checkout
-- Ejecutar en Supabase Dashboard → SQL Editor

-- Crear tabla ordenes con estructura simplificada
CREATE TABLE IF NOT EXISTS public.ordenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  productos JSONB NOT NULL,
  comprador JSONB NOT NULL,
  envio JSONB NOT NULL,
  total NUMERIC NOT NULL,
  estado TEXT DEFAULT 'pendiente' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS ordenes_created_idx ON public.ordenes (created_at DESC);

-- Índice para búsquedas por estado
CREATE INDEX IF NOT EXISTS ordenes_estado_idx ON public.ordenes (estado);

-- Habilitar RLS
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

-- Política para INSERT (permite crear órdenes)
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

-- Comentarios para documentación
COMMENT ON TABLE public.ordenes IS 'Órdenes de compra con estructura simplificada (productos, comprador, envio como JSONB)';
COMMENT ON COLUMN public.ordenes.productos IS 'Array JSON con productos: [{id, nombre, precio, cantidad, talle, subtotal}]';
COMMENT ON COLUMN public.ordenes.comprador IS 'Datos del comprador: {nombre, email, telefono}';
COMMENT ON COLUMN public.ordenes.envio IS 'Datos de envío: {tipo, metodo, costo, direccion}';

