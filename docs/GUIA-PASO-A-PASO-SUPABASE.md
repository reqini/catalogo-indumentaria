# 🚀 Guía Paso a Paso - Configuración de Supabase

Esta guía te llevará paso a paso para configurar Supabase en tu proyecto.

---

## 📋 PASO 1: Crear Proyecto en Supabase (5 minutos)

### 1.1. Crear cuenta (si no tienes una)
1. Ve a: **https://supabase.com**
2. Click en **"Start your project"** o **"Sign In"**
3. Puedes usar GitHub, Google, o crear cuenta con email

### 1.2. Crear nuevo proyecto
1. Una vez dentro del dashboard, click en **"New Project"**
2. Completa el formulario:
   - **Name**: `catalogo-indumentaria` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (¡GUÁRDALA!)
   - **Region**: Elige la más cercana (ej: `South America`)
   - **Pricing Plan**: Selecciona **"Free"** (suficiente para empezar)
3. Click en **"Create new project"**
4. ⏳ Espera 2-3 minutos mientras se crea el proyecto

### ✅ Verificación Paso 1:
- [ ] Proyecto creado en Supabase Dashboard
- [ ] Puedes ver el dashboard del proyecto

---

## 📋 PASO 2: Ejecutar Migración SQL (2 minutos)

### 2.1. Abrir SQL Editor
1. En el dashboard de tu proyecto, ve a la barra lateral izquierda
2. Click en **"SQL Editor"** (ícono de terminal/código)
3. Click en **"New query"**

### 2.2. Copiar y ejecutar el esquema
1. Abre el archivo: `supabase/migrations/001_initial_schema.sql`
2. **Copia TODO el contenido** (Cmd+A, Cmd+C)
3. Pega en el SQL Editor de Supabase (Cmd+V)
4. Click en **"Run"** o presiona **Cmd+Enter** (Mac) / **Ctrl+Enter** (Windows)

### 2.3. Verificar que funcionó
Deberías ver un mensaje de éxito como:
```
Success. No rows returned
```

Y en la parte inferior deberías ver las tablas creadas:
- `tenants`
- `planes`
- `productos`
- `banners`
- `categorias`
- `compra_logs`
- `stock_logs`
- `ventas`

### ✅ Verificación Paso 2:
- [ ] SQL ejecutado sin errores
- [ ] Tablas creadas (ver en "Table Editor" en el sidebar)

---

## 📋 PASO 3: Obtener Credenciales y Configurar Variables (3 minutos)

### 3.1. Obtener credenciales de Supabase
1. En el dashboard de tu proyecto, ve a **"Settings"** (ícono de engranaje)
2. Click en **"API"** en el menú lateral
3. Verás 3 valores importantes:

#### a) Project URL
- Busca **"Project URL"**
- Copia el valor (ej: `https://xxxxx.supabase.co`)

#### b) anon/public key
- Busca **"Project API keys"**
- Busca la fila con **"anon"** o **"public"**
- Copia el valor (empieza con `eyJhbGci...`)

#### c) service_role key
- En la misma sección de **"Project API keys"**
- Busca la fila con **"service_role"**
- ⚠️ **IMPORTANTE**: Esta clave es SECRETA, no la compartas
- Copia el valor (empieza con `eyJhbGci...`)

### 3.2. Configurar variables en .env.local

Tienes 2 opciones:

#### Opción A: Script Interactivo (RECOMENDADO)
```bash
pnpm setup-supabase-env
```
El script te pedirá cada valor y lo configurará automáticamente.

#### Opción B: Manual
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Busca estas líneas:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=xxxxx
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   SUPABASE_SERVICE_ROLE_KEY=xxxxx
   ```
3. Reemplaza `xxxxx` con los valores reales que copiaste:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Guarda el archivo

### ✅ Verificación Paso 3:
- [ ] 3 variables configuradas en `.env.local`
- [ ] Valores son URLs/keys reales (no placeholders)

---

## 🧪 PASO 4: Verificar que Todo Funciona (1 minuto)

### 4.1. Verificar configuración
```bash
pnpm verify-supabase
```

Deberías ver:
```
✅ .env.local existe
✅ NEXT_PUBLIC_SUPABASE_URL: https://...
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGci...
✅ SUPABASE_SERVICE_ROLE_KEY: eyJhbGci...
✅ Cliente de Supabase: lib/supabase.ts
✅ Esquema SQL: supabase/migrations/001_initial_schema.sql
✅ Helpers de Supabase: lib/supabase-helpers.ts

✅ TODO CONFIGURADO CORRECTAMENTE
```

### 4.2. Probar conexión
```bash
pnpm test-supabase
```

Deberías ver un mensaje de éxito indicando que la conexión funciona.

### ✅ Verificación Paso 4:
- [ ] `pnpm verify-supabase` muestra todo correcto
- [ ] `pnpm test-supabase` conecta exitosamente

---

## 🎉 ¡Listo!

Ahora tu proyecto está completamente configurado con Supabase. Puedes:

- ✅ Ejecutar `pnpm dev` y la app funcionará con Supabase
- ✅ Crear productos desde el admin
- ✅ Ver productos en el catálogo
- ✅ Todo funcionará automáticamente

---

## 🆘 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que `.env.local` existe
- Verifica que las 3 variables están configuradas
- Ejecuta `pnpm verify-supabase` para diagnosticar

### Error: "Failed to connect to Supabase"
- Verifica que las credenciales son correctas
- Verifica que el proyecto en Supabase está activo
- Verifica que ejecutaste el SQL de migración

### Error: "Table does not exist"
- Verifica que ejecutaste el SQL de migración
- Ve a Supabase Dashboard → Table Editor y verifica que las tablas existen

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de migración completa](./migracion-supabase.md)
- [Configuración de variables](./configurar-variables-entorno.md)

