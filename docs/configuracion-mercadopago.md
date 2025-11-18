# Configuración de Mercado Pago

## 🔑 Obtener Credenciales de Mercado Pago

### 1. Crear Cuenta en Mercado Pago

1. Ir a https://www.mercadopago.com.ar/
2. Crear cuenta o iniciar sesión
3. Ir a "Desarrolladores" → "Tus integraciones"

### 2. Crear Aplicación

1. Click en "Crear aplicación"
2. Completar datos básicos
3. Obtener **Access Token** (Test o Producción)

### 3. Configurar Variables de Entorno

Editar `.env.local` en la raíz del proyecto:

```env
# Mercado Pago
MP_ACCESS_TOKEN=TEST-tu-token-de-prueba-aqui
MP_WEBHOOK_SECRET=tu-secret-opcional

# Base URL (ajustar según entorno)
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### 4. Tokens de Prueba

Para desarrollo, usar tokens de **TEST**:
- Formato: `TEST-xxxxxxxxxxxxxxxxxxxx`
- Se pueden obtener en el panel de desarrolladores de MP
- Permiten hacer pagos de prueba sin cobrar dinero real

### 5. Configurar Webhook (Opcional)

1. En el panel de MP, ir a "Webhooks"
2. Agregar URL: `https://tu-dominio.com/api/mp/webhook`
3. Copiar el secret y agregarlo a `MP_WEBHOOK_SECRET`

### 6. Verificar Configuración

Después de configurar, reiniciar el servidor:

```bash
pnpm dev
```

Verificar en consola que no aparezca "Mercado Pago no configurado".

## 🧪 Probar el Flujo

1. Agregar producto al carrito
2. Ir a `/carrito`
3. Click en "Finalizar Compra"
4. Usar tarjeta de prueba de MP:
   - **Número:** 5031 7557 3453 0604
   - **CVV:** 123
   - **Vencimiento:** 11/25
   - **Nombre:** APRO
5. Verificar que se procese correctamente

## ⚠️ Nota Importante

El token actual en `.env.local` es un placeholder:
```
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxx
```

**Debe ser reemplazado por un token real de Mercado Pago** para que funcione.

