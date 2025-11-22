# 🔧 Solución Definitiva: MP_ACCESS_TOKEN no configurado

## 🎯 Problema

Error 500 en `/api/pago`:

```
Mercado Pago no configurado: MP_ACCESS_TOKEN no está configurado
```

## ✅ Solución Implementada

### 1. Manejo de Errores Mejorado

- **Status Code:** Cambiado de `500` a `503` (Service Unavailable)
- **Mensaje Amigable:** No rompe el sitio, muestra mensaje claro al usuario
- **Logs Detallados:** Diagnóstico completo en logs de Vercel

### 2. Logs de Diagnóstico Mejorados

El código ahora muestra logs detallados que incluyen:

- ✅ Todas las variables relacionadas con MP encontradas
- ✅ Verificación directa de `process.env.MP_ACCESS_TOKEN`
- ✅ Información del entorno (Vercel, Production, etc.)
- ✅ Diagnóstico completo cuando falta el token

### 3. Endpoints de Verificación

Dos endpoints nuevos para debugging:

**`/api/mp/verify-config`** - Verificación completa de configuración
**`/api/mp/test-token`** - Verificación rápida del token

## 🔍 Cómo Diagnosticar el Problema

### Paso 1: Verificar Variables en Vercel

1. Ve a: https://vercel.com/dashboard
2. Proyecto: `catalogo-indumentaria`
3. Settings → Environment Variables
4. Verifica que `MP_ACCESS_TOKEN` existe y está marcada para **Production**

### Paso 2: Verificar en Logs de Vercel

1. Ve a **Deployments** → Último deployment → **View Function Logs**
2. Busca logs que empiecen con `[MP-PAYMENT] 🔍 DIAGNÓSTICO`
3. Deberías ver:
   ```
   [MP-PAYMENT] MP_ACCESS_TOKEN (directo): ✅ PRESENTE
   [MP-PAYMENT] Variables relacionadas con MP encontradas: 2
   ```

### Paso 3: Usar Endpoint de Verificación

Visita en producción:

```
https://tu-dominio.vercel.app/api/mp/test-token
```

Deberías ver:

```json
{
  "success": true,
  "token": {
    "found": true,
    "isValidFormat": true
  }
}
```

## 🚨 Si Aún No Funciona

### Verificar que Hiciste REDEPLOY

**CRÍTICO:** Las variables solo están disponibles en NUEVOS deployments.

1. Compara la fecha del último deployment con cuando agregaste las variables
2. Si el deployment es ANTERIOR, haz redeploy:
   - Deployments → ... → Redeploy

### Verificar Nombre Exacto

El nombre debe ser EXACTAMENTE: `MP_ACCESS_TOKEN`

- ✅ Correcto: `MP_ACCESS_TOKEN`
- ❌ Incorrecto: `MERCADOPAGO_ACCESS_TOKEN`
- ❌ Incorrecto: `MP-ACCESS-TOKEN`
- ❌ Incorrecto: `mp_access_token`

### Verificar Entorno Correcto

Asegúrate de que la variable esté marcada para **Production**:

- ✅ Production
- ✅ Preview (opcional)
- ✅ Development (opcional)

### Verificar Valor Completo

El valor debe ser completo, sin espacios:

```
APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974
```

## 📋 Checklist de Verificación

- [ ] Variable `MP_ACCESS_TOKEN` existe en Vercel Dashboard
- [ ] Nombre exacto: `MP_ACCESS_TOKEN` (sin espacios, case-sensitive)
- [ ] Valor completo sin espacios extra
- [ ] Marcada para **Production** (y Preview/Development si aplica)
- [ ] **REDEPLOY realizado** después de agregar variable
- [ ] Logs muestran `MP_ACCESS_TOKEN (directo): ✅ PRESENTE`
- [ ] Endpoint `/api/mp/test-token` muestra `success: true`
- [ ] Checkout funciona sin errores

## 🧪 Test Completo

### 1. Verificar Token

```bash
curl https://tu-dominio.vercel.app/api/mp/test-token
```

### 2. Verificar Configuración Completa

```bash
curl https://tu-dominio.vercel.app/api/mp/verify-config
```

### 3. Probar Checkout

1. Agregar productos al carrito
2. Calcular envío (opcional)
3. Click en "Finalizar Compra"
4. Deberías ser redirigido a Mercado Pago

## 🔧 Código Mejorado

### Manejo de Errores

```typescript
// Ahora retorna 503 en vez de 500
return NextResponse.json(
  {
    error: 'checkout-disabled',
    message: 'El servicio de pago está temporalmente deshabilitado...',
  },
  { status: 503 }
)
```

### Logs Detallados

```typescript
console.log('[MP-PAYMENT] 🔍 DIAGNÓSTICO COMPLETO')
console.log('[MP-PAYMENT] MP_ACCESS_TOKEN (directo):', token ? '✅ PRESENTE' : '❌ NO ENCONTRADO')
console.log('[MP-PAYMENT] Variables relacionadas:', allMPVars)
```

## 📚 Referencias

- [Guía de Configuración en Vercel](./GUIA_VERCEL_ENV_VARS.md)
- [Solución Completa](./SOLUCION_MP_ACCESS_TOKEN_NO_CONFIGURADO.md)
- [Verificación de Variables](./VERIFICAR_VARIABLES_VERCEL.md)

---

**Última actualización:** Noviembre 2024
**Estado:** ✅ Solución Implementada y Documentada
