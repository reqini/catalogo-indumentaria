# 🧪 QA Completo - Checklist de Validación

**Fecha**: $(date)  
**Versión**: 2.0.0  
**Estado**: ✅ Listo para ejecutar

---

## 📋 Módulos a Testear

### 1. 🛒 Flujo de Compra Completo

#### Casos de Prueba

- [ ] **Elegir producto desde catálogo**
  - [ ] Producto se agrega al carrito correctamente
  - [ ] Stock se actualiza visualmente
  - [ ] Precio se calcula correctamente (con descuento si aplica)

- [ ] **Ver carrito**
  - [ ] Productos se muestran correctamente
  - [ ] Cantidad se puede modificar (respetando stock disponible)
  - [ ] Total se calcula correctamente
  - [ ] Se puede eliminar producto del carrito

- [ ] **Proceder al checkout**
  - [ ] Botón "Comprar" redirige a Mercado Pago
  - [ ] Se crea preferencia de pago correctamente
  - [ ] No hay errores en consola

- [ ] **Proceso de pago**
  - [ ] Redirección a Mercado Pago funciona
  - [ ] Datos del producto se muestran correctamente en MP
  - [ ] Pago aprobado redirige a `/pago/success`
  - [ ] Pago rechazado redirige a `/pago/failure`
  - [ ] Pago pendiente redirige a `/pago/pending`

- [ ] **Confirmación después del pago**
  - [ ] Stock se actualiza en la base de datos
  - [ ] Se registra la venta en `compra_logs`
  - [ ] Email de confirmación se envía al cliente
  - [ ] Carrito se limpia después del pago exitoso

---

### 2. 💳 Mercado Pago

#### Casos de Prueba

- [ ] **Creación de preferencia**
  - [ ] Endpoint `/api/pago` funciona correctamente
  - [ ] Se crea preferencia con datos correctos
  - [ ] `back_urls` están configuradas correctamente
  - [ ] No hay errores 500

- [ ] **Redirección**
  - [ ] Redirección a MP funciona
  - [ ] URL de MP es válida
  - [ ] No hay errores de CORS

- [ ] **Manejo de estado de pagos**
  - [ ] Pago aprobado se procesa correctamente
  - [ ] Pago rechazado se maneja correctamente
  - [ ] Pago pendiente se maneja correctamente
  - [ ] Webhook procesa notificaciones correctamente

- [ ] **Webhooks y callbacks**
  - [ ] Webhook `/api/mp/webhook` funciona
  - [ ] Validación de firma funciona
  - [ ] Idempotencia funciona (no procesa pagos duplicados)
  - [ ] No hay errores 500 en webhooks
  - [ ] Logs detallados para debugging

---

### 3. 📧 Envío de Correo

#### Casos de Prueba

- [ ] **Confirmación de compra**
  - [ ] Email se envía después de pago aprobado
  - [ ] Contenido del email es correcto:
    - [ ] Nombre del cliente
    - [ ] Lista de productos
    - [ ] Montos correctos
    - [ ] Fecha de compra
  - [ ] HTML se interpreta correctamente
  - [ ] No hay errores al enviar

- [ ] **Email admin (si aplica)**
  - [ ] Email se envía al admin cuando hay nueva venta
  - [ ] Contenido incluye detalles de la venta
  - [ ] HTML se interpreta correctamente

- [ ] **Plantillas**
  - [ ] Plantillas tienen HTML válido
  - [ ] Variables se reemplazan correctamente
  - [ ] Estilos CSS funcionan en clientes de email

---

### 4. 🏠 Redireccionamientos

#### Casos de Prueba

- [ ] **Después del login**
  - [ ] Login exitoso redirige a `/admin/dashboard`
  - [ ] No redirige a rutas protegidas sin sesión

- [ ] **Después de compra**
  - [ ] Pago exitoso redirige a `/pago/success`
  - [ ] Pago fallido redirige a `/pago/failure`
  - [ ] Pago pendiente redirige a `/pago/pending`

- [ ] **Rutas protegidas sin sesión**
  - [ ] Intentar acceder a `/admin/*` sin sesión redirige a `/admin/login`
  - [ ] Intentar acceder a `/api/admin/*` sin token retorna 401
  - [ ] Middleware funciona correctamente

---

### 5. 🛠 Admin

#### 5.1 Banners

- [ ] **ABM completo**
  - [ ] Crear banner funciona
  - [ ] Editar banner funciona
  - [ ] Eliminar banner funciona
  - [ ] Imagen se sube correctamente a Supabase Storage

- [ ] **Orden**
  - [ ] Cambiar orden de banners funciona
  - [ ] Orden se guarda en base de datos
  - [ ] Orden se refleja en la home

- [ ] **Visibilidad en home**
  - [ ] Banners activos se muestran en home
  - [ ] Banners inactivos no se muestran
  - [ ] Carousel funciona correctamente
  - [ ] Imágenes se cargan correctamente

#### 5.2 Estadísticas

- [ ] **Consulta sin errores**
  - [ ] Endpoint `/api/admin/stats` funciona
  - [ ] No hay errores 500
  - [ ] Datos se muestran correctamente:
    - [ ] Total de ventas
    - [ ] Productos vendidos
    - [ ] Monto total
    - [ ] Tasa de conversión
    - [ ] Top 5 productos más vendidos
    - [ ] Productos con stock crítico
    - [ ] Ticket promedio
    - [ ] Últimas ventas

#### 5.3 Categorías

- [ ] **Crear categoría**
  - [ ] Formulario funciona
  - [ ] Validaciones funcionan
  - [ ] Categoría se crea en base de datos
  - [ ] Slug se genera correctamente

- [ ] **Editar categoría**
  - [ ] Formulario carga datos correctos
  - [ ] Cambios se guardan correctamente
  - [ ] Validaciones funcionan

- [ ] **Eliminar categoría**
  - [ ] Eliminación funciona
  - [ ] No permite eliminar si hay productos asociados
  - [ ] Mensaje de error es claro

#### 5.4 Productos

- [ ] **Carga normal (individual)**
  - [ ] Formulario funciona
  - [ ] Validaciones funcionan
  - [ ] Imagen se sube correctamente
  - [ ] Producto se crea en base de datos
  - [ ] Producto aparece en listado

- [ ] **Carga múltiple IA (nueva unificada)**
  - [ ] Acceso desde `/admin/productos/carga-inteligente`
  - [ ] Ejemplo precargado se muestra
  - [ ] Procesamiento con IA funciona
  - [ ] Tabla editable funciona
  - [ ] Validaciones visuales funcionan
  - [ ] Importación masiva funciona
  - [ ] Productos se crean correctamente
  - [ ] Métricas se muestran correctamente

- [ ] **Edición**
  - [ ] Formulario carga datos correctos
  - [ ] Cambios se guardan correctamente
  - [ ] Imagen se puede reemplazar
  - [ ] Historial de cambios funciona (si aplica)

- [ ] **Eliminación**
  - [ ] Eliminación funciona
  - [ ] Confirmación funciona
  - [ ] Producto desaparece del listado

#### 5.5 Newsletter

- [ ] **Suscripción**
  - [ ] Formulario en home funciona
  - [ ] Email se guarda en base de datos
  - [ ] Mensaje de éxito se muestra
  - [ ] Validación de email funciona

- [ ] **Listado (si existe)**
  - [ ] Listado de suscriptores funciona
  - [ ] Datos se muestran correctamente

- [ ] **Exportación (si existe)**
  - [ ] Exportación a CSV funciona
  - [ ] Datos exportados son correctos

---

### 6. 🌐 CSP / Supabase Storage / Imágenes

#### Casos de Prueba

- [ ] **Subir imágenes de producto (flujo normal)**
  - [ ] Upload funciona correctamente
  - [ ] Imagen se sube a Supabase Storage
  - [ ] URL pública se genera correctamente
  - [ ] Imagen se muestra en el producto
  - [ ] No hay errores de CSP

- [ ] **Placeholders**
  - [ ] Placeholders se ven bien en:
    - [ ] Listado de productos
    - [ ] Detalle de producto
    - [ ] Carrito
    - [ ] Home (productos destacados)
  - [ ] Placeholder es `/images/default-product.svg`

- [ ] **CSP con Supabase**
  - [ ] No hay bloqueos de CSP con Supabase Storage
  - [ ] `connect-src` incluye `https://*.supabase.co`
  - [ ] `img-src` incluye URLs de Supabase Storage
  - [ ] Imágenes se cargan correctamente

---

## 🚀 Casos Específicos para Carga Inteligente IA

### Caso 1: Abrir herramienta por primera vez

- [ ] Ver ejemplo precargado en textarea
- [ ] No hay errores en consola
- [ ] Botones visibles y funcionales
- [ ] Texto de ayuda visible: "Podés pegar productos desde WhatsApp, Excel, o generarlos con IA usando el botón de abajo."

### Caso 2: Procesar ejemplo precargado sin tocar nada

- [ ] Se genera tabla con 4 productos válidos
- [ ] Todos en estado "OK para importar" (verde)
- [ ] Calidad promedio > 60
- [ ] No hay errores críticos

### Caso 3: Editar un precio a texto no numérico

- [ ] Fila marcada con error (rojo)
- [ ] Mensaje de error visible
- [ ] Botón "Importar" deshabilitado o avisa qué fila falló
- [ ] Al corregir, error desaparece

### Caso 4: Borrar todo el texto y tocar "Procesar con IA"

- [ ] Mostrar mensaje: "Debes ingresar información para analizar."
- [ ] Botón deshabilitado
- [ ] No hay errores 500

### Caso 5: Generar productos con ChatGPT

- [ ] Botón "Generar prompt IA" funciona
- [ ] Abre ChatGPT en pestaña nueva
- [ ] Prompt copiado al portapapeles
- [ ] Usuario puede pegar resultado y procesarlo
- [ ] Productos se importan correctamente

### Caso 6: Importar 20+ productos

- [ ] La app no se cuelga
- [ ] Los productos aparecen en el listado admin
- [ ] No hay errores 500 en logs
- [ ] Tiempo de procesamiento < 30 segundos
- [ ] Métricas se calculan correctamente

---

## 📊 Resultados Esperados

### Después de Ejecutar QA

- ✅ Todos los módulos funcionan correctamente
- ✅ No hay errores críticos en consola
- ✅ No hay errores 500 en logs del servidor
- ✅ Flujos completos funcionan de extremo a extremo
- ✅ Validaciones funcionan correctamente
- ✅ Mensajes de error son claros y útiles
- ✅ UX es fluida e intuitiva

---

## 🐛 Errores Comunes a Verificar

- [ ] No hay errores de CORS
- [ ] No hay errores de CSP bloqueando recursos
- [ ] No hay errores de autenticación (401/403)
- [ ] No hay errores 500 en APIs
- [ ] No hay errores de TypeScript en build
- [ ] No hay warnings de React en consola
- [ ] No hay errores de imágenes rotas
- [ ] No hay errores de Supabase Storage

---

## 📝 Notas de Testing

### Ambiente de Prueba

- **Desarrollo**: `http://localhost:3000` o `http://localhost:3001`
- **Producción**: URL de Vercel o dominio configurado

### Credenciales de Prueba

- **Admin**: `admin@catalogo.com` / `admin123`
- **Mercado Pago**: Usar credenciales de test

### Datos de Prueba

- Crear productos de prueba antes de testear flujo de compra
- Usar stock suficiente para evitar errores de stock agotado
- Verificar que Mercado Pago esté en modo test

---

**Última actualización**: $(date)  
**Versión**: 2.0.0  
**Estado**: ✅ Listo para ejecutar

