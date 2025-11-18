# Guía Rápida - Configurar Mercado Pago

## 🚀 Pasos Rápidos (5 minutos)

### Opción 1: Token de Prueba (Recomendado para desarrollo)

1. **Ir a Mercado Pago Developers**
   - URL: https://www.mercadopago.com.ar/developers
   - Iniciar sesión o crear cuenta

2. **Crear Aplicación**
   - Click en "Tus integraciones"
   - Click en "Crear aplicación"
   - Completar:
     - Nombre: "Catalogo Indumentaria" (o el que prefieras)
     - Categoría: E-commerce
   - Click en "Crear"

3. **Obtener Access Token**
   - En la aplicación creada, ir a "Credenciales de prueba"
   - Copiar el **Access Token** (formato: `TEST-xxxxxxxxxxxxxxxxxxxx`)

4. **Configurar en el proyecto**
   ```bash
   # Editar .env.local
   MP_ACCESS_TOKEN=TEST-tu-token-real-aqui
   ```

5. **Reiniciar servidor**
   ```bash
   pnpm dev
   ```

### Opción 2: Token de Producción

1. Seguir los mismos pasos pero usar "Credenciales de producción"
2. El token será diferente (sin prefijo TEST-)

---

## ✅ Verificar que Funciona

Después de configurar, probar:

1. Ir a http://localhost:3001/catalogo
2. Agregar un producto al carrito
3. Ir a http://localhost:3001/carrito
4. Click en "Finalizar Compra"
5. Debería redirigir a Mercado Pago (no mostrar error)

---

## 🧪 Tarjetas de Prueba

Para probar pagos con token de prueba:

### Tarjeta Aprobada
- **Número:** 5031 7557 3453 0604
- **CVV:** 123
- **Vencimiento:** 11/25
- **Nombre:** APRO

### Tarjeta Rechazada
- **Número:** 5031 4332 1540 6351
- **CVV:** 123
- **Vencimiento:** 11/25
- **Nombre:** OTHE

---

## ⚠️ Importante

- **Token de Prueba:** No cobra dinero real, perfecto para desarrollo
- **Token de Producción:** Cobra dinero real, solo usar en producción
- **Seguridad:** Nunca compartir el token públicamente
- **Reiniciar:** Siempre reiniciar el servidor después de cambiar `.env.local`

---

## 🔧 Solución de Problemas

### Error: "Mercado Pago no configurado"
- Verificar que `MP_ACCESS_TOKEN` esté en `.env.local`
- Verificar que no sea el placeholder `TEST-xxxxxxxxxxxxxxxxxxxx`
- Reiniciar el servidor después de cambiar `.env.local`

### Error: "Invalid access token"
- Verificar que el token sea correcto (copiar completo)
- Verificar que no tenga espacios extra
- Si es token de prueba, asegurarse de usar credenciales de prueba

---

## 📝 Ejemplo de .env.local

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/catalogo_indumentaria

# JWT
JWT_SECRET=tu-secret-key-aqui

# Mercado Pago
MP_ACCESS_TOKEN=TEST-1234567890-abcdefghijklmnopqrstuvwxyz-1234567890-abcdefghijklmnopqrstuvwxyz-1234567890
MP_WEBHOOK_SECRET=opcional

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

---

**¿Necesitás ayuda?** Ver documentación completa en `/docs/configuracion-mercadopago.md`

