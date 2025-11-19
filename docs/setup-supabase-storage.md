# Configuración de Supabase Storage - Bucket "productos"

## Problema
El bucket "productos" no existe en Supabase Storage, lo que causa errores al intentar subir imágenes de productos.

## Solución

### Paso 1: Crear el bucket en Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Storage** en el menú lateral
3. Haz clic en **New bucket**
4. Configura el bucket con los siguientes valores:
   - **Name**: `productos`
   - **Public bucket**: ✅ Activado (marca esta casilla)
   - **File size limit**: `5242880` (5MB en bytes)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`

5. Haz clic en **Create bucket**

### Paso 2: Configurar políticas RLS (Row Level Security)

1. En el bucket `productos`, ve a la pestaña **Policies**
2. Haz clic en **New Policy**
3. Selecciona **Create a policy from scratch**
4. Configura la política:

**Policy Name**: `Allow public read access`
**Allowed operation**: `SELECT`
**Policy definition**:
```sql
bucket_id = 'productos'
```

5. Crea otra política:

**Policy Name**: `Allow authenticated uploads`
**Allowed operation**: `INSERT`
**Policy definition**:
```sql
bucket_id = 'productos' AND auth.role() = 'authenticated'
```

6. Crea otra política:

**Policy Name**: `Allow authenticated updates`
**Allowed operation**: `UPDATE`
**Policy definition**:
```sql
bucket_id = 'productos' AND auth.role() = 'authenticated'
```

7. Crea otra política:

**Policy Name**: `Allow authenticated deletes`
**Allowed operation**: `DELETE`
**Policy definition**:
```sql
bucket_id = 'productos' AND auth.role() = 'authenticated'
```

### Paso 3: Verificar configuración

Ejecuta el siguiente script para verificar que el bucket existe y está configurado correctamente:

```bash
pnpm run verificar-config-completa
```

O manualmente, intenta subir una imagen desde el admin panel.

## Alternativa: Crear bucket mediante API (solo desarrollo)

Si estás en desarrollo local y tienes permisos de admin, el código intentará crear el bucket automáticamente. Sin embargo, en producción, el bucket debe crearse manualmente desde el Dashboard.

## Notas importantes

- El bucket debe ser **público** para que las imágenes sean accesibles desde el frontend
- El límite de tamaño de archivo es de 5MB
- Solo se permiten formatos: JPG, PNG, WebP
- Las políticas RLS aseguran que solo usuarios autenticados puedan subir/modificar/eliminar archivos

