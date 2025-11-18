-- Fix: Hacer triggers idempotentes
-- Este script corrige el error de triggers duplicados
-- Ejecuta este script si obtuviste errores de triggers ya existentes

-- Eliminar todos los triggers existentes si existen
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
DROP TRIGGER IF EXISTS update_banners_updated_at ON banners;
DROP TRIGGER IF EXISTS update_planes_updated_at ON planes;
DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias;
DROP TRIGGER IF EXISTS update_ventas_updated_at ON ventas;

-- Recrear todos los triggers
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

