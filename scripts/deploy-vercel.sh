#!/bin/bash

# Script para desplegar en Vercel

echo "🚀 Preparando despliegue en Vercel"
echo ""

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI no está instalado"
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Verificar que estamos en un repositorio git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ No estás en un repositorio Git"
    echo "💡 Ejecuta primero: git init"
    exit 1
fi

# Verificar build local
echo "🔨 Verificando build local..."
if pnpm build; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en el build. Revisa los errores antes de desplegar."
    exit 1
fi

echo ""
echo "📋 Variables de entorno requeridas:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - NEXT_PUBLIC_BASE_URL (opcional, Vercel la proporciona)"
echo ""
echo "📋 Variables opcionales:"
echo "   - MP_ACCESS_TOKEN"
echo "   - MP_WEBHOOK_SECRET"
echo "   - CLOUDINARY_*"
echo "   - SMTP_*"
echo ""

read -p "¿Deseas continuar con el despliegue? (s/n): " continuar

if [ "$continuar" != "s" ]; then
    echo "❌ Despliegue cancelado"
    exit 0
fi

echo ""
echo "🔐 Iniciando sesión en Vercel..."
vercel login

echo ""
echo "⬆️  Desplegando a Vercel..."
vercel

echo ""
read -p "¿Deseas desplegar a producción? (s/n): " prod

if [ "$prod" == "s" ]; then
    echo "🚀 Desplegando a producción..."
    vercel --prod
    echo ""
    echo "✅ Despliegue completado!"
    echo ""
    echo "📝 IMPORTANTE: Configura las variables de entorno en Vercel Dashboard:"
    echo "   1. Ve a tu proyecto en vercel.com"
    echo "   2. Settings → Environment Variables"
    echo "   3. Agrega todas las variables necesarias"
    echo ""
    echo "📚 Ver documentación completa en: docs/vercel-deployment.md"
else
    echo "✅ Preview deployment completado"
    echo "💡 Para desplegar a producción más tarde: vercel --prod"
fi

