# 🪣 CONFIGURACIÓN COMPLETA DE SUPABASE STORAGE

**OBJETIVO:** Configurar el bucket `productos` en Supabase para permitir carga de imágenes sin errores.

---

## 📋 PASOS OBLIGATORIOS

### 1️⃣ **ACCEDER A SUPABASE DASHBOARD**

1. Ir a: https://supabase.com/dashboard
2. Seleccionar el proyecto: `yqggrzxjhylnxjuagfyr` (o tu proyecto)
3. Ir a la sección **Storage** en el menú lateral

---

### 2️⃣ **CREAR BUCKET "productos"**

1. Click en **"New bucket"** o **"Create bucket"**
2. **Nombre del bucket:** `productos` (EXACTO, sin espacios, minúsculas)
3. **Public bucket:** ✅ **MARCAR COMO PÚBLICO** (esto permite acceso público a las imágenes)
4. **File size limit:** 5MB (o el límite que prefieras)
5. **Allowed MIME types:** `image/jpeg, image/jpg, image/png, image/webp`
6. Click en **"Create bucket"**

---

### 3️⃣ **CONFIGURAR POLÍTICAS RLS (Row Level Security)**

#### **POLÍTICA 1: Lectura Pública (SELECT)**

1. Ir a **Storage** → **Policies** → Seleccionar bucket `productos`
2. Click en **"New Policy"**
3. **Policy name:** `Public read access`
4. **Allowed operation:** `SELECT`
5. **Policy definition:**
   ```sql
   (bucket_id = 'productos')
   ```
6. **Target roles:** `public` (o `anon`)
7. Click en **"Save"**

#### **POLÍTICA 2: Escritura Autenticada (INSERT)**

1. Click en **"New Policy"**
2. **Policy name:** `Authenticated insert access`
3. **Allowed operation:** `INSERT`
4. **Policy definition:**
   ```sql
   (bucket_id = 'productos' AND auth.role() = 'authenticated')
   ```
5. **Target roles:** `authenticated`
6. Click en **"Save"**

#### **POLÍTICA 3: Actualización Autenticada (UPDATE)**

1. Click en **"New Policy"**
2. **Policy name:** `Authenticated update access`
3. **Allowed operation:** `UPDATE`
4. **Policy definition:**
   ```sql
   (bucket_id = 'productos' AND auth.role() = 'authenticated')
   ```
5. **Target roles:** `authenticated`
6. Click en **"Save"**

#### **POLÍTICA 4: Eliminación Autenticada (DELETE)**

1. Click en **"New Policy"**
2. **Policy name:** `Authenticated delete access`
3. **Allowed operation:** `DELETE`
4. **Policy definition:**
   ```sql
   (bucket_id = 'productos' AND auth.role() = 'authenticated')
   ```
5. **Target roles:** `authenticated`
6. Click en **"Save"**

---

### 4️⃣ **VERIFICAR CONFIGURACIÓN**

#### **Verificación Manual:**

1. En Supabase Dashboard → Storage → `productos`
2. Verificar que el bucket esté marcado como **Public**
3. Verificar que existan las 4 políticas RLS mencionadas arriba

#### **Verificación por Código:**

Ejecutar en la consola del navegador (en el admin):

```javascript
// Verificar que el bucket existe y es accesible
fetch('/api/admin/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  credentials: 'include',
  body: new FormData() // Esto fallará pero verificará que el endpoint existe
})
.then(r => console.log('Endpoint accesible:', r.status))
.catch(e => console.error('Error:', e))
```

---

## 🔍 TROUBLESHOOTING

### ❌ **Error: "Bucket productos no existe"**

**Solución:**
1. Verificar que el bucket se llame exactamente `productos` (sin espacios, minúsculas)
2. Verificar que el bucket esté creado en el proyecto correcto de Supabase
3. Verificar que las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén correctas

---

### ❌ **Error: "new row violates row-level security"**

**Solución:**
1. Verificar que las políticas RLS estén creadas correctamente
2. Verificar que el usuario esté autenticado (tiene token válido)
3. Verificar que la política de INSERT permita `authenticated` role

---

### ❌ **Error: "Failed to fetch" o CSP bloquea**

**Solución:**
1. Verificar que el CSP en `middleware.ts` incluya `https://*.supabase.co`
2. Verificar que el CSP en `next.config.js` incluya los mismos dominios
3. Verificar que el proyecto ID de Supabase esté correcto en las variables de entorno

---

### ❌ **Error: "File size exceeds"**

**Solución:**
1. Verificar que el límite del bucket sea >= 5MB
2. Verificar que el archivo no exceda 5MB
3. Comprimir la imagen antes de subirla

---

## ✅ CHECKLIST FINAL

- [ ] Bucket `productos` creado en Supabase Dashboard
- [ ] Bucket marcado como **Public**
- [ ] Política RLS de SELECT creada (público)
- [ ] Política RLS de INSERT creada (autenticado)
- [ ] Política RLS de UPDATE creada (autenticado)
- [ ] Política RLS de DELETE creada (autenticado)
- [ ] Variables de entorno configuradas correctamente
- [ ] CSP configurado para permitir Supabase
- [ ] Test de upload exitoso realizado

---

## 📝 NOTAS IMPORTANTES

- **Bucket Name:** Debe ser exactamente `productos` (sin espacios, minúsculas)
- **Public Access:** El bucket debe ser público para que las imágenes sean accesibles sin autenticación
- **RLS Policies:** Son necesarias incluso si el bucket es público, para operaciones de escritura
- **Service Role Key:** Se usa en el servidor para bypass de RLS cuando es necesario

---

## 🔗 REFERENCIAS

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage API](https://supabase.com/docs/reference/javascript/storage)

