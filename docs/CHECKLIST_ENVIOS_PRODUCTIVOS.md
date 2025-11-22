# ✅ Checklist - Envíos Productivos

**Fecha:** 2024-12-19  
**Objetivo:** Dejar el sistema de envíos 100% funcional para producción

---

## 🎯 ESTADO ACTUAL

### ✅ Implementado
- ✅ Integración con Envíopack API (`lib/shipping/envioPack.ts`)
- ✅ Fallback automático a cálculo simulado
- ✅ Estructuras base para OCA, Correo Argentino, Mercado Envíos
- ✅ Endpoint `/api/envios/calcular` funcional
- ✅ Componente `ShippingCalculator` integrado en carrito
- ✅ Guardado de costo de envío en `compra_log.metadata`
- ✅ Logs detallados para debugging
- ✅ Documentación completa

### ⏳ Pendiente para Producción

---

## 📋 CHECKLIST COMPLETO

### 1️⃣ **Configuración de Envíopack** (RECOMENDADO)

#### Paso 1: Registro
- [ ] Registrarse en https://www.enviopack.com
- [ ] Crear cuenta de desarrollador
- [ ] Verificar email si es necesario

#### Paso 2: Obtener Credenciales
- [ ] Acceder al panel de control de Envíopack
- [ ] Buscar sección "API" o "Desarrolladores"
- [ ] Copiar `API Key`
- [ ] Copiar `API Secret`
- [ ] Si no está disponible, contactar soporte de Envíopack

#### Paso 3: Configurar Variables de Entorno

**En `.env.local` (local):**
```env
ENVIOPACK_API_KEY=tu_api_key_aqui
ENVIOPACK_API_SECRET=tu_api_secret_aqui
```

**En Vercel (producción):**
- [ ] Ir a Vercel Dashboard → Settings → Environment Variables
- [ ] Agregar `ENVIOPACK_API_KEY` = `tu_api_key_aqui`
- [ ] Agregar `ENVIOPACK_API_SECRET` = `tu_api_secret_aqui`
- [ ] Seleccionar **Production**, **Preview**, **Development**
- [ ] Guardar

#### Paso 4: Probar Localmente
- [ ] Reiniciar servidor: `pnpm dev`
- [ ] Agregar productos al carrito
- [ ] Ir a checkout
- [ ] Ingresar código postal (ej: `B8000`)
- [ ] Hacer clic en "Calcular"
- [ ] Verificar logs en consola:
  - Debe mostrar: `[ENVIOPACK] 📤 Calculando envío real`
  - Debe mostrar: `[ENVIOPACK] ✅ Métodos obtenidos: X`
- [ ] Verificar que se muestran métodos de envío
- [ ] Verificar que los precios son reales (no simulados)

#### Paso 5: Probar en Producción
- [ ] Esperar deploy automático
- [ ] Abrir `https://catalogo-indumentaria.vercel.app`
- [ ] Repetir pasos de prueba local
- [ ] Verificar logs en Vercel Dashboard → Logs
- [ ] Verificar que funciona correctamente

---

### 2️⃣ **Validación de Funcionalidad**

#### Cálculo de Envíos
- [ ] CP Capital (B1407) → Calcula correctamente
- [ ] CP GBA (B1708) → Calcula correctamente
- [ ] CP Interior (X5000) → Calcula correctamente
- [ ] CP Inválido → Muestra error apropiado
- [ ] Múltiples métodos disponibles (OCA, Andreani, Correo)
- [ ] Precios son reales (no simulados)

#### Selección de Método
- [ ] Seleccionar método funciona
- [ ] Cambiar método funciona
- [ ] Costo se agrega al total correctamente
- [ ] Costo se muestra en resumen

#### Integración con Checkout
- [ ] Envío incluido en preferencia de Mercado Pago
- [ ] Total incluye costo de envío
- [ ] Envío guardado en `compra_log.metadata`
- [ ] Email de confirmación muestra costo de envío

---

### 3️⃣ **Alternativas (Si Envíopack No Está Disponible)**

#### Opción A: Mantener Cálculo Simulado
- [ ] Verificar que funciona correctamente
- [ ] Documentar que son precios estimados
- [ ] Considerar actualizar precios base periódicamente

#### Opción B: Integrar Directamente con OCA
- [ ] Contactar a OCA para obtener credenciales comerciales
- [ ] Completar `lib/shipping/oca-api.ts`
- [ ] Configurar variables `OCA_API_KEY` y `OCA_API_SECRET`
- [ ] Probar integración

#### Opción C: Integrar Directamente con Correo Argentino
- [ ] Registrarse en MiCorreo
- [ ] Obtener credenciales API
- [ ] Completar `lib/shipping/correo-argentino-api.ts`
- [ ] Configurar variables `CORREO_API_KEY` y `CORREO_API_SECRET`
- [ ] Probar integración

---

### 4️⃣ **Documentación y QA**

#### Documentación
- [ ] `docs/INTEGRACION_ENVIOPACK.md` revisado
- [ ] `RESUMEN_INTEGRACION_ENVIOS_REALES.md` actualizado
- [ ] Este checklist completado

#### QA Completo
- [ ] Probar con diferentes códigos postales
- [ ] Probar con diferentes pesos
- [ ] Probar con diferentes valores
- [ ] Verificar que fallback funciona si API falla
- [ ] Verificar logs en producción
- [ ] Verificar que no hay errores en consola

---

## 🎯 CRITERIO DE ÉXITO

**El sistema de envíos está listo para producción cuando:**

- ✅ Envíopack configurado O cálculo simulado funcionando correctamente
- ✅ Cálculo funciona para diferentes CP
- ✅ Múltiples métodos disponibles
- [ ] Selección de método funciona
- [ ] Costo se agrega al total correctamente
- [ ] Costo se guarda en compra_log
- [ ] Integración con checkout funciona
- [ ] No hay errores en consola
- [ ] Logs funcionan correctamente
- [ ] Documentación completa

---

## 📝 NOTAS IMPORTANTES

### Envíopack (Recomendado)
- **Tiempo estimado:** 30-60 minutos (registro + configuración)
- **Ventaja:** Una sola integración para múltiples transportistas
- **Estado:** Ya implementado, solo requiere credenciales

### Cálculo Simulado (Actual)
- **Estado:** Funcionando correctamente
- **Limitación:** Precios estimados, no reales
- **Ventaja:** Funciona inmediatamente sin credenciales

### Integraciones Directas
- **Estado:** Estructuras base creadas
- **Requisito:** Credenciales comerciales de cada transportista
- **Tiempo:** Variable según proceso de aprobación

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Registrarse en Envíopack** (si se elige esta opción)
2. **Obtener credenciales API**
3. **Configurar variables** en `.env.local` y Vercel
4. **Probar localmente**
5. **Probar en producción**
6. **Marcar checklist completo**

---

## ✅ CONCLUSIÓN

**Estado actual:** Sistema funcional con cálculo simulado  
**Próximo paso:** Configurar Envíopack para tarifas reales  
**Tiempo estimado:** 30-60 minutos  
**Prioridad:** Media (el sistema funciona, pero con precios estimados)

---

**¡Sistema listo para configurar! 🚀**

