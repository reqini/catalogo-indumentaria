# 📍 Dónde Encontrar la Project URL en Supabase

## Método 1: Desde la Página de API Keys (Donde estás ahora)

1. **En la misma página donde ves las API Keys:**
   - Busca en la parte superior de la página
   - Puede estar en un banner o sección llamada "Project URL" o "Project Reference"
   - O busca un campo que diga "Project URL" o "API URL"

2. **O busca en la parte superior derecha:**
   - A veces aparece cerca del nombre del proyecto
   - Puede estar en un tooltip o dropdown

## Método 2: Desde Settings → General

1. En el sidebar izquierdo, haz click en **"General"** (debajo de PROJECT SETTINGS)
2. Busca una sección llamada **"Reference ID"** o **"Project URL"**
3. Deberías ver algo como: `https://xxxxx.supabase.co`

## Método 3: Desde la URL del Dashboard

1. Mira la URL de tu navegador cuando estás en el dashboard
2. Debería ser algo como: `https://supabase.com/dashboard/project/xxxxx`
3. El `xxxxx` es parte de tu Project Reference
4. La Project URL completa sería: `https://xxxxx.supabase.co`

## Método 4: Desde la Página Principal del Proyecto

1. Ve a la página principal del proyecto (click en el nombre del proyecto arriba)
2. Busca información del proyecto
3. Debería mostrar la Project URL o Project Reference

## Formato Esperado

La Project URL debería verse así:
```
https://xxxxx.supabase.co
```

O también puede ser:
```
https://xxxxx.supabase.io
```

Donde `xxxxx` es un identificador único de tu proyecto.

## ⚠️ Si No La Encuentras

Si no encuentras la Project URL, puedes usar el Project Reference ID:

1. Ve a **Settings → General**
2. Busca **"Reference ID"** o **"Project ID"**
3. Es un string corto (ejemplo: `abcdefghijklmnop`)
4. La URL sería: `https://abcdefghijklmnop.supabase.co`

---

## 🚀 Una Vez Que Tengas la URL

Ejecuta:
```bash
pnpm config-credenciales
```

Y pega la URL cuando te la pida.

