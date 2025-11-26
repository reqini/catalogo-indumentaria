-- Migración: Agregar campos de pago a tabla ordenes
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Fecha: 2024-11-26

-- Agregar campos de pago si no existen
DO $$
BEGIN
  -- Campo para preference ID de Mercado Pago
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ordenes' 
    AND column_name = 'pago_preferencia_id'
  ) THEN
    ALTER TABLE public.ordenes ADD COLUMN pago_preferencia_id TEXT;
    RAISE NOTICE 'Campo pago_preferencia_id agregado';
  ELSE
    RAISE NOTICE 'Campo pago_preferencia_id ya existe';
  END IF;
  
  -- Campo para payment ID de Mercado Pago
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ordenes' 
    AND column_name = 'pago_id'
  ) THEN
    ALTER TABLE public.ordenes ADD COLUMN pago_id TEXT;
    RAISE NOTICE 'Campo pago_id agregado';
  ELSE
    RAISE NOTICE 'Campo pago_id ya existe';
  END IF;
  
  -- Campo para estado del pago
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ordenes' 
    AND column_name = 'pago_estado'
  ) THEN
    ALTER TABLE public.ordenes ADD COLUMN pago_estado TEXT DEFAULT 'pendiente';
    RAISE NOTICE 'Campo pago_estado agregado';
  ELSE
    RAISE NOTICE 'Campo pago_estado ya existe';
  END IF;
  
  -- Campo para fecha del pago
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ordenes' 
    AND column_name = 'pago_fecha'
  ) THEN
    ALTER TABLE public.ordenes ADD COLUMN pago_fecha TIMESTAMP;
    RAISE NOTICE 'Campo pago_fecha agregado';
  ELSE
    RAISE NOTICE 'Campo pago_fecha ya existe';
  END IF;
  
  -- Campo para fecha de actualización
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ordenes' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.ordenes ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Campo updated_at agregado';
  ELSE
    RAISE NOTICE 'Campo updated_at ya existe';
  END IF;
END $$;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS ordenes_pago_estado_idx ON public.ordenes (pago_estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_id_idx ON public.ordenes (pago_id) WHERE pago_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_comprador_email_idx ON public.ordenes ((comprador->>'email')) WHERE comprador->>'email' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_idx ON public.ordenes ((envio->>'tracking')) WHERE envio->>'tracking' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_number_idx ON public.ordenes ((envio->>'tracking_number')) WHERE envio->>'tracking_number' IS NOT NULL;

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_ordenes_updated_at ON public.ordenes;
CREATE TRIGGER trigger_update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION update_ordenes_updated_at();

-- Comentarios para documentación
COMMENT ON COLUMN public.ordenes.pago_preferencia_id IS 'ID de la preferencia de pago de Mercado Pago';
COMMENT ON COLUMN public.ordenes.pago_id IS 'ID del pago de Mercado Pago (se completa cuando se aprueba el pago)';
COMMENT ON COLUMN public.ordenes.pago_estado IS 'Estado del pago: pendiente, aprobado, rechazado, cancelado';
COMMENT ON COLUMN public.ordenes.pago_fecha IS 'Fecha en que se aprobó el pago';
COMMENT ON COLUMN public.ordenes.updated_at IS 'Fecha de última actualización de la orden';

-- Verificar que la migración se aplicó correctamente
DO $$
DECLARE
  campos_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO campos_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
  AND table_name = 'ordenes'
  AND column_name IN ('pago_preferencia_id', 'pago_id', 'pago_estado', 'pago_fecha', 'updated_at');
  
  IF campos_count = 5 THEN
    RAISE NOTICE '✅ Migración completada exitosamente. Todos los campos agregados.';
  ELSE
    RAISE WARNING '⚠️ Migración incompleta. Campos encontrados: % de 5', campos_count;
  END IF;
END $$;

