# 🗺️ Plan de Iteraciones Automáticas - Sistema de Envíos Final

**Fecha:** 2024-11-26  
**Objetivo:** Dejar sistema de envíos 100% productivo en producción real

---

## 🎯 MVP INMEDIATO (Para estar productivo YA)

### Iteración 1: Configuración Crítica (3.5 horas)

**Objetivo:** Habilitar pagos y envíos reales

#### Tareas Automáticas:

1. **Configurar Mercado Pago** (30 min)
   - ✅ Script de verificación de credenciales
   - ✅ Documentación de configuración
   - ⚠️ **REQUIERE ACCIÓN MANUAL**: Agregar credenciales en Vercel

2. **Configurar Envíopack** (2 horas)
   - ✅ Código de integración listo
   - ✅ Fallback a simulación funcionando
   - ⚠️ **REQUIERE ACCIÓN MANUAL**: Agregar credenciales en Vercel

3. **Migrar tabla ordenes** (1 hora)
   - ✅ Migración SQL preparada
   - ⚠️ **REQUIERE ACCIÓN MANUAL**: Ejecutar en Supabase Dashboard

**Resultado esperado:** Sistema funcionando con envíos y pagos reales

---

## 📋 BACKLOG TÉCNICO ORGANIZADO POR PRIORIDAD

### 🔴 ALTA PRIORIDAD (Esta semana)

#### Iteración 2: Unificación y Correcciones (2 horas)

**Tareas automáticas:**

1. **Unificar endpoints de checkout** (1 hora)
   - [ ] Analizar diferencias entre `create-order` y `create-order-simple`
   - [ ] Decidir endpoint único a usar
   - [ ] Actualizar frontend para usar endpoint unificado
   - [ ] Eliminar endpoint duplicado
   - [ ] Probar flujo completo

2. **Agregar campos faltantes a tabla ordenes** (1 hora)
   - [ ] Crear migración SQL completa
   - [ ] Agregar campos: `pago_preferencia_id`, `pago_id`, `pago_estado`, `pago_fecha`, `updated_at`
   - [ ] Agregar índices necesarios
   - [ ] Actualizar código para usar nuevos campos
   - [ ] Probar creación y actualización de orden

**Resultado esperado:** Endpoints unificados, tabla ordenes completa

---

#### Iteración 3: Tracking y UX (3 horas)

**Tareas automáticas:**

1. **Crear página de tracking para usuarios** (2 horas)
   - [ ] Crear `app/(ecommerce)/envio/[trackingNumber]/page.tsx`
   - [ ] Integrar con endpoint `/api/shipping/tracking/[trackingNumber]`
   - [ ] Mostrar estado, ubicación, fecha estimada
   - [ ] Agregar link en página de éxito
   - [ ] Agregar link en emails de notificación
   - [ ] Probar visualización completa

2. **Completar retiro en local** (1 hora)
   - [ ] Crear migración para variables de entorno (documentación)
   - [ ] Actualizar `ShippingCalculator` para usar variables
   - [ ] Actualizar página de éxito para mostrar información
   - [ ] Actualizar emails para incluir información
   - [ ] Probar flujo completo

**Resultado esperado:** Tracking visible para usuarios, retiro en local completo

---

### 🟡 MEDIA PRIORIDAD (Próximas 2 semanas)

#### Iteración 4: Seguridad y Validaciones (2 horas)

**Tareas automáticas:**

1. **Mejorar validación de webhooks** (1 hora)
   - [ ] Verificar que `MP_WEBHOOK_SECRET` se usa correctamente
   - [ ] Verificar que `ENVIOPACK_WEBHOOK_SECRET` se usa correctamente
   - [ ] Agregar logs de validación
   - [ ] Probar rechazo de webhooks inválidos

2. **Mejorar manejo de errores** (1 hora)
   - [ ] Mensajes de error más amigables en frontend
   - [ ] Logs estructurados en backend
   - [ ] Manejo de errores de API de envíos
   - [ ] Retry logic mejorado

**Resultado esperado:** Sistema más seguro y robusto

---

#### Iteración 5: Mejoras de UX (6 horas)

**Tareas automáticas:**

1. **Autocompletado de código postal** (4 horas)
   - [ ] Integrar API de códigos postales de Argentina
   - [ ] Autocompletar localidad/provincia automáticamente
   - [ ] Validar CP antes de calcular envío
   - [ ] Mejorar UX del formulario

2. **Notificaciones mejoradas** (2 horas)
   - [ ] Email cuando se crea envío (con tracking)
   - [ ] Email cuando se actualiza estado
   - [ ] Email cuando se entrega
   - [ ] WhatsApp opcional (si está configurado)

**Resultado esperado:** Mejor experiencia de usuario

---

### 🟢 BAJA PRIORIDAD (Futuro)

#### Iteración 6: Funcionalidades Avanzadas (5 horas)

**Tareas automáticas:**

1. **Generación de etiquetas PDF** (3 horas)
   - [ ] Endpoint `/api/shipping/label/[orderId]`
   - [ ] Generar PDF con código de barras
   - [ ] Descargar desde admin panel
   - [ ] Enviar por email al cliente

2. **Cache de cálculos** (2 horas)
   - [ ] Cachear resultados por CP (24h)
   - [ ] Reducir llamadas a API
   - [ ] Mejorar performance

**Resultado esperado:** Funcionalidades avanzadas operativas

---

## 🔄 TAREAS AUTOMÁTICAS PARA RESOLVER

### Tarea 1: Verificar y Corregir Tabla Ordenes

**Script automático:**

```sql
-- Verificar estructura actual
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'ordenes';

-- Agregar campos faltantes si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ordenes' AND column_name = 'pago_preferencia_id') THEN
    ALTER TABLE public.ordenes ADD COLUMN pago_preferencia_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ordenes' AND column_name = 'pago_id') THEN
    ALTER TABLE public.ordenes ADD COLUMN pago_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ordenes' AND column_name = 'pago_estado') THEN
    ALTER TABLE public.ordenes ADD COLUMN pago_estado TEXT DEFAULT 'pendiente';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ordenes' AND column_name = 'pago_fecha') THEN
    ALTER TABLE public.ordenes ADD COLUMN pago_fecha TIMESTAMP;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'ordenes' AND column_name = 'updated_at') THEN
    ALTER TABLE public.ordenes ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS ordenes_pago_estado_idx ON public.ordenes (pago_estado);
CREATE INDEX IF NOT EXISTS ordenes_comprador_email_idx ON public.ordenes ((comprador->>'email'));
CREATE INDEX IF NOT EXISTS ordenes_envio_tracking_idx ON public.ordenes ((envio->>'tracking'));
```

**Acción:** Ejecutar automáticamente en Supabase Dashboard

---

### Tarea 2: Unificar Endpoints de Checkout

**Decisión técnica:**

- Usar `create-order` como endpoint principal (más completo)
- Mantener `create-order-simple` como fallback temporal
- Actualizar frontend para usar `create-order`

**Cambios automáticos:**

1. Actualizar `app/(ecommerce)/checkout/page.tsx` línea 314
2. Cambiar de `/api/checkout/create-order-simple` a `/api/checkout/create-order`
3. Ajustar estructura de datos enviada si es necesario

---

### Tarea 3: Crear Página de Tracking

**Archivo a crear:** `app/(ecommerce)/envio/[trackingNumber]/page.tsx`

**Funcionalidad:**

- Consultar estado de envío
- Mostrar ubicación actual
- Mostrar fecha estimada de entrega
- Mostrar historial de estados
- Link para consultar en sitio del proveedor

---

### Tarea 4: Completar Retiro en Local

**Cambios automáticos:**

1. Actualizar `components/ShippingCalculator.tsx` para usar variables de entorno
2. Crear componente para mostrar información de retiro
3. Actualizar página de éxito para mostrar información
4. Actualizar emails para incluir información

---

## 📅 CRONOGRAMA DE EJECUCIÓN

### Semana 1 (Días 1-2)

**Día 1:**

- ✅ Configurar Mercado Pago (30 min)
- ✅ Configurar Envíopack (2 horas)
- ✅ Migrar tabla ordenes (1 hora)
- ✅ Probar flujo básico (1 hora)

**Día 2:**

- ✅ Unificar endpoints (1 hora)
- ✅ Crear página de tracking (2 horas)
- ✅ Completar retiro en local (1 hora)
- ✅ QA básico (1 hora)

### Semana 2 (Días 3-5)

**Día 3:**

- ✅ Mejorar validación webhooks (1 hora)
- ✅ Mejorar manejo de errores (1 hora)
- ✅ QA de seguridad (1 hora)

**Día 4-5:**

- ✅ Autocompletado de CP (4 horas)
- ✅ Notificaciones mejoradas (2 horas)
- ✅ QA completo (2 horas)

### Semana 3 (Opcional)

- ✅ Generación de etiquetas PDF (3 horas)
- ✅ Cache de cálculos (2 horas)
- ✅ Optimizaciones finales (2 horas)

---

## 🎯 CRITERIOS DE ÉXITO

### MVP (Iteración 1)

- ✅ Pagos reales funcionando
- ✅ Envíos reales funcionando
- ✅ Tracking básico funcionando
- ✅ Retiro en local funcional

### Completo (Iteración 3)

- ✅ Tracking visible para usuarios
- ✅ Retiro en local completo
- ✅ Endpoints unificados
- ✅ Tabla ordenes completa

### Avanzado (Iteración 6)

- ✅ Etiquetas PDF generadas
- ✅ Cache funcionando
- ✅ Notificaciones completas
- ✅ Autocompletado de CP

---

**Última actualización:** 2024-11-26  
**Estado:** ✅ **PLAN LISTO PARA EJECUTAR**
