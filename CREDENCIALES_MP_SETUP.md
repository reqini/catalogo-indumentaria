# 🚀 Configuración Rápida: Credenciales Mercado Pago Producción

## 🔐 Credenciales Completas de Mercado Pago

### Credenciales de Producción

```
Access Token: APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974
Public Key:   APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6
Client ID:    8653596253805253
Client Secret: CgXv3EjqJGcZnXfwofqFfZzNlVhxZBXj
```

**Nota:**

- `MP_ACCESS_TOKEN` es lo que necesitas configurar en Vercel (Access Token)
- `NEXT_PUBLIC_MP_PUBLIC_KEY` es opcional pero recomendado (Public Key)
- Client ID y Client Secret se usan para generar nuevos tokens si es necesario

## ⚡ Configuración Rápida en Vercel

### Paso 1: Ir a Vercel Dashboard

1. Abre: https://vercel.com/dashboard
2. Selecciona proyecto: `catalogo-indumentaria`
3. Ve a: **Settings** → **Environment Variables**

### Paso 2: Agregar Variables

#### Variable 1: MP_ACCESS_TOKEN

- **Name:** `MP_ACCESS_TOKEN`
- **Value:** `APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974`
- **Environments:** ✅ Production ✅ Preview ✅ Development

#### Variable 2: NEXT_PUBLIC_MP_PUBLIC_KEY (Opcional)

- **Name:** `NEXT_PUBLIC_MP_PUBLIC_KEY`
- **Value:** `APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### Paso 3: Redeploy

1. Ve a **Deployments**
2. Click en **...** del último deploy
3. Selecciona **Redeploy**

## ✅ Verificar Configuración

### Opción 1: Verificar en Vercel Logs

1. Ve a **Deployments** → Último deploy → **View Function Logs**
2. Busca: `[MP-PAYMENT] ✅ Token configurado correctamente`

### Opción 2: Verificar Localmente

```bash
# Crear .env.local (NO commitear)
echo "MP_ACCESS_TOKEN=APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974" > .env.local
echo "NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6" >> .env.local

# Verificar
pnpm verify-mp-prod
```

## 🧪 Probar Checkout

1. Agregar productos al carrito
2. Calcular envío (opcional)
3. Click en "Finalizar Compra"
4. Deberías ser redirigido a Mercado Pago checkout

## 📚 Documentación Completa

- [Guía Completa](./docs/CONFIGURAR_CREDENCIALES_MP_PRODUCCION.md)
- [Sistema MP + Envío](./docs/MERCADOPAGO_ENVIO_COMPLETO.md)

---

**⚠️ IMPORTANTE:**

- NO commitear estas credenciales
- Solo configurarlas en Vercel Dashboard
- `.env.local` solo para desarrollo local
