# 🚚 Comparativa de Proveedores de Envío

**Fecha de Auditoría:** 26/11/2025  
**Recomendación:** 🥇 **Envíopack** (Integración más rápida y completa)

---

## 📊 Tabla Comparativa

| Proveedor            | Tiempo Integración    | Seguimiento  | Tarifas         | API Completa | Complejidad Técnico | Recomendación        |
| -------------------- | --------------------- | ------------ | --------------- | ------------ | ------------------- | -------------------- |
| **Envíopack**        | ⭐⭐⭐⭐⭐ (1-2 días) | ✅ Real-time | 💰 Competitivas | ✅ Completa  | ⭐⭐ Baja           | 🥇 **RECOMENDADO**   |
| **OCA**              | ⭐⭐⭐ (3-5 días)     | ✅ Real-time | 💰💰 Medianas   | ⚠️ Parcial   | ⭐⭐⭐ Media        | 🥈 Alternativa       |
| **Andreani**         | ⭐⭐⭐ (3-5 días)     | ✅ Real-time | 💰💰💰 Altas    | ⚠️ Parcial   | ⭐⭐⭐ Media        | 🥉 Alternativa       |
| **Correo Argentino** | ⭐⭐ (5-7 días)       | ⚠️ Limitado  | 💰 Muy bajas    | ❌ Básica    | ⭐⭐⭐⭐ Alta       | ⚠️ No recomendado    |
| **ShipNow**          | ⭐⭐⭐⭐ (2-3 días)   | ✅ Real-time | 💰💰 Medianas   | ✅ Completa  | ⭐⭐ Baja           | ✅ Buena opción      |
| **Pudo**             | ⭐⭐⭐ (3-4 días)     | ✅ Real-time | 💰💰 Medianas   | ⚠️ Parcial   | ⭐⭐⭐ Media        | ⚠️ Limitado a puntos |

---

## 🥇 Envíopack (RECOMENDADO)

### Ventajas

- ✅ **Integración más rápida:** Código ya implementado, solo falta configurar credenciales
- ✅ **API completa y documentada:** Endpoints claros y bien estructurados
- ✅ **Múltiples transportistas:** Acceso a OCA, Andreani, Correo Argentino a través de una sola API
- ✅ **Seguimiento en tiempo real:** Webhooks y API de tracking robusta
- ✅ **Generación de etiquetas:** API para generar PDFs automáticamente
- ✅ **Cálculo de costos preciso:** Cotizaciones reales antes de crear envío
- ✅ **Buen soporte técnico:** Documentación clara y soporte activo

### Desventajas

- ⚠️ **Comisión adicional:** Cobra comisión sobre cada envío (típicamente 5-10%)
- ⚠️ **Requiere cuenta:** Necesita registro y aprobación previa

### Requisitos

- API Key y Secret (se obtienen del panel de Envíopack)
- Cuenta activa en Envíopack
- Documentación: https://developers.enviopack.com

### Tiempo de Implementación

**1-2 días** (solo configuración de credenciales, código ya está listo)

---

## 🥈 OCA

### Ventajas

- ✅ **Cobertura nacional amplia:** Llega a todo el país
- ✅ **Tarifas competitivas:** Precios razonables para envíos estándar
- ✅ **Tracking confiable:** Sistema de seguimiento robusto
- ✅ **Múltiples servicios:** Estándar, Express, Sucursal

### Desventajas

- ⚠️ **API compleja:** Requiere múltiples endpoints y autenticación OAuth
- ⚠️ **Documentación limitada:** Menos clara que Envíopack
- ⚠️ **Requiere cuenta corriente:** Necesita proceso de aprobación más largo
- ⚠️ **Integración desde cero:** No hay código preparado

### Requisitos

- Número de cuenta corriente OCA
- Credenciales API (Client ID y Secret)
- Proceso de aprobación (puede tardar semanas)

### Tiempo de Implementación

**3-5 días** (desarrollo completo de integración)

---

## 🥉 Andreani

### Ventajas

- ✅ **Servicio premium:** Calidad reconocida en el mercado
- ✅ **Tracking detallado:** Información muy completa del envío
- ✅ **Múltiples modalidades:** Estándar, Express, Sucursal, Domicilio

### Desventajas

- ⚠️ **Tarifas más altas:** Generalmente más caro que competidores
- ⚠️ **API compleja:** Requiere múltiples pasos y autenticación
- ⚠️ **Documentación técnica:** Menos amigable para desarrolladores
- ⚠️ **Integración desde cero:** No hay código preparado

### Requisitos

- Número de cliente Andreani
- Credenciales API
- Proceso de aprobación comercial

### Tiempo de Implementación

**3-5 días** (desarrollo completo de integración)

---

## ⚠️ Correo Argentino

### Ventajas

- ✅ **Tarifas muy bajas:** La opción más económica
- ✅ **Cobertura nacional:** Llega a todos los rincones del país

### Desventajas

- ❌ **API limitada:** Funcionalidades básicas
- ❌ **Tracking limitado:** Menos información de seguimiento
- ❌ **Tiempos de entrega:** Generalmente más lentos
- ❌ **Documentación escasa:** Poca información técnica disponible
- ❌ **Integración compleja:** Requiere procesos manuales

### Requisitos

- Cuenta empresarial con Correo Argentino
- Proceso de habilitación largo

### Tiempo de Implementación

**5-7 días** (desarrollo completo + procesos administrativos)

---

## ✅ ShipNow

### Ventajas

- ✅ **API moderna:** Bien diseñada y documentada
- ✅ **Múltiples transportistas:** Acceso a varios proveedores
- ✅ **Integración rápida:** Proceso sencillo

### Desventajas

- ⚠️ **Menos conocido:** Menor adopción en el mercado argentino
- ⚠️ **Comisiones:** Similar a Envíopack

### Requisitos

- API Key
- Cuenta activa

### Tiempo de Implementación

**2-3 días** (desarrollo completo de integración)

---

## ⚠️ Pudo

### Ventajas

- ✅ **Puntos de retiro:** Red amplia de puntos de retiro
- ✅ **Tarifas competitivas:** Precios razonables

### Desventajas

- ⚠️ **Limitado a puntos:** No hace entregas a domicilio en todas las zonas
- ⚠️ **API parcial:** Funcionalidades limitadas
- ⚠️ **Menos flexible:** Opciones limitadas de envío

### Requisitos

- API Key
- Cuenta activa

### Tiempo de Implementación

**3-4 días** (desarrollo completo de integración)

---

## 🎯 Recomendación Final

### 🥇 **Envíopack** - RECOMENDADO COMO PRIMERA OPCIÓN

**Razones:**

1. ✅ Código ya implementado (solo falta configurar credenciales)
2. ✅ API completa y bien documentada
3. ✅ Acceso a múltiples transportistas a través de una sola integración
4. ✅ Tiempo de implementación mínimo (1-2 días)
5. ✅ Funcionalidades avanzadas (webhooks, etiquetas PDF, tracking)

**Próximos Pasos:**

1. Obtener credenciales de Envíopack
2. Configurar variables de entorno
3. Probar integración con orden de prueba
4. Activar webhook para actualizaciones automáticas

### 🥈 **OCA** - ALTERNATIVA SI ENVIOPACK NO ES VIABLE

**Razones:**

- Buena cobertura nacional
- Tarifas competitivas
- Tracking confiable

**Consideración:**

- Requiere desarrollo completo de integración (3-5 días)
- Proceso de aprobación más largo

---

## 📋 Plan de Implementación Recomendado

### Fase 1: Envíopack (Inmediato)

- [ ] Obtener credenciales de Envíopack
- [ ] Configurar variables de entorno
- [ ] Probar cotización real
- [ ] Probar creación de envío real
- [ ] Configurar webhook

**Tiempo estimado:** 1-2 días

### Fase 2: Mejoras (Corto plazo)

- [ ] Implementar endpoint de tracking
- [ ] Implementar generación de etiquetas PDF
- [ ] Agregar campo `peso` a productos
- [ ] Integrar API de códigos postales

**Tiempo estimado:** 3-5 días

### Fase 3: Alternativas (Mediano plazo)

- [ ] Evaluar necesidad de OCA directo
- [ ] Evaluar necesidad de Andreani directo
- [ ] Implementar según necesidad de negocio

**Tiempo estimado:** Según necesidad

---

**Última actualización:** 26/11/2025
