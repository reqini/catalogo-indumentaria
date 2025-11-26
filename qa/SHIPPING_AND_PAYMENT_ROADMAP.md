# 🗺️ Roadmap de Implementación - Envíos y Pagos

**Fecha de Creación:** 26/11/2025  
**Prioridad:** 🔴 **ALTA** - Sistema funcional pero requiere configuración para producción real

---

## 📋 Lista Exacta de lo que Falta

### 🔴 CRÍTICO (Bloquea producción real)

1. **Credenciales de Envíopack**
   - ❌ `ENVIOPACK_API_KEY` no configurado
   - ❌ `ENVIOPACK_API_SECRET` no configurado
   - **Impacto:** Sistema funciona en modo simulado, costos pueden no ser precisos

2. **Credenciales de Mercado Pago (Validar)**
   - ⚠️ `MP_ACCESS_TOKEN` - Requiere verificación en producción
   - ⚠️ `MP_WEBHOOK_SECRET` - Recomendado para seguridad
   - **Impacto:** Sin validación, no se puede confirmar funcionamiento real

### 🟡 IMPORTANTE (Mejora experiencia)

3. **Webhook de Envíopack**
   - ❌ Endpoint `/api/webhooks/envioPack` no implementado
   - **Impacto:** Estados de envío no se actualizan automáticamente

4. **Generación de Etiquetas PDF**
   - ❌ Endpoint `/api/envios/etiqueta/{orderId}` no implementado
   - **Impacto:** Requiere generación manual de etiquetas

5. **Campo Peso en Productos**
   - ❌ Campo `peso` no existe en tabla `productos`
   - **Impacto:** Peso estimado puede ser incorrecto

6. **API de Códigos Postales**
   - ❌ Validación de CP es básica (simulada)
   - **Impacto:** Códigos postales inválidos pueden pasar

### 🟢 OPCIONAL (Mejoras futuras)

7. **Endpoint de Tracking**
   - ❌ `/api/envios/tracking/{trackingNumber}` no implementado
   - **Impacto:** Clientes no pueden consultar estado desde la app

8. **Integración OCA Directa**
   - ❌ Sin integración real con OCA API
   - **Impacto:** Dependencia de Envíopack para OCA

9. **Integración Andreani Directa**
   - ❌ Sin integración real con Andreani API
   - **Impacto:** Dependencia de Envíopack para Andreani

---

## 👤 Información que Debes Entregar (Luciano)

### 🔴 OBLIGATORIO para Producción Real

#### 1. Credenciales de Envíopack

**Qué necesitas:**

- Registrarte en [Envíopack](https://www.enviopack.com)
- Obtener API Key y Secret del panel de desarrolladores
- Aprobar cuenta (puede requerir documentación comercial)

**Qué entregar:**

```
ENVIOPACK_API_KEY=tu_api_key_aqui
ENVIOPACK_API_SECRET=tu_api_secret_aqui
```

**Dónde configurar:**

- Vercel Dashboard → Settings → Environment Variables → Production

**Tiempo estimado:** 1-2 días hábiles (depende de aprobación)

#### 2. Validación de Credenciales de Mercado Pago

**Qué verificar:**

- Que `MP_ACCESS_TOKEN` esté configurado en Vercel
- Que el token sea de producción (`APP_USR-`) y no de sandbox (`TEST-`)
- Que `NEXT_PUBLIC_MP_PUBLIC_KEY` esté configurado

**Qué entregar (si falta):**

```
MP_ACCESS_TOKEN=APP_USR-tu_token_de_produccion
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR_tu_public_key
MP_WEBHOOK_SECRET=tu_webhook_secret (opcional pero recomendado)
```

**Dónde obtener:**

- Panel de Mercado Pago → Developers → Credenciales
- Webhook Secret: Panel de Mercado Pago → Webhooks → Configurar

**Tiempo estimado:** 30 minutos

### 🟡 RECOMENDADO para Mejor Experiencia

#### 3. Datos Comerciales para Envíopack

**Qué necesitas:**

- Datos fiscales de la empresa
- Dirección de origen de envíos
- Información de contacto comercial

**Para qué:**

- Configurar cuenta de Envíopack correctamente
- Configurar dirección de remitente
- Habilitar servicios avanzados

**Tiempo estimado:** 1 día hábil

---

## 📅 Orden de Implementación Recomendado

### Fase 1: Configuración Inmediata (1-2 días)

**Objetivo:** Activar sistema real de envíos y validar Mercado Pago

1. **Día 1 - Mañana:**
   - [ ] Obtener credenciales de Envíopack
   - [ ] Configurar `ENVIOPACK_API_KEY` y `ENVIOPACK_API_SECRET` en Vercel
   - [ ] Verificar credenciales de Mercado Pago en Vercel
   - [ ] Configurar `MP_WEBHOOK_SECRET` (si está disponible)

2. **Día 1 - Tarde:**
   - [ ] Hacer redeploy de la aplicación
   - [ ] Probar cotización real con Envíopack
   - [ ] Crear orden de prueba y verificar creación de envío real
   - [ ] Verificar que se genera tracking number real

3. **Día 2:**
   - [ ] Configurar webhook de Mercado Pago en panel de MP
   - [ ] Probar flujo completo: compra → pago → webhook → envío
   - [ ] Verificar que todo funciona correctamente

**Resultado esperado:** Sistema funcionando con envíos reales

---

### Fase 2: Mejoras Críticas (3-5 días)

**Objetivo:** Mejorar precisión y automatización

1. **Día 3:**
   - [ ] Agregar campo `peso` a tabla `productos` en Supabase
   - [ ] Migrar datos existentes (estimar pesos si no están disponibles)
   - [ ] Actualizar formulario de productos para incluir peso

2. **Día 4:**
   - [ ] Implementar endpoint `/api/webhooks/envioPack`
   - [ ] Configurar webhook en panel de Envíopack
   - [ ] Probar actualización automática de estados

3. **Día 5:**
   - [ ] Integrar API de códigos postales de Argentina
   - [ ] Mejorar validación de CP en checkout
   - [ ] Probar autocompletado de localidad/provincia

**Resultado esperado:** Sistema más preciso y automatizado

---

### Fase 3: Funcionalidades Avanzadas (5-7 días)

**Objetivo:** Mejorar experiencia de usuario

1. **Días 6-7:**
   - [ ] Implementar generación de etiquetas PDF
   - [ ] Implementar endpoint de tracking `/api/envios/tracking/{trackingNumber}`
   - [ ] Agregar vista de seguimiento en admin
   - [ ] Agregar vista de seguimiento para clientes

**Resultado esperado:** Experiencia completa de seguimiento

---

### Fase 4: Optimizaciones (Opcional, según necesidad)

**Objetivo:** Integraciones adicionales si se requiere

- [ ] Evaluar necesidad de integración directa con OCA
- [ ] Evaluar necesidad de integración directa con Andreani
- [ ] Implementar según evaluación de negocio

---

## ⏱️ Estimación de Tiempo

### Tiempo Total por Fase

| Fase                                  | Tiempo Estimado | Prioridad     |
| ------------------------------------- | --------------- | ------------- |
| **Fase 1: Configuración**             | 1-2 días        | 🔴 CRÍTICA    |
| **Fase 2: Mejoras Críticas**          | 3-5 días        | 🟡 IMPORTANTE |
| **Fase 3: Funcionalidades Avanzadas** | 5-7 días        | 🟢 OPCIONAL   |
| **Fase 4: Optimizaciones**            | Variable        | ⚪ FUTURO     |

### Tiempo Total Mínimo para Producción Real

**2 días** (solo Fase 1)

### Tiempo Total para Sistema Completo

**9-14 días** (Fases 1-3)

---

## 🎯 Prioridades de Impacto Crítico

### 🔴 Impacto Crítico (Bloquea producción real)

1. **Credenciales de Envíopack**
   - **Impacto:** Sin esto, el sistema funciona pero con costos simulados
   - **Riesgo:** Pérdidas económicas o sobreprecio
   - **Acción:** Obtener credenciales inmediatamente

2. **Validación de Mercado Pago**
   - **Impacto:** Sin validación, no se puede confirmar funcionamiento
   - **Riesgo:** Pagos pueden fallar en producción
   - **Acción:** Verificar credenciales en Vercel

### 🟡 Impacto Alto (Afecta experiencia)

3. **Webhook de Envíopack**
   - **Impacto:** Estados de envío no se actualizan automáticamente
   - **Riesgo:** Clientes no saben estado real de su envío
   - **Acción:** Implementar en Fase 2

4. **Campo Peso en Productos**
   - **Impacto:** Costos de envío pueden ser incorrectos
   - **Riesgo:** Pérdidas económicas por peso incorrecto
   - **Acción:** Implementar en Fase 2

### 🟢 Impacto Medio (Mejora experiencia)

5. **Generación de Etiquetas PDF**
   - **Impacto:** Requiere generación manual de etiquetas
   - **Riesgo:** Proceso lento y propenso a errores
   - **Acción:** Implementar en Fase 3

6. **API de Códigos Postales**
   - **Impacto:** Códigos postales inválidos pueden pasar
   - **Riesgo:** Envíos a direcciones incorrectas
   - **Acción:** Implementar en Fase 2

---

## 📝 Checklist de Acciones Inmediatas

### Para Luciano (Cliente)

- [ ] Registrarse en Envíopack
- [ ] Obtener API Key y Secret de Envíopack
- [ ] Verificar credenciales de Mercado Pago en Vercel Dashboard
- [ ] Configurar variables de entorno en Vercel:
  - [ ] `ENVIOPACK_API_KEY`
  - [ ] `ENVIOPACK_API_SECRET`
  - [ ] `MP_WEBHOOK_SECRET` (opcional pero recomendado)
- [ ] Notificar cuando estén configuradas para hacer redeploy

### Para Desarrollo (Post-configuración)

- [ ] Hacer redeploy de la aplicación
- [ ] Probar cotización real con Envíopack
- [ ] Probar creación de envío real
- [ ] Configurar webhook de Mercado Pago
- [ ] Probar flujo completo end-to-end
- [ ] Validar que todo funciona correctamente

---

## 🚀 Próximos Pasos Inmediatos

1. **HOY:**
   - Obtener credenciales de Envíopack
   - Verificar credenciales de Mercado Pago

2. **MAÑANA:**
   - Configurar variables en Vercel
   - Hacer redeploy
   - Probar integración real

3. **ESTA SEMANA:**
   - Implementar mejoras críticas (Fase 2)
   - Validar funcionamiento completo

---

**Última actualización:** 26/11/2025  
**Estado:** ✅ **LISTO PARA IMPLEMENTAR**
