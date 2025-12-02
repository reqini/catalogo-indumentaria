# 🚀 GUÍA COMPLETA: Configuración Paso a Paso

## 📋 ÍNDICE

1. [Configurar MP_ACCESS_TOKEN](#1-configurar-mp_access_token) ⚠️ CRÍTICO
2. [Verificar Otras Variables de Entorno](#2-verificar-otras-variables-de-entorno)
3. [Hacer REDEPLOY](#3-hacer-redeploy)
4. [Verificar que Funciona](#4-verificar-que-funciona)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. CONFIGURAR MP_ACCESS_TOKEN ⚠️ CRÍTICO

### Paso 1.1: Obtener Access Token de Mercado Pago

1. **Abrir navegador** y ve a: https://www.mercadopago.com.ar/developers/panel
2. **Iniciar sesión** con tu cuenta de Mercado Pago
3. En el menú lateral, click en **"Tus integraciones"**
4. **Seleccionar tu aplicación** (o crear una nueva si no tienes):
   - Si no tienes, click en **"Crear nueva aplicación"**
   - Completa el formulario y guarda
5. Dentro de tu aplicación, ve a la sección **"Credenciales"**
6. **Copiar el Access Token**:
   - **Producción**: Empieza con `APP_USR-...` (usar este en producción)
   - **Sandbox/Test**: Empieza con `TEST-...` (solo para pruebas)
7. **Guardar el token** en un lugar seguro (lo necesitarás en el siguiente paso)

**📸 Captura de pantalla esperada:**

```
Credenciales de producción
Access Token: APP_USR-1234567890123456-123456-abcdef123456...
[Botón: Copiar]
```

---

### Paso 1.2: Configurar en Vercel Dashboard

1. **Abrir nueva pestaña** y ve a: https://vercel.com/dashboard
2. **Iniciar sesión** con tu cuenta de Vercel
3. **Buscar y seleccionar** tu proyecto: `catalogo-indumentaria`
4. En el menú superior, click en **"Settings"**
5. En el menú lateral izquierdo, click en **"Environment Variables"**
6. Click en el botón **"Add New"** (o **"Agregar nueva"**)
7. **Completar el formulario**:
   ```
   Key: MP_ACCESS_TOKEN
   Value: [Pegar aquí el token que copiaste, ej: APP_USR-1234567890...]
   ```
8. **Seleccionar ambientes** (MUY IMPORTANTE):
   - ✅ **Production** (marcar esta)
   - ✅ **Preview** (marcar esta)
   - ✅ **Development** (marcar esta)
9. Click en **"Save"** (o **"Guardar"**)

**⚠️ IMPORTANTE:**

- El nombre debe ser EXACTAMENTE: `MP_ACCESS_TOKEN` (mayúsculas)
- NO debe tener espacios antes o después
- Debe estar seleccionado para **Production** (obligatorio)

**📸 Captura de pantalla esperada:**

```
Environment Variables
┌─────────────────────────────────────────┐
│ Key: MP_ACCESS_TOKEN                    │
│ Value: APP_USR-1234567890...           │
│                                         │
│ ☑ Production                           │
│ ☑ Preview                              │
│ ☑ Development                          │
│                                         │
│ [Cancel] [Save]                        │
└─────────────────────────────────────────┘
```

---

## 2. VERIFICAR OTRAS VARIABLES DE ENTORNO

### Variables Requeridas (Deben estar configuradas):

Ve a **Vercel Dashboard → Settings → Environment Variables** y verifica que existan:

#### ✅ MONGODB_URI (Requerida)

- **Qué es:** URI de conexión a MongoDB
- **Dónde obtenerla:** MongoDB Atlas → Connect → Connection String
- **Formato:** `mongodb+srv://usuario:password@cluster.mongodb.net/database`
- **Ambientes:** Production, Preview, Development

#### ✅ JWT_SECRET (Requerida)

- **Qué es:** Clave secreta para firmar tokens JWT
- **Cómo generar:** Cualquier string aleatorio seguro (mínimo 32 caracteres)
- **Ejemplo:** `mi-clave-super-secreta-123456789`
- **Ambientes:** Production, Preview, Development

#### ⚠️ MP_ACCESS_TOKEN (Opcional pero necesario para pagos)

- **Ya lo configuraste en el Paso 1** ✅

#### 📦 Variables Opcionales (No críticas):

- `CLOUDINARY_CLOUD_NAME` - Para subida de imágenes
- `CLOUDINARY_API_KEY` - Para subida de imágenes
- `CLOUDINARY_API_SECRET` - Para subida de imágenes
- `NEXT_PUBLIC_BASE_URL` - URL base de la aplicación
- `NEXT_PUBLIC_SUPABASE_URL` - Si usas Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Si usas Supabase

**🔍 Cómo verificar:**

1. Vercel Dashboard → Settings → Environment Variables
2. Revisar la lista de variables
3. Verificar que `MONGODB_URI` y `JWT_SECRET` estén presentes
4. Si faltan, agregarlas siguiendo el mismo proceso del Paso 1.2

---

## 3. HACER REDEPLOY ⚠️ CRÍTICO

**⚠️ MUY IMPORTANTE:** Después de agregar/modificar variables de entorno, **DEBES hacer REDEPLOY** para que estén disponibles.

### Opción A: Redeploy Manual (Recomendado)

1. En **Vercel Dashboard**, ve a la pestaña **"Deployments"**
2. Busca el **último deployment** (el más reciente)
3. Click en los **3 puntos** (⋯) del deployment
4. Click en **"Redeploy"**
5. Confirma haciendo click en **"Redeploy"** nuevamente
6. **Espera** a que termine el deploy (2-5 minutos)
   - Verás el progreso en tiempo real
   - Cuando termine, verás "Ready" en verde

**📸 Captura de pantalla esperada:**

```
Deployments
┌─────────────────────────────────────────┐
│ main (abc123)  Ready  [⋯]              │
│                                         │
│ [⋯] → Redeploy                         │
│                                         │
│ Building... ████████░░ 80%            │
└─────────────────────────────────────────┘
```

### Opción B: Redeploy Automático (Alternativa)

Si prefieres hacer un commit vacío para trigger el deploy:

```bash
# En tu terminal local
cd "/Users/benicio/Desktop/asi son"
git commit --allow-empty -m "trigger: redeploy para aplicar variables de entorno"
git push origin main
```

Luego espera a que Vercel detecte el push y haga deploy automático.

---

## 4. VERIFICAR QUE FUNCIONA ✅

### Paso 4.1: Verificar en Logs de Vercel

1. En **Vercel Dashboard**, ve a **"Deployments"**
2. Click en el **último deployment** (el que acabas de hacer redeploy)
3. Click en **"Logs"** o **"View Logs"**
4. Buscar en los logs (Ctrl+F o Cmd+F) la palabra: `MP-PAYMENT`
5. **Verificar que aparezca:**

**✅ Logs CORRECTOS (configuración OK):**

```
[MP-PAYMENT] MP_ACCESS_TOKEN (directo): ✅ PRESENTE
[MP-PAYMENT]   - Longitud: 150
[MP-PAYMENT]   - Empieza con: APP_USR-...
[MP-PAYMENT]   - Formato válido: ✅
[MP-PAYMENT] ✅ Token configurado correctamente
```

**❌ Logs INCORRECTOS (falta configuración):**

```
[MP-PAYMENT] MP_ACCESS_TOKEN (directo): ❌ NO ENCONTRADO
[MP-PAYMENT] ❌ NO se encontraron variables relacionadas con MP
[MP-PAYMENT] ❌ [ERROR] MP_ACCESS_TOKEN NO CONFIGURADO
```

Si ves los logs incorrectos, vuelve al **Paso 1.2** y verifica que:

- La variable esté guardada correctamente
- Esté seleccionada para **Production**
- Hayas hecho **REDEPLOY** después de agregarla

---

### Paso 4.2: Probar Checkout Completo

1. **Abrir** tu sitio en producción: https://catalogo-indumentaria.vercel.app
2. **Agregar productos** al carrito
3. Click en **"Ir al carrito"** o **"Checkout"**
4. **Completar el formulario**:
   - Nombre y apellido
   - Email
   - Teléfono
   - Dirección de envío
5. **Seleccionar método de envío**
6. Click en **"Pagar Ahora"**
7. **Verificar que:**
   - ✅ NO aparece error 500
   - ✅ NO aparece mensaje `CHECKOUT_MP_CONFIG_ERROR`
   - ✅ Se redirige a Mercado Pago (página de pago)
   - ✅ La página de Mercado Pago carga correctamente

**✅ Resultado esperado:**

- Redirección exitosa a Mercado Pago
- Página de pago de Mercado Pago visible
- Productos y montos correctos en la página de pago

**❌ Si aparece error:**

- Ver mensaje de error específico
- Revisar logs en Vercel (Paso 4.1)
- Verificar que se hizo REDEPLOY
- Verificar que el token sea válido

---

## 5. TROUBLESHOOTING 🔧

### Problema: "MP_ACCESS_TOKEN no está configurado"

**Solución:**

1. Verificar que la variable existe en Vercel Dashboard → Settings → Environment Variables
2. Verificar que el nombre sea EXACTAMENTE: `MP_ACCESS_TOKEN` (sin espacios)
3. Verificar que esté seleccionada para **Production**
4. **Hacer REDEPLOY** (Paso 3)
5. Verificar logs después del redeploy (Paso 4.1)

---

### Problema: "Error 500 al hacer checkout"

**Solución:**

1. Revisar logs en Vercel Dashboard → Deployments → Último deploy → Logs
2. Buscar errores que contengan `MP-PAYMENT` o `CHECKOUT`
3. Verificar que el token sea válido en Mercado Pago Panel
4. Verificar que el token no haya expirado
5. Si el token expiró, generar uno nuevo y actualizar en Vercel

---

### Problema: "Token inválido" o "401 Unauthorized"

**Solución:**

1. Verificar que el token sea correcto (copiar y pegar de nuevo)
2. Verificar que no tenga espacios antes o después
3. Verificar que sea el token de **Producción** (empieza con `APP_USR-`)
4. Generar nuevo token en Mercado Pago Panel si es necesario
5. Actualizar en Vercel y hacer REDEPLOY

---

### Problema: "Variable no disponible después del redeploy"

**Solución:**

1. Verificar que la variable esté guardada correctamente en Vercel
2. Verificar que esté seleccionada para **Production**
3. Esperar 2-3 minutos después del redeploy (a veces tarda)
4. Hacer otro redeploy manual
5. Si persiste, contactar soporte de Vercel

---

### Problema: "No puedo acceder a Mercado Pago Panel"

**Solución:**

1. Verificar que tengas cuenta de Mercado Pago activa
2. Verificar que tengas permisos de desarrollador
3. Si no tienes cuenta, crear una en: https://www.mercadopago.com.ar
4. Activar cuenta de desarrollador en: https://www.mercadopago.com.ar/developers

---

## 📋 CHECKLIST FINAL

Antes de considerar que todo está configurado:

- [ ] Access Token obtenido de Mercado Pago Panel
- [ ] `MP_ACCESS_TOKEN` agregado en Vercel Dashboard
- [ ] Variable seleccionada para Production, Preview, Development
- [ ] `MONGODB_URI` configurada y verificada
- [ ] `JWT_SECRET` configurada y verificada
- [ ] **REDEPLOY realizado** después de agregar variables
- [ ] Logs verificados: token presente y válido
- [ ] Checkout probado: redirección a Mercado Pago funciona
- [ ] Página de pago de Mercado Pago carga correctamente

---

## 🎯 RESULTADO FINAL ESPERADO

Cuando todo esté configurado correctamente:

✅ **Checkout funciona sin errores**

- No aparece error 500
- No aparece `CHECKOUT_MP_CONFIG_ERROR`
- Redirección a Mercado Pago exitosa

✅ **Logs muestran configuración correcta**

- `[MP-PAYMENT] ✅ Token configurado correctamente`
- `[MP-PAYMENT] ✅ [SUCCESS] Preferencia creada exitosamente`

✅ **Pago funciona end-to-end**

- Usuario puede completar checkout
- Redirección a Mercado Pago funciona
- Pago se procesa correctamente

---

## 📞 SOPORTE ADICIONAL

Si después de seguir todos los pasos aún no funciona:

1. **Revisar logs completos** en Vercel Dashboard
2. **Verificar token válido** en Mercado Pago Panel
3. **Verificar que se hizo REDEPLOY** después de agregar variable
4. **Contactar soporte de Vercel** si la variable no está disponible
5. **Contactar soporte de Mercado Pago** si el token no funciona

---

**Última actualización:** 2024-11-26  
**Estado:** ✅ Listo para configurar
