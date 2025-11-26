# 📊 Estado Actual de Configuración - Envíopack, Mercado Pago y Retiro en Local

**Fecha:** 2024-11-26  
**Verificación:** Automática desde producción

---

## 🔍 RESULTADO DE LA VERIFICACIÓN

### ❌ MERCADO PAGO - NO CONFIGURADO

**Estado detectado:**

- Token presente: ❌ NO
- Public Key presente: ❌ NO
- Modo: SANDBOX/TEST (no se puede determinar sin token)

**Lo que significa:**

- El sistema **NO puede crear preferencias de pago** reales
- El checkout **NO funcionará** correctamente
- Los pagos **NO se procesarán**

**Para solucionarlo:**

1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Agrega estas variables en **Production**:
   ```
   MP_ACCESS_TOKEN=APP_USR-tu_token_de_produccion_aqui
   NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR_tu_public_key_aqui
   MP_WEBHOOK_SECRET=tu_webhook_secret_aqui (opcional pero recomendado)
   ```
3. **Haz REDEPLOY** después de agregar las variables
4. Verifica que el token empiece con `APP_USR-` (producción) y NO con `TEST-` (sandbox)

**Cómo obtener las credenciales:**

- Ve a https://www.mercadopago.com.ar/developers/panel
- Credenciales → Producción
- Copia `Access Token` y `Public Key`

---

### ⚠️ ENVÍOPACK - SIMULADO (No configurado)

**Estado detectado:**

- Credenciales presentes: ❌ NO
- Estado: ⚠️ **SIMULADO** (usando cálculo estimado)
- Métodos disponibles: 5 (OCA, Andreani, Correo Argentino - simulados)

**Lo que significa:**

- El sistema **SÍ calcula costos de envío**, pero son **estimados** (no reales)
- Los costos pueden **no coincidir** con los costos reales de los transportistas
- Los envíos se crean con **tracking simulado** (no se puede rastrear realmente)
- **NO se generan etiquetas PDF** reales

**Para solucionarlo:**

1. Crea cuenta en https://enviopack.com
2. Obtén credenciales del dashboard:
   - `ENVIOPACK_API_KEY`
   - `ENVIOPACK_API_SECRET`
   - `ENVIOPACK_WEBHOOK_SECRET` (opcional)
3. Ve a Vercel Dashboard → Settings → Environment Variables
4. Agrega estas variables en **Production**:
   ```
   ENVIOPACK_API_KEY=tu_api_key_aqui
   ENVIOPACK_API_SECRET=tu_api_secret_aqui
   ENVIOPACK_WEBHOOK_SECRET=tu_webhook_secret_aqui (opcional)
   ```
5. **Haz REDEPLOY** después de agregar las variables
6. Configura webhook en Envíopack Dashboard:
   - URL: `https://catalogo-indumentaria.vercel.app/api/shipping/webhook`
   - Eventos: `envio.actualizado`, `envio.entregado`, `envio.en_transito`

**Después de configurar:**

- Los costos serán **reales** (obtenidos de Envíopack)
- Los envíos tendrán **tracking real**
- Se podrán generar **etiquetas PDF** reales
- Los estados se actualizarán **automáticamente** vía webhook

---

### ⚠️ RETIRO EN LOCAL - Funcional pero incompleto

**Estado detectado:**

- Funcionalidad: ✅ **FUNCIONAL**
- Variables de entorno: ❌ **NO CONFIGURADAS**
- Información al cliente: ⚠️ **INCOMPLETA**

**Lo que funciona:**

- ✅ Opción "Retiro en local" visible en checkout
- ✅ No requiere dirección completa si es retiro
- ✅ Costo = $0
- ✅ Se guarda correctamente en BD
- ✅ No crea solicitud de envío

**Lo que falta:**

- ❌ No muestra dirección del local al cliente
- ❌ No muestra horarios de retiro
- ❌ No muestra teléfono de contacto
- ❌ No envía email con información de retiro

**Para completarlo:**

1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Agrega estas variables en **Production**:
   ```
   LOCAL_RETIRO_DIRECCION="Av. Corrientes 1234, CABA"
   LOCAL_RETIRO_HORARIOS="Lunes a Viernes: 9:00 - 18:00"
   LOCAL_RETIRO_TELEFONO="+54 11 1234-5678"
   ```
3. **Haz REDEPLOY** después de agregar las variables
4. La información se mostrará automáticamente en:
   - Checkout (cuando selecciona retiro)
   - Página de éxito (después del pago)
   - Email de confirmación

---

## 📋 CHECKLIST DE CONFIGURACIÓN

### 🔴 CRÍTICO (Bloquea producción)

- [ ] **Mercado Pago configurado**
  - [ ] `MP_ACCESS_TOKEN` agregado en Vercel (Production)
  - [ ] `NEXT_PUBLIC_MP_PUBLIC_KEY` agregado en Vercel (Production)
  - [ ] Token es de producción (`APP_USR-`) y NO de sandbox (`TEST-`)
  - [ ] REDEPLOY realizado después de agregar variables
  - [ ] Webhook configurado en Mercado Pago Dashboard
  - [ ] Prueba de pago exitosa

### 🟡 IMPORTANTE (Mejora experiencia)

- [ ] **Envíopack configurado**
  - [ ] Cuenta creada en Envíopack
  - [ ] `ENVIOPACK_API_KEY` agregado en Vercel (Production)
  - [ ] `ENVIOPACK_API_SECRET` agregado en Vercel (Production)
  - [ ] REDEPLOY realizado después de agregar variables
  - [ ] Webhook configurado en Envíopack Dashboard
  - [ ] Prueba de cálculo real exitosa
  - [ ] Prueba de creación de envío real exitosa

- [ ] **Retiro en local completo**
  - [ ] `LOCAL_RETIRO_DIRECCION` agregado en Vercel (Production)
  - [ ] `LOCAL_RETIRO_HORARIOS` agregado en Vercel (Production)
  - [ ] `LOCAL_RETIRO_TELEFONO` agregado en Vercel (Production)
  - [ ] REDEPLOY realizado después de agregar variables
  - [ ] Información visible en checkout
  - [ ] Información visible en página de éxito
  - [ ] Email con información funcionando

---

## 🚨 ESTADO ACTUAL DEL SISTEMA

| Componente            | Estado            | Funcionalidad                                |
| --------------------- | ----------------- | -------------------------------------------- |
| **Mercado Pago**      | ❌ NO CONFIGURADO | **NO FUNCIONA** - No puede procesar pagos    |
| **Envíopack**         | ⚠️ SIMULADO       | **PARCIAL** - Calcula pero no es real        |
| **Retiro en Local**   | ⚠️ INCOMPLETO     | **FUNCIONAL** - Falta información al cliente |
| **Checkout**          | ⚠️ BLOQUEADO      | **NO FUNCIONA** - Sin MP no puede procesar   |
| **Cálculo de Envío**  | ✅ FUNCIONAL      | **FUNCIONAL** - Pero simulado                |
| **Creación de Orden** | ✅ FUNCIONAL      | **FUNCIONAL** - Guarda en BD correctamente   |

---

## ⚠️ RIESGOS ACTUALES

### 🔴 CRÍTICO

1. **Sin Mercado Pago configurado**
   - **Riesgo:** El sistema NO puede procesar pagos
   - **Impacto:** Los clientes NO pueden comprar
   - **Acción:** Configurar inmediatamente

### 🟡 ALTO

2. **Envíopack simulado**
   - **Riesgo:** Costos pueden no coincidir con costos reales
   - **Impacto:** Pérdidas económicas o sobreprecio
   - **Acción:** Configurar esta semana

3. **Retiro en local incompleto**
   - **Riesgo:** Clientes no saben dónde retirar
   - **Impacto:** Mala experiencia de usuario
   - **Acción:** Completar esta semana

---

## ✅ PASOS INMEDIATOS

### 1. HOY (Crítico)

1. Configurar Mercado Pago en Vercel
2. Hacer REDEPLOY
3. Probar creación de preferencia
4. Configurar webhook de MP

### 2. ESTA SEMANA (Importante)

1. Configurar Envíopack
2. Probar cálculo real
3. Probar creación de envío real
4. Completar retiro en local

### 3. PRÓXIMA SEMANA (Mejoras)

1. Probar flujo completo end-to-end
2. Validar tracking real
3. Validar notificaciones
4. QA completo

---

## 📝 NOTAS IMPORTANTES

1. **REDEPLOY es obligatorio**: Después de agregar variables en Vercel, DEBES hacer redeploy para que surtan efecto
2. **Entorno correcto**: Asegúrate de agregar las variables en **Production**, no en Preview
3. **Formato de tokens**:
   - Mercado Pago producción: `APP_USR-...`
   - Mercado Pago sandbox: `TEST-...`
   - Envíopack: Formato específico de su API
4. **Webhooks**: Ambos (MP y Envíopack) requieren configuración en sus respectivos dashboards

---

## 🔗 ENLACES ÚTILES

- **Mercado Pago Dashboard**: https://www.mercadopago.com.ar/developers/panel
- **Envíopack Dashboard**: https://enviopack.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentación Envíopack**: https://developers.enviopack.com

---

**Última verificación:** 2024-11-26  
**Estado general:** ⚠️ **REQUIERE CONFIGURACIÓN INMEDIATA**
