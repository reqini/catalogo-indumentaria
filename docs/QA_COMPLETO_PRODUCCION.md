# 🧪 QA COMPLETO - PRODUCCIÓN FINAL

**Fecha:** 2024-12-19  
**Versión:** Producción Final  
**Objetivo:** Verificar que TODO funcione 100% en producción

---

## ✅ CHECKLIST DE VERIFICACIÓN

### 🟣 1. MERCADO PAGO - FLUJO COMPLETO

#### 1.1 Creación de Preferencia
- [ ] **Test 1.1.1**: Crear preferencia con productos sin envío
  - Agregar productos al carrito
  - Ir a checkout
  - Crear preferencia sin seleccionar envío
  - Verificar que se crea correctamente
  - Verificar logs: `[MP-PAYMENT] 🎯 QA LOG - Preferencia creada`
  
- [ ] **Test 1.1.2**: Crear preferencia con productos + envío
  - Agregar productos al carrito
  - Calcular envío con código postal válido (ej: B8000)
  - Seleccionar método de envío
  - Crear preferencia
  - Verificar que el envío se incluye en los items
  - Verificar logs: `[MP-PAYMENT] 🎯 QA LOG - Preferencia creada` con `hasShipping: true`

#### 1.2 Redirección a Mercado Pago
- [ ] **Test 1.2.1**: Redirección correcta
  - Verificar que `init_point` es una URL válida de Mercado Pago
  - Verificar que redirige correctamente
  - Verificar que los items se muestran correctamente en MP

#### 1.3 Webhook y Procesamiento
- [ ] **Test 1.3.1**: Pago aprobado
  - Realizar pago de prueba aprobado
  - Verificar que el webhook se recibe
  - Verificar logs: `[MP-WEBHOOK] 🎯 QA LOG - Webhook recibido`
  - Verificar que el stock se actualiza correctamente
  - Verificar que se crea `compra_log` con estado `aprobado`
  - Verificar que se guarda el costo de envío en metadata si existe
  - Verificar que se envía email de confirmación

- [ ] **Test 1.3.2**: Pago pendiente
  - Realizar pago pendiente (ej: transferencia bancaria)
  - Verificar que el webhook se recibe
  - Verificar que se crea `compra_log` con estado `pendiente`

- [ ] **Test 1.3.3**: Pago rechazado
  - Realizar pago rechazado
  - Verificar que el webhook se recibe
  - Verificar que NO se actualiza el stock
  - Verificar que NO se crea `compra_log` aprobado

#### 1.4 Redirecciones Post-Pago
- [ ] **Test 1.4.1**: Redirección a `/pago/success`
  - Completar pago exitoso
  - Verificar que redirige a `/pago/success`
  - Verificar que muestra el payment_id
  - Verificar que el carrito se limpia

- [ ] **Test 1.4.2**: Redirección a `/pago/failure`
  - Cancelar o rechazar pago
  - Verificar que redirige a `/pago/failure`
  - Verificar que muestra mensaje apropiado

- [ ] **Test 1.4.3**: Redirección a `/pago/pending`
  - Realizar pago pendiente
  - Verificar que redirige a `/pago/pending`
  - Verificar que muestra mensaje apropiado

---

### 🟣 2. SISTEMA DE ENVÍOS - CÁLCULO POR CÓDIGO POSTAL

#### 2.1 Cálculo de Envíos
- [ ] **Test 2.1.1**: CP Capital (B1407)
  - Ingresar código postal B1407
  - Verificar que calcula correctamente
  - Verificar que muestra múltiples métodos (OCA, Correo, Andreani)
  - Verificar logs: `[API-ENVIOS] 🎯 QA LOG - Cálculo de envío`

- [ ] **Test 2.1.2**: CP GBA (B1708)
  - Ingresar código postal B1708
  - Verificar que calcula correctamente
  - Verificar que los precios son similares a Capital

- [ ] **Test 2.1.3**: CP Interior (X5000)
  - Ingresar código postal X5000 (Córdoba)
  - Verificar que calcula correctamente
  - Verificar que los precios son más altos (multiplicador zona)

- [ ] **Test 2.1.4**: CP Inválido
  - Ingresar código postal inválido (ej: "123")
  - Verificar que muestra error apropiado
  - Verificar que no calcula métodos

#### 2.2 Selección de Método
- [ ] **Test 2.2.1**: Seleccionar método de envío
  - Calcular envío
  - Seleccionar un método (ej: OCA Estándar)
  - Verificar que se marca como seleccionado
  - Verificar que el costo se agrega al total

- [ ] **Test 2.2.2**: Cambiar método de envío
  - Seleccionar un método
  - Seleccionar otro método
  - Verificar que el costo se actualiza correctamente

#### 2.3 Integración con Checkout
- [ ] **Test 2.3.1**: Envío incluido en preferencia
  - Seleccionar método de envío
  - Crear preferencia de pago
  - Verificar que el envío se incluye como item en MP
  - Verificar que el total incluye el costo de envío

- [ ] **Test 2.3.2**: Envío guardado en compra_log
  - Completar pago con envío
  - Verificar que el webhook guarda el costo de envío
  - Verificar que `compra_log.metadata.costo_envio` existe
  - Verificar que `compra_log.metadata.metodo_envio` existe

---

### 🟣 3. CARGA DE IMÁGENES - SUPABASE STORAGE

#### 3.1 Upload de Imágenes
- [ ] **Test 3.1.1**: Subir imagen nueva
  - Crear producto nuevo
  - Subir imagen JPG
  - Verificar que se sube correctamente
  - Verificar logs: `[UPLOAD-IMAGE] 🎯 QA LOG - Upload exitoso`
  - Verificar que NO hay errores de CSP
  - Verificar que NO hay errores de bucket
  - Verificar que la URL es válida (empieza con `https://yqggrzxjhylnxjuagfyr.supabase.co`)

- [ ] **Test 3.1.2**: Subir imagen PNG
  - Crear producto nuevo
  - Subir imagen PNG
  - Verificar que se sube correctamente
  - Verificar que NO hay doble extensión (`.png.png`)

- [ ] **Test 3.1.3**: Subir imagen WebP
  - Crear producto nuevo
  - Subir imagen WebP
  - Verificar que se sube correctamente

#### 3.2 Reemplazo de Imágenes
- [ ] **Test 3.2.1**: Reemplazar imagen existente
  - Editar producto existente
  - Cambiar la imagen
  - Verificar que se sube la nueva imagen
  - Verificar que la URL se actualiza correctamente
  - Verificar que la imagen anterior se puede eliminar (opcional)

#### 3.3 Placeholder y Validaciones
- [ ] **Test 3.3.1**: Crear producto sin imagen
  - Crear producto nuevo sin subir imagen
  - Verificar que se asigna placeholder (`/images/default-product.svg`)
  - Verificar que NO hay errores

- [ ] **Test 3.3.2**: Validación de tamaño
  - Intentar subir imagen > 5MB
  - Verificar que muestra error apropiado
  - Verificar que NO se sube la imagen

- [ ] **Test 3.3.3**: Validación de formato
  - Intentar subir archivo que no es imagen (ej: PDF)
  - Verificar que muestra error apropiado
  - Verificar que NO se sube el archivo

#### 3.4 Visualización
- [ ] **Test 3.4.1**: Imagen visible en admin
  - Crear producto con imagen
  - Verificar que la imagen se muestra en el listado de productos
  - Verificar que la imagen se muestra en el formulario de edición

- [ ] **Test 3.4.2**: Imagen visible en catálogo público
  - Crear producto con imagen
  - Ir a `/catalogo`
  - Verificar que la imagen se muestra correctamente
  - Verificar que NO hay errores de CORS o CSP

- [ ] **Test 3.4.3**: Imagen visible en detalle de producto
  - Ir a `/producto/[id]`
  - Verificar que la imagen se muestra correctamente
  - Verificar que NO hay errores

---

### 🟣 4. VERIFICACIÓN DE ERRORES

#### 4.1 Consola del Navegador
- [ ] **Test 4.1.1**: Consola limpia en Home
  - Abrir `/`
  - Abrir DevTools → Console
  - Verificar que NO hay errores
  - Verificar que NO hay warnings críticos

- [ ] **Test 4.1.2**: Consola limpia en Catálogo
  - Abrir `/catalogo`
  - Abrir DevTools → Console
  - Verificar que NO hay errores
  - Verificar que NO hay warnings críticos

- [ ] **Test 4.1.3**: Consola limpia en Admin
  - Abrir `/admin/productos`
  - Abrir DevTools → Console
  - Verificar que NO hay errores
  - Verificar que NO hay warnings críticos

#### 4.2 Network (Red)
- [ ] **Test 4.2.1**: Requests exitosos
  - Abrir DevTools → Network
  - Navegar por la app
  - Verificar que NO hay requests con status 400, 500, etc.
  - Verificar que las imágenes se cargan correctamente

- [ ] **Test 4.2.2**: CSP no bloquea recursos
  - Verificar que NO hay errores de CSP bloqueando Supabase
  - Verificar que NO hay errores de CSP bloqueando Mercado Pago
  - Verificar que las imágenes de Supabase se cargan

#### 4.3 Errores de Storage
- [ ] **Test 4.3.1**: No hay errores de bucket
  - Verificar que NO aparece "Bucket productos no existe"
  - Verificar que NO hay llamadas a `createBucket()` o `listBuckets()`

- [ ] **Test 4.3.2**: No hay errores de StorageUnknownError
  - Intentar subir imagen
  - Verificar que NO aparece "StorageUnknownError: Failed to fetch"
  - Verificar que el upload funciona correctamente

---

## 📊 RESULTADOS ESPERADOS

### ✅ Mercado Pago
- Preferencias se crean correctamente
- Redirecciones funcionan (success, failure, pending)
- Webhook procesa pagos correctamente
- Stock se actualiza automáticamente
- Emails se envían correctamente
- Costo de envío se guarda en compra_log

### ✅ Sistema de Envíos
- Cálculo funciona para diferentes CP
- Múltiples métodos disponibles (OCA, Correo, Andreani, Mercado Envíos)
- Selección de método funciona
- Costo se agrega al total correctamente
- Costo se guarda en compra_log

### ✅ Carga de Imágenes
- Upload funciona sin errores
- No hay errores de CSP
- No hay errores de bucket
- No hay doble extensión
- Imágenes se muestran correctamente
- Placeholder funciona cuando no hay imagen

### ✅ Errores
- Consola limpia (sin errores críticos)
- Network limpio (sin requests fallidos)
- No hay errores de CSP
- No hay errores de Storage

---

## 🚀 PROCEDIMIENTO DE TESTING

### Ambiente Local
1. Ejecutar `pnpm dev`
2. Abrir `http://localhost:3001`
3. Realizar todos los tests del checklist
4. Verificar logs en consola del servidor

### Ambiente Producción
1. Esperar deploy automático en Vercel
2. Abrir URL de producción
3. Realizar todos los tests del checklist
4. Verificar logs en Vercel Dashboard → Logs

---

## 📝 REGISTRO DE RESULTADOS

**Fecha de Testing:** _______________  
**Tester:** _______________  
**Ambiente:** Local / Producción  
**Navegador:** Chrome / Firefox / Safari / Edge  
**Versión:** _______________

### Resultados por Sección

#### Mercado Pago
- [ ] Todos los tests pasaron
- [ ] Algunos tests fallaron (especificar)
- [ ] Comentarios: _______________

#### Sistema de Envíos
- [ ] Todos los tests pasaron
- [ ] Algunos tests fallaron (especificar)
- [ ] Comentarios: _______________

#### Carga de Imágenes
- [ ] Todos los tests pasaron
- [ ] Algunos tests fallaron (especificar)
- [ ] Comentarios: _______________

#### Errores
- [ ] Consola limpia
- [ ] Network limpio
- [ ] Comentarios: _______________

---

## ✅ CRITERIO DE APROBACIÓN

**La aplicación se considera lista para producción cuando:**
- ✅ Todos los tests de Mercado Pago pasan
- ✅ Todos los tests de Envíos pasan
- ✅ Todos los tests de Imágenes pasan
- ✅ No hay errores en consola
- ✅ No hay errores en network
- ✅ Flujo completo funciona de punta a punta

---

## 🔗 REFERENCIAS

- `app/api/pago/route.ts` - Creación de preferencias
- `app/api/mp/webhook/route.ts` - Procesamiento de webhooks
- `app/api/envios/calcular/route.ts` - Cálculo de envíos
- `app/api/admin/upload-image/route.ts` - Upload de imágenes
- `components/ShippingCalculator.tsx` - Componente de cálculo de envíos
- `components/ImageUploader.tsx` - Componente de upload de imágenes

