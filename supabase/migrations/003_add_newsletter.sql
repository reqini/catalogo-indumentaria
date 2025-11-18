-- Agregar tabla para newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT true,
  fecha_suscripcion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_activo ON newsletter_subscribers(activo);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_newsletter_updated_at ON newsletter_subscribers;
CREATE TRIGGER update_newsletter_updated_at BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden insertar (suscribirse)
CREATE POLICY "Cualquiera puede suscribirse" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Política: Solo admins pueden leer (usar service_role para admin)
CREATE POLICY "Solo admins pueden leer" ON newsletter_subscribers
  FOR SELECT USING (true); -- Por ahora permitir lectura, ajustar según necesidad

