# 🗄️ Configuración de Supabase Storage - Bucket "productos"

**OBLIGATORIO:** Este bucket debe crearse manualmente en Supabase Dashboard antes de usar la aplicación en producción.

---

## 📋 PASOS PARA CREAR EL BUCKET

### 1. Acceder a Supabase Dashboard

1. Ir a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleccionar tu proyecto: `yqggrzxjhylnxjuagfyr`
3. Ir a la sección **Storage** en el menú lateral

### 2. Crear Nuevo Bucket

1. Click en **"New bucket"** o **"Crear bucket"**
2. Nombre del bucket: **`productos`** (EXACTO, sin espacios, minúsculas)
3. **Public bucket**: ✅ **MARCAR COMO PÚBLICO** (necesario para URLs públicas)
4. Click en **"Create bucket"**

### 3. Configurar Políticas RLS (Row Level Security)

**CRÍTICO:** Sin estas políticas, el upload fallará con error de permisos.

#### Política 1: Permitir lectura pública (SELECT)

```sql
-- Permitir lectura pública de imágenes
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'productos');
```

#### Política 2: Permitir escritura para usuarios autenticados (INSERT)

```sql
-- Permitir upload para usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);
```

#### Política 3: Permitir actualización para usuarios autenticados (UPDATE)

```sql
-- Permitir actualización para usuarios autenticados
CREATE POLICY "Authenticated users can update"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);
```

#### Política 4: Permitir eliminación para usuarios autenticados (DELETE)

```sql
-- Permitir eliminación para usuarios autenticados
CREATE POLICY "Authenticated users can delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);
```

### 4. Verificar Configuración

1. Ir a **Storage** → **Policies**
2. Verificar que las 4 políticas estén creadas y activas
3. Verificar que el bucket `productos` aparezca en la lista

---

## 🔍 VERIFICACIÓN POST-CONFIGURACIÓN

### Test Manual

1. Intentar subir una imagen desde el admin
2. Verificar que no aparezca error "Bucket not found"
3. Verificar que la imagen se muestre correctamente después del upload

### Logs Esperados

Si todo está correcto, deberías ver en los logs:

```
[UPLOAD-IMAGE] ✅ Tenant autenticado: {tenantId}
[UPLOAD-IMAGE] 📤 Iniciando upload a Supabase Storage: {...}
[UPLOAD-IMAGE] ✅ Archivo subido exitosamente: {...}
[UPLOAD-IMAGE] ✅ Imagen subida exitosamente: {...}
```

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### Error: "Bucket 'productos' no existe"

**Solución:** Crear el bucket siguiendo los pasos anteriores.

### Error: "new row violates row-level security"

**Solución:** Crear las políticas RLS siguiendo el paso 3.

### Error: "StorageUnknownError: Failed to fetch"

**Causas posibles:**
1. CSP bloqueando Supabase → Verificar `middleware.ts` y `next.config.js`
2. Bucket no público → Marcar bucket como público
3. Políticas RLS incorrectas → Verificar políticas en Supabase Dashboard

---

## 📝 NOTAS IMPORTANTES

- El bucket **DEBE** ser público para que las imágenes se muestren en el frontend
- Las políticas RLS son **OBLIGATORIAS** para permitir uploads
- El nombre del bucket es **case-sensitive**: `productos` (no `Productos` ni `PRODUCTOS`)
- Después de crear el bucket, puede tomar unos minutos en estar disponible

---

**Última actualización:** 2025-02-27

