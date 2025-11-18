# Documentación de Emails - CatalogoIndumentaria

## 📧 Servicio de Email

El sistema utiliza **Nodemailer** para el envío de emails, con un modo de simulación cuando no hay configuración SMTP disponible.

## ⚙️ Configuración

### Variables de Entorno Requeridas

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password
SMTP_FROM=info@catalogo.com
```

### Modo Simulación

Si las variables de entorno no están configuradas, el sistema funciona en **modo simulación**:
- Los emails se loguean en consola
- No se envían emails reales
- El flujo de la aplicación continúa normalmente

## 📨 Emails Implementados

### 1. Email de Confirmación de Compra

**Cuándo se envía:**
- Cuando un pago es aprobado por Mercado Pago
- Se envía automáticamente desde el webhook `/api/mp/webhook`

**Destinatario:**
- Email del comprador (obtenido de `payment.payer.email`)

**Contenido:**
- Asunto: `Confirmación de compra - [Nombre del Producto]`
- Producto comprado
- Cantidad
- Talle
- ID de pago

**Función:**
- `app/api/mp/webhook/route.ts` → `sendEmail()` con `type: 'compra'`

**Manejo de Errores:**
- Si falla el envío, se loguea el error pero **no se interrumpe el flujo del webhook**
- El pago se procesa correctamente aunque el email falle

### 2. Email de Registro

**Cuándo se envía:**
- Cuando un usuario se registra exitosamente
- Se envía desde `/api/auth/register`

**Destinatario:**
- Email del usuario registrado

**Contenido:**
- Mensaje de bienvenida
- Instrucciones para iniciar sesión

**Estado:** Implementado (verificar en `app/api/auth/register/route.ts`)

### 3. Email de Recuperación de Contraseña

**Cuándo se envía:**
- Cuando un usuario solicita recuperar su contraseña
- Se envía desde `/api/admin/recovery`

**Destinatario:**
- Email del usuario que solicita recuperación

**Contenido:**
- Link de reseteo de contraseña
- Token temporal
- Instrucciones

**Estado:** Implementado (verificar en `app/api/admin/recovery/route.ts`)

### 4. Email de Contacto

**Cuándo se envía:**
- Cuando un usuario completa un formulario de contacto (si existe)

**Estado:** No implementado actualmente

## 🔧 Función Principal

**Archivo:** `lib/email.ts`

```typescript
export async function sendEmail(options: EmailOptions): Promise<{ simulated: boolean }>
```

**Parámetros:**
- `to`: Email del destinatario
- `subject`: Asunto del email
- `html`: Contenido HTML (opcional)
- `text`: Contenido texto plano (opcional)
- `type`: Tipo de email (`'compra' | 'registro' | 'recovery' | 'contacto' | 'otro'`)

**Retorno:**
- `{ simulated: true }` si está en modo simulación
- `{ simulated: false }` si se envió correctamente

## 📝 Logs

Todos los emails se loguean en consola:
- **Modo simulación:** `[Email SIMULADO]` con todos los datos
- **Modo real:** Logs de éxito/error de Nodemailer

## 🚨 Manejo de Errores

El sistema está diseñado para que **los errores de email no interrumpan el flujo principal**:

1. **Webhook de Mercado Pago:**
   - El email se envía dentro de un `try/catch`
   - Si falla, se loguea pero el pago se procesa correctamente

2. **Registro/Recuperación:**
   - Los errores se manejan en cada endpoint específico
   - Se retorna error al usuario si es crítico

## 🔄 Próximas Mejoras

- [ ] Templates HTML profesionales para cada tipo de email
- [ ] Sistema de cola para emails (Bull/Redis)
- [ ] Reintentos automáticos en caso de fallo
- [ ] Integración con servicios externos (SendGrid, Mailgun, etc.)
- [ ] Dashboard de emails enviados
- [ ] Estadísticas de apertura y clicks

## 📚 Referencias

- **Nodemailer:** https://nodemailer.com/
- **Archivo de implementación:** `lib/email.ts`
- **Webhook de pago:** `app/api/mp/webhook/route.ts`
