# 🛡️ Prevención de Regresión - Mercado Pago

**Fecha:** 2024-12-19  
**Objetivo:** Asegurar que el error "Mercado Pago no configurado" nunca vuelva a aparecer

---

## 🚨 REGLAS CRÍTICAS (NUNCA VIOLAR)

### ❌ REGLA 1: NUNCA Validar al Cargar Módulo

**INCORRECTO:**
```typescript
// ❌ NUNCA hacer esto
const mpConfig = validateMercadoPagoConfig()
const MP_ACCESS_TOKEN = mpConfig.accessToken

export async function POST(request: Request) {
  // ...
}
```

**CORRECTO:**
```typescript
// ✅ SIEMPRE validar en runtime
export async function POST(request: Request) {
  const mpConfig = validateMercadoPagoConfig()
  const MP_ACCESS_TOKEN = mpConfig.accessToken
  // ...
}
```

**Razón:** Las variables de entorno pueden cambiar después del build. La validación debe ejecutarse cada vez que se llama al endpoint.

---

### ❌ REGLA 2: NUNCA Usar Nombres de Variables Diferentes

**INCORRECTO:**
```typescript
// ❌ NUNCA usar estos nombres
const token = process.env.MERCADOPAGO_ACCESS_TOKEN
const token = process.env.MP_TOKEN
const token = process.env.MERCADOPAGO_TOKEN
```

**CORRECTO:**
```typescript
// ✅ SIEMPRE usar este nombre exacto
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
```

**Razón:** Un solo nombre evita confusión y asegura consistencia.

---

### ❌ REGLA 3: NUNCA Exponer MP_ACCESS_TOKEN al Cliente

**INCORRECTO:**
```typescript
// ❌ NUNCA en next.config.js
env: {
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN // ❌ NUNCA
}
```

**CORRECTO:**
```typescript
// ✅ Solo exponer Public Key
env: {
  NEXT_PUBLIC_MP_PUBLIC_KEY: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY // ✅ OK
}
```

**Razón:** `MP_ACCESS_TOKEN` es secreto y solo debe usarse en backend.

---

## ✅ CHECKLIST PRE-DEPLOY

Antes de cada deploy, ejecutar:

```bash
# 1. Verificar configuración
pnpm verify-mp

# 2. Verificar que no hay errores de lint
pnpm lint

# 3. Verificar tipos
pnpm typecheck

# 4. Test automatizado (si servidor está corriendo)
pnpm test-mp-checkout
```

**Si alguno falla, NO hacer deploy.**

---

## 🔍 VERIFICACIÓN AUTOMÁTICA

### Script Pre-Build

El script `verify-mp-config.mjs` se ejecuta automáticamente antes de cada build:

```json
{
  "prebuild": "pnpm lint && pnpm typecheck && node scripts/verify-mp-config.mjs"
}
```

**Si falla, el build se detiene.**

---

## 📋 ENDPOINTS QUE DEBEN VALIDAR EN RUNTIME

Todos estos endpoints deben validar en runtime:

- [x] `app/api/pago/route.ts` ✅
- [x] `app/api/mp/webhook/route.ts` ✅
- [x] `app/api/suscripcion/create/route.ts` ✅
- [x] `app/api/mp/subscription/route.ts` ✅
- [x] `lib/shipping/mercado-envios.ts` ✅

**Si agregas un nuevo endpoint que use Mercado Pago, DEBE validar en runtime.**

---

## 🧪 TESTS AUTOMATIZADOS

### Test de Configuración

```bash
pnpm verify-mp
```

**Valida:**
- Variable `MP_ACCESS_TOKEN` presente
- No es placeholder
- Formato correcto
- Tipo correcto (TEST vs PRODUCCIÓN)

### Test de Checkout

```bash
pnpm test-mp-checkout
```

**Valida:**
- Configuración válida
- Creación de preferencia funciona
- Respuesta de Mercado Pago correcta

---

## 📝 TEMPLATE PARA NUEVOS ENDPOINTS

Si necesitas crear un nuevo endpoint que use Mercado Pago:

```typescript
import { NextResponse } from 'next/server'
import { validateMercadoPagoConfig } from '@/lib/mercadopago/validate'

export async function POST(request: Request) {
  try {
    // ✅ CRÍTICO: Validar en runtime, no al cargar módulo
    const mpConfig = validateMercadoPagoConfig()
    const MP_ACCESS_TOKEN = mpConfig.accessToken

    if (!mpConfig.isValid || !MP_ACCESS_TOKEN) {
      console.error('[TU-ENDPOINT] ❌ Mercado Pago no configurado')
      console.error('[TU-ENDPOINT] Errores:', mpConfig.errors)
      return NextResponse.json(
        { 
          error: 'Mercado Pago no configurado',
          details: mpConfig.errors.join(', '),
        },
        { status: 500 }
      )
    }

    // Tu lógica aquí usando MP_ACCESS_TOKEN
    // ...
  } catch (error: any) {
    console.error('[TU-ENDPOINT] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    )
  }
}
```

---

## 🔗 REFERENCIAS

- **Sistema de validación**: `lib/mercadopago/validate.ts`
- **Causa raíz**: `docs/CAUSA_RAIZ_MERCADOPAGO.md`
- **Configuración**: `docs/configuracion-mercadopago.md`
- **Script de verificación**: `scripts/verify-mp-config.mjs`
- **Test automatizado**: `scripts/test-mp-checkout.mjs`

---

**✅ Prevención de regresión implementada**

**🚨 RECORDATORIO:** Siempre validar en runtime, nunca al cargar módulo.

