-- Fix: Hacer triggers idempotentes
-- Este script corrige el error de triggers duplicados

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;

-- Recrear el trigger
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

