#!/bin/bash

# Script para configurar y subir el proyecto a GitHub

echo "🚀 Configuración de GitHub para CatalogoIndumentaria"
echo ""

# Verificar si ya existe un remote
if git remote | grep -q "origin"; then
    echo "⚠️  Ya existe un remote 'origin'"
    echo "Remote actual:"
    git remote -v
    echo ""
    read -p "¿Deseas cambiarlo? (s/n): " cambiar
    if [ "$cambiar" != "s" ]; then
        echo "❌ Operación cancelada"
        exit 1
    fi
    git remote remove origin
fi

# Solicitar URL del repositorio
echo "📋 Ingresa la URL de tu repositorio de GitHub:"
echo "   Ejemplo HTTPS: https://github.com/USUARIO/catalogo-indumentaria.git"
echo "   Ejemplo SSH: git@github.com:USUARIO/catalogo-indumentaria.git"
read -p "URL: " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ URL no proporcionada. Operación cancelada."
    exit 1
fi

# Agregar remote
echo ""
echo "🔗 Agregando remote..."
git remote add origin "$repo_url"

# Cambiar a branch main
echo "🌿 Configurando branch main..."
git branch -M main

# Mostrar estado
echo ""
echo "✅ Configuración completada!"
echo ""
echo "📤 Para subir el código, ejecuta:"
echo "   git push -u origin main"
echo ""
read -p "¿Deseas subir el código ahora? (s/n): " subir

if [ "$subir" == "s" ]; then
    echo ""
    echo "⬆️  Subiendo código a GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ ¡Código subido exitosamente a GitHub!"
        echo ""
        echo "🔗 Tu repositorio está disponible en:"
        echo "   ${repo_url%.git}"
    else
        echo ""
        echo "❌ Error al subir el código. Verifica:"
        echo "   1. Que el repositorio exista en GitHub"
        echo "   2. Que tengas permisos de escritura"
        echo "   3. Que tu autenticación esté configurada"
    fi
else
    echo ""
    echo "💡 Para subir más tarde, ejecuta:"
    echo "   git push -u origin main"
fi

