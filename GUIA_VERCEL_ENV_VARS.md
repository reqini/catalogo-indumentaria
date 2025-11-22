# 🚀 Guía Paso a Paso: Configurar Variables de Entorno en Vercel

## 📋 Variables que DEBES Configurar

### Variable 1: MP_ACCESS_TOKEN (OBLIGATORIA) ⚠️

Esta es la variable **MÁS IMPORTANTE**. Sin ella, el checkout de Mercado Pago NO funcionará.

```
Nombre: MP_ACCESS_TOKEN
Valor: APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974
Entornos: ✅ Production ✅ Preview ✅ Development
```

### Variable 2: NEXT_PUBLIC_MP_PUBLIC_KEY (Opcional pero Recomendado)

Esta variable es opcional, pero recomendada para usar el SDK de Mercado Pago en el frontend.

```
Nombre: NEXT_PUBLIC_MP_PUBLIC_KEY
Valor: APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6
Entornos: ✅ Production ✅ Preview ✅ Development
```

## 🎯 Pasos Detallados para Configurar en Vercel

### Paso 1: Acceder a Vercel Dashboard

1. Abre tu navegador y ve a: **https://vercel.com/dashboard**
2. Inicia sesión con tu cuenta de Vercel
3. Busca y selecciona el proyecto: **`catalogo-indumentaria`**

### Paso 2: Ir a Configuración de Variables de Entorno

1. En la página del proyecto, haz click en la pestaña **"Settings"** (Configuración)
2. En el menú lateral izquierdo, busca y haz click en **"Environment Variables"** (Variables de Entorno)

### Paso 3: Agregar Variable 1: MP_ACCESS_TOKEN

1. Haz click en el botón **"Add New"** o **"Add"** (Agregar Nueva)
2. En el campo **"Key"** (Clave), escribe exactamente:
   ```
   MP_ACCESS_TOKEN
   ```
3. En el campo **"Value"** (Valor), pega exactamente:
   ```
   APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974
   ```
4. **IMPORTANTE:** Marca los checkboxes para los tres entornos:
   - ✅ **Production** (Producción)
   - ✅ **Preview** (Vista Previa)
   - ✅ **Development** (Desarrollo)
5. Haz click en **"Save"** (Guardar)

### Paso 4: Agregar Variable 2: NEXT_PUBLIC_MP_PUBLIC_KEY

1. Haz click nuevamente en **"Add New"** o **"Add"**
2. En el campo **"Key"**, escribe exactamente:
   ```
   NEXT_PUBLIC_MP_PUBLIC_KEY
   ```
3. En el campo **"Value"**, pega exactamente:
   ```
   APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6
   ```
4. Marca los checkboxes para los tres entornos:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Haz click en **"Save"**

### Paso 5: Verificar que las Variables Estén Configuradas

Deberías ver una tabla con estas dos variables:

| Key                         | Value (oculto) | Environments                     |
| --------------------------- | -------------- | -------------------------------- |
| `MP_ACCESS_TOKEN`           | `••••••••••••` | Production, Preview, Development |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | `••••••••••••` | Production, Preview, Development |

## 🔄 Paso 6: Hacer Redeploy (CRÍTICO)

**IMPORTANTE:** Después de agregar las variables, DEBES hacer un redeploy para que surtan efecto.

### Opción A: Redeploy desde Deployments

1. Ve a la pestaña **"Deployments"** (Despliegues)
2. Encuentra el último deployment
3. Haz click en los **tres puntos** (`...`) a la derecha del deployment
4. Selecciona **"Redeploy"** (Redesplegar)
5. Confirma el redeploy

### Opción B: Redeploy desde Settings

1. Ve a **Settings** → **General**
2. Scroll hasta la sección **"Deployments"**
3. Haz click en **"Redeploy"** del último deployment

### Opción C: Push a GitHub (Automático)

Si tienes auto-deploy configurado, simplemente haz un push a la rama `main`:

```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

## ✅ Paso 7: Verificar que Funcionó

### Verificar en Logs de Vercel

1. Ve a **Deployments** → Último deployment
2. Haz click en **"View Function Logs"** o **"View Logs"**
3. Busca en los logs estas líneas:
   ```
   [MP-PAYMENT] ✅ Token configurado correctamente
   [MP-PAYMENT] Tipo: PRODUCCIÓN
   ```
4. Si ves estos mensajes, ¡las variables están configuradas correctamente!

### Verificar en la Aplicación

1. Ve a tu aplicación en producción
2. Agrega productos al carrito
3. Haz click en "Finalizar Compra"
4. Deberías ser redirigido al checkout de Mercado Pago
5. Si ves el checkout de MP, ¡todo funciona correctamente!

## 🚨 Troubleshooting

### Problema: "MP_ACCESS_TOKEN no está configurado"

**Solución:**

1. Verifica que agregaste la variable `MP_ACCESS_TOKEN` (no `MERCADOPAGO_ACCESS_TOKEN` ni otro nombre)
2. Verifica que el valor está completo (sin espacios al inicio o final)
3. Verifica que marcaste los checkboxes de los entornos correctos
4. Haz un redeploy después de agregar la variable

### Problema: "Error al crear preferencia de pago"

**Solución:**

1. Verifica que el Access Token es válido y no está expirado
2. Verifica que tienes permisos en tu cuenta de Mercado Pago
3. Revisa los logs detallados en Vercel Function Logs

### Problema: Las variables no aparecen en el deployment

**Solución:**

1. Asegúrate de hacer un **redeploy** después de agregar las variables
2. Las variables solo están disponibles en nuevos deployments
3. Los deployments anteriores NO tienen acceso a las nuevas variables

## 📸 Capturas de Pantalla (Referencia)

### Ubicación de Settings

```
Vercel Dashboard
  └── Tu Proyecto (catalogo-indumentaria)
      └── Settings (pestaña superior)
          └── Environment Variables (menú lateral izquierdo)
```

### Formato de la Variable

```
┌─────────────────────────────────────────┐
│ Key: MP_ACCESS_TOKEN                    │
│ Value: APP_USR-8653596253805253-...     │
│                                         │
│ ☑ Production                            │
│ ☑ Preview                                │
│ ☑ Development                            │
│                                         │
│ [Cancel] [Save]                         │
└─────────────────────────────────────────┘
```

## 📚 Referencias Adicionales

- [Documentación Completa de Credenciales](./docs/CREDENCIALES_MP_COMPLETAS.md)
- [Guía de Configuración Detallada](./docs/CONFIGURAR_CREDENCIALES_MP_PRODUCCION.md)
- [Sistema MP + Envío](./docs/MERCADOPAGO_ENVIO_COMPLETO.md)

---

## ✅ Checklist Final

Antes de considerar que está todo configurado, verifica:

- [ ] Variable `MP_ACCESS_TOKEN` agregada en Vercel
- [ ] Variable `NEXT_PUBLIC_MP_PUBLIC_KEY` agregada en Vercel (opcional)
- [ ] Ambas variables configuradas para Production, Preview y Development
- [ ] Redeploy realizado después de agregar las variables
- [ ] Logs verificados (sin errores de MP_ACCESS_TOKEN)
- [ ] Checkout probado en producción (redirige a Mercado Pago)

---

**¿Necesitas ayuda?** Revisa los logs en Vercel o consulta la documentación completa en `docs/CONFIGURAR_CREDENCIALES_MP_PRODUCCION.md`
