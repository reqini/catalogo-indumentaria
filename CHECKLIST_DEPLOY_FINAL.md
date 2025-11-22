# ✅ CHECKLIST FINAL PARA DEPLOY A PRODUCCIÓN

**Fecha:** 2024-12-19  
**Versión:** Producción Final  
**Commit:** `aca67f7`

---

## 🔴 CRÍTICO - ANTES DE DEPLOY

### Variables de Entorno en Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `JWT_SECRET` configurado (generado con `openssl rand -base64 32`)
- [ ] `MP_ACCESS_TOKEN` configurado (token de producción)
- [ ] `MP_PUBLIC_KEY` configurado (key de producción)
- [ ] `MP_WEBHOOK_SECRET` configurado (opcional pero recomendado)
- [ ] `NEXT_PUBLIC_BASE_URL` configurado (URL de producción)

### Supabase - Bucket y Políticas
- [ ] Bucket `productos` creado en Supabase Dashboard
- [ ] Política RLS: SELECT público
- [ ] Política RLS: INSERT autenticado
- [ ] Política RLS: UPDATE autenticado
- [ ] Política RLS: DELETE autenticado

### Mercado Pago - Webhook
- [ ] Webhook configurado en Mercado Pago Dashboard
- [ ] URL del webhook: `https://catalogo-indumentaria.vercel.app/api/mp/webhook`
- [ ] Webhook secret configurado (si se usa)

---

## 🟡 IMPORTANTE - VERIFICAR DESPUÉS DEL DEPLOY

### 1. Verificar que el Deploy Funciona
- [ ] Build exitoso en Vercel
- [ ] App carga correctamente
- [ ] No hay errores en logs de Vercel

### 2. Verificar CSP y Storage
- [ ] Abrir consola del navegador
- [ ] Verificar que NO hay errores de CSP bloqueando Supabase
- [ ] Verificar que NO aparece "Bucket productos no existe"
- [ ] Verificar que NO hay errores de StorageUnknownError

### 3. Probar Carga de Imágenes
- [ ] Iniciar sesión en admin
- [ ] Crear producto nuevo
- [ ] Subir imagen real
- [ ] Verificar que se sube correctamente
- [ ] Verificar que se muestra en el catálogo
- [ ] Verificar logs: `[UPLOAD-IMAGE] 🎯 QA LOG - Upload exitoso`

### 4. Probar Sistema de Envíos
- [ ] Agregar productos al carrito
- [ ] Ir a checkout
- [ ] Ingresar código postal (ej: B8000)
- [ ] Verificar que calcula métodos de envío
- [ ] Seleccionar método de envío
- [ ] Verificar que el costo se agrega al total
- [ ] Verificar logs: `[API-ENVIOS] 🎯 QA LOG - Cálculo de envío`

### 5. Probar Mercado Pago
- [ ] Agregar productos al carrito
- [ ] Calcular y seleccionar envío
- [ ] Crear preferencia de pago
- [ ] Verificar que redirige a Mercado Pago
- [ ] Verificar logs: `[MP-PAYMENT] 🎯 QA LOG - Preferencia creada`
- [ ] Realizar pago de prueba aprobado
- [ ] Verificar que redirige a `/pago/success`
- [ ] Verificar que el stock se actualiza
- [ ] Verificar que se guarda el costo de envío en compra_log
- [ ] Verificar logs: `[MP-WEBHOOK] 🎯 QA LOG - Webhook recibido`

---

## 🟢 OPCIONAL - MEJORAS FUTURAS

- [ ] Integrar con APIs reales de transportistas (OCA, Correo Argentino, Andreani)
- [ ] Agregar tracking de envíos
- [ ] Implementar cache de cálculos de envío
- [ ] Agregar más métodos de pago
- [ ] Mejorar UI/UX del checkout

---

## 📝 NOTAS FINALES

- Todos los cambios están pusheados al repositorio
- El deploy se activará automáticamente en Vercel
- Los logs de QA están disponibles en consola del servidor y Vercel Dashboard
- El footer muestra la versión actual del deploy

---

## ✅ CRITERIO DE ÉXITO

**La aplicación está lista cuando:**
- ✅ Todas las verificaciones críticas están completas
- ✅ Todas las verificaciones importantes pasan
- ✅ No hay errores en consola
- ✅ Flujo completo funciona de punta a punta

---

**¡Listo para producción! 🚀**

