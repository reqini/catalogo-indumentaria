# 🔧 Solución: "MP_ACCESS_TOKEN no está configurado"

## 🔍 Diagnóstico del Problema

El error **"Mercado Pago no configurado: MP_ACCESS_TOKEN no está configurado"** significa que la variable de entorno `MP_ACCESS_TOKEN` no está disponible en el entorno donde se está ejecutando la aplicación.

## ✅ Solución Paso a Paso

### Paso 1: Verificar Dónde Estás Ejecutando

#### Si estás en LOCAL (desarrollo):

Las variables deben estar en `.env.local`

#### Si estás en VERCEL (producción):

Las variables deben estar configuradas en Vercel Dashboard

---

## 🏠 SOLUCIÓN PARA LOCAL (Desarrollo)

### 1. Crear archivo `.env.local`

En la raíz del proyecto, crea o edita el archivo `.env.local`:

```bash
# .env.local
MP_ACCESS_TOKEN=APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6
```

### 2. Verificar que el archivo existe

```bash
# Verificar que existe
ls -la .env.local

# Ver contenido (sin mostrar valores completos por seguridad)
cat .env.local | sed 's/\(.\{20\}\).*/\1.../'
```

### 3. Reiniciar el servidor de desarrollo

```bash
# Detener el servidor (Ctrl+C)
# Luego iniciar de nuevo
pnpm dev
```

### 4. Verificar con script de diagnóstico

```bash
pnpm diagnose-mp-env
```

---

## ☁️ SOLUCIÓN PARA VERCEL (Producción)

### 1. Acceder a Vercel Dashboard

1. Ve a: **https://vercel.com/dashboard**
2. Inicia sesión
3. Selecciona el proyecto: **`catalogo-indumentaria`**

### 2. Ir a Environment Variables

1. Click en la pestaña **"Settings"**
2. En el menú lateral izquierdo, click en **"Environment Variables"**

### 3. Agregar Variable MP_ACCESS_TOKEN

1. Click en **"Add New"** o **"Add"**
2. En **"Key"**, escribe exactamente:
   ```
   MP_ACCESS_TOKEN
   ```
3. En **"Value"**, pega exactamente:
   ```
   APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974
   ```
4. **IMPORTANTE:** Marca los checkboxes:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Click en **"Save"**

### 4. Agregar Variable NEXT_PUBLIC_MP_PUBLIC_KEY (Opcional)

1. Click en **"Add New"** nuevamente
2. En **"Key"**, escribe:
   ```
   NEXT_PUBLIC_MP_PUBLIC_KEY
   ```
3. En **"Value"**, pega:
   ```
   APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6
   ```
4. Marca los checkboxes:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Click en **"Save"**

### 5. HACER REDEPLOY (CRÍTICO)

**⚠️ IMPORTANTE:** Las variables solo están disponibles en NUEVOS deployments. Debes hacer un redeploy.

#### Opción A: Redeploy desde Dashboard

1. Ve a la pestaña **"Deployments"**
2. Encuentra el último deployment
3. Click en los **tres puntos** (`...`) a la derecha
4. Selecciona **"Redeploy"**
5. Confirma

#### Opción B: Redeploy con Git Push

```bash
git commit --allow-empty -m "trigger redeploy for env vars"
git push origin main
```

### 6. Verificar que Funcionó

1. Ve a **Deployments** → Último deployment
2. Click en **"View Function Logs"** o **"View Logs"**
3. Busca estas líneas:
   ```
   [MP-PAYMENT] ✅ Token configurado correctamente
   [MP-PAYMENT] Tipo: PRODUCCIÓN
   ```
4. Si ves estos mensajes, ¡está funcionando!

---

## 🔍 Verificación y Diagnóstico

### Script de Diagnóstico

Ejecuta el script de diagnóstico para identificar el problema:

```bash
pnpm diagnose-mp-env
```

Este script te mostrará:

- ✅ Si las variables están presentes
- ✅ Si tienen formato válido
- ✅ Dónde están configuradas
- ✅ Qué hacer para solucionarlo

### Verificar Manualmente

#### En Local:

```bash
# Verificar variable
echo $MP_ACCESS_TOKEN

# O en Node.js
node -e "console.log(process.env.MP_ACCESS_TOKEN ? '✅ Presente' : '❌ No encontrado')"
```

#### En Vercel:

1. Ve a **Deployments** → Último deployment → **View Function Logs**
2. Busca logs que empiecen con `[MP-PAYMENT]`
3. Deberías ver información sobre el token

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "Variable agregada pero aún no funciona"

**Causa:** No hiciste redeploy después de agregar la variable.

**Solución:**

1. Haz un redeploy (ver paso 5 arriba)
2. Las variables solo están disponibles en nuevos deployments

### Problema 2: "Variable configurada solo para Production"

**Causa:** La variable solo está configurada para un entorno.

**Solución:**

1. Ve a Environment Variables en Vercel
2. Edita la variable
3. Marca los 3 checkboxes: Production, Preview, Development
4. Guarda y haz redeploy

### Problema 3: "Nombre de variable incorrecto"

**Causa:** El nombre de la variable no es exactamente `MP_ACCESS_TOKEN`.

**Solución:**

1. Verifica que el nombre sea exactamente: `MP_ACCESS_TOKEN`
2. No debe ser: `MERCADOPAGO_ACCESS_TOKEN`, `MP_TOKEN`, etc.
3. Es case-sensitive: debe ser mayúsculas

### Problema 4: "Token tiene espacios extra"

**Causa:** El valor tiene espacios al inicio o final.

**Solución:**

1. Copia el valor exacto sin espacios:
   ```
   APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974
   ```
2. No agregues espacios antes o después

### Problema 5: "Funciona en local pero no en Vercel"

**Causa:** Variables configuradas solo localmente.

**Solución:**

1. Configura las variables en Vercel Dashboard (no solo en `.env.local`)
2. Haz redeploy después de agregarlas

---

## 📋 Checklist de Verificación

Antes de considerar que está solucionado, verifica:

- [ ] Variable `MP_ACCESS_TOKEN` agregada en Vercel Dashboard
- [ ] Variable configurada para Production, Preview y Development
- [ ] Nombre exacto: `MP_ACCESS_TOKEN` (sin espacios, case-sensitive)
- [ ] Valor completo sin espacios extra
- [ ] Redeploy realizado después de agregar la variable
- [ ] Logs verificados (sin errores de MP_ACCESS_TOKEN)
- [ ] Script de diagnóstico ejecutado (`pnpm diagnose-mp-env`)

---

## 🧪 Probar que Funciona

### Test 1: Verificar en Logs

1. Ve a Vercel → Deployments → Último deploy → View Function Logs
2. Busca: `[MP-PAYMENT] ✅ Token configurado correctamente`

### Test 2: Probar Checkout

1. Ve a tu aplicación en producción
2. Agrega productos al carrito
3. Click en "Finalizar Compra"
4. Deberías ser redirigido al checkout de Mercado Pago
5. Si ves el checkout, ¡funciona!

### Test 3: Usar Script de Verificación

```bash
pnpm verify-mp-prod
```

---

## 📚 Referencias

- [Guía Completa de Configuración](./GUIA_VERCEL_ENV_VARS.md)
- [Documentación de Credenciales](./docs/CREDENCIALES_MP_COMPLETAS.md)
- [Sistema MP + Envío](./docs/MERCADOPAGO_ENVIO_COMPLETO.md)

---

## 💡 Resumen Rápido

**Para VERCEL (Producción):**

1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Agrega `MP_ACCESS_TOKEN` con el valor completo
3. Marca Production, Preview, Development
4. **HAZ REDEPLOY** (crítico)
5. Verifica en logs

**Para LOCAL (Desarrollo):**

1. Crea `.env.local` en la raíz
2. Agrega `MP_ACCESS_TOKEN=...`
3. Reinicia el servidor (`pnpm dev`)

---

**¿Aún tienes problemas?** Ejecuta `pnpm diagnose-mp-env` y revisa los logs en Vercel.
