# Configurar Credenciales de Mercado Pago en Producción

## 🔐 Credenciales Completas de Mercado Pago

### Credenciales de Producción

```
Access Token: APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974
Public Key:   APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6
Client ID:    8653596253805253
Client Secret: CgXv3EjqJGcZnXfwofqFfZzNlVhxZBXj
```

**Uso:**

- **Access Token:** Se usa para crear preferencias de pago (server-side)
- **Public Key:** Se usa en el frontend para inicializar el SDK de Mercado Pago (opcional)
- **Client ID / Secret:** Se usan para generar nuevos tokens si es necesario

## 📋 Pasos para Configurar en Vercel

### 1. Acceder a Vercel Dashboard

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `catalogo-indumentaria`
3. Ve a **Settings** → **Environment Variables**

### 2. Configurar Variables de Entorno

#### Variable 1: `MP_ACCESS_TOKEN` (OBLIGATORIO)

- **Key:** `MP_ACCESS_TOKEN`
- **Value:** `APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974`
- **Environment:**
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**Descripción:** Token de acceso para crear preferencias de pago en el servidor.

#### Variable 2: `NEXT_PUBLIC_MP_PUBLIC_KEY` (Opcional pero Recomendado)

- **Key:** `NEXT_PUBLIC_MP_PUBLIC_KEY`
- **Value:** `APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6`
- **Environment:**
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**Descripción:** Public Key para usar el SDK de Mercado Pago en el frontend (opcional).

#### Variables Adicionales (Opcionales - Solo si necesitas generar tokens)

Si necesitas generar nuevos tokens en el futuro, puedes configurar:

- **Key:** `MP_CLIENT_ID`
- **Value:** `8653596253805253`

- **Key:** `MP_CLIENT_SECRET`
- **Value:** `CgXv3EjqJGcZnXfwofqFfZzNlVhxZBXj`

**Nota:** Estas variables NO son necesarias para el funcionamiento básico del checkout.

### 3. Verificar Configuración

Después de agregar las variables:

1. Haz un **Redeploy** del proyecto
2. Ve a **Deployments** → Selecciona el último deploy → **View Function Logs**
3. Busca logs con prefijo `[MP-PAYMENT]` o `[MP-VALIDATE]`
4. Deberías ver: `✅ Token configurado correctamente`

## 🧪 Verificar Localmente

Puedes verificar las credenciales localmente antes de hacer deploy:

```bash
# Crear archivo .env.local (NO commitear este archivo)
echo "MP_ACCESS_TOKEN=APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974" > .env.local
echo "NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6" >> .env.local

# Ejecutar script de verificación
pnpm verify-mp
```

## ✅ Checklist de Configuración

- [ ] Credenciales agregadas en Vercel Dashboard
- [ ] Variables configuradas para Production, Preview y Development
- [ ] Redeploy realizado
- [ ] Logs verificados (sin errores de MP_ACCESS_TOKEN)
- [ ] Checkout probado en producción

## 🔍 Verificar en Producción

Después del deploy, verifica:

1. **Logs de Build:** Debe completar sin errores de MP
2. **Logs de Runtime:** Buscar `[MP-PAYMENT] ✅ Token configurado correctamente`
3. **Checkout Funcional:** Probar crear una preferencia de pago

## 🚨 Troubleshooting

### Error: "MP_ACCESS_TOKEN no está configurado"

**Solución:**

1. Verificar que la variable está en Vercel Dashboard
2. Verificar que está configurada para el entorno correcto (Production)
3. Hacer redeploy después de agregar la variable

### Error: "MP_ACCESS_TOKEN tiene formato inválido"

**Solución:**

1. Verificar que no hay espacios extra en el valor
2. Verificar que el token completo está copiado
3. Verificar que empieza con `APP_USR-`

### Error: "Error al crear preferencia de pago"

**Solución:**

1. Verificar que el token es válido y no está expirado
2. Verificar que tienes permisos en Mercado Pago
3. Revisar logs detallados en Vercel Function Logs

## 📚 Referencias

- [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel)
- [Documentación Completa MP + Envío](./MERCADOPAGO_ENVIO_COMPLETO.md)

---

**IMPORTANTE:**

- ❌ NO commitear estas credenciales en el repositorio
- ✅ Solo configurarlas en Vercel Dashboard
- ✅ Usar `.env.local` solo para desarrollo local (y agregarlo a `.gitignore`)
