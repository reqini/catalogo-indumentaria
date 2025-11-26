# 🔥 SOLUCIÓN INMEDIATA - Error PGRST205

**URGENTE:** Ejecuta esto AHORA para resolver el error de compra

---

## ⚡ MÉTODO RÁPIDO (2 minutos)

### Paso 1: Ir a Supabase Dashboard

1. Abre: https://supabase.com/dashboard
2. Selecciona tu proyecto

### Paso 2: Abrir SQL Editor

1. Click en **"SQL Editor"** en el menú lateral
2. Click en **"New query"**

### Paso 3: Copiar y Pegar este SQL

```sql
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

CREATE INDEX IF NOT EXISTS ordenes_created_idx ON public.ordenes (created_at DESC);
CREATE INDEX IF NOT EXISTS ordenes_estado_idx ON public.ordenes (estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_estado_idx ON public.ordenes (pago_estado);
CREATE INDEX IF NOT EXISTS ordenes_pago_id_idx ON public.ordenes (pago_id) WHERE pago_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_comprador_email_idx ON public.ordenes ((comprador->>'email')) WHERE comprador->>'email' IS NOT NULL;
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_idx ON public.ordenes ((envio->>'tracking')) WHERE envio->>'tracking' IS NOT NULL;

ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert-public" ON public.ordenes;
CREATE POLICY "insert-public" ON public.ordenes FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "select-public" ON public.ordenes;
CREATE POLICY "select-public" ON public.ordenes FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "update-public" ON public.ordenes;
CREATE POLICY "update-public" ON public.ordenes FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ordenes_updated_at ON public.ordenes;
CREATE TRIGGER trigger_update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION update_ordenes_updated_at();
```

### Paso 4: Ejecutar

1. Click en **"Run"** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
2. Deberías ver: **"Success. No rows returned"**

### Paso 5: Verificar

1. Ve a **"Table Editor"**
2. Busca la tabla **`ordenes`**
3. Debería aparecer con todas las columnas

---

## ✅ DESPUÉS DE EJECUTAR

1. **Espera 1-2 minutos** (para que se actualice el cache)
2. **Prueba hacer una compra:**
   - Agregar producto al carrito
   - Ir a checkout
   - Completar datos
   - Click en "Pagar Ahora"
3. **Debería funcionar sin error PGRST205**

---

## 🆘 SI AÚN NO FUNCIONA

1. Verifica que el SQL se ejecutó sin errores
2. Espera 2-3 minutos más
3. Prueba nuevamente
4. Si persiste, revisa logs en Vercel Dashboard

---

**¡EJECUTA EL SQL AHORA Y EL ERROR SE RESUELVE INMEDIATAMENTE!**
