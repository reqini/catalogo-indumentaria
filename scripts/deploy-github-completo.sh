#!/bin/bash

# Script autónomo completo para subir a GitHub

set -e

echo "🚀 DESPLIEGUE AUTÓNOMO A GITHUB"
echo "================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

REPO_NAME="catalogo-indumentaria"
GITHUB_USER="reqini"  # Basado en email reqini@gmail.com

# Función para verificar si GitHub CLI está autenticado
check_gh_auth() {
    if gh auth status &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Función para autenticar GitHub CLI
authenticate_gh() {
    echo -e "${YELLOW}🔐 Autenticando con GitHub CLI...${NC}"
    echo ""
    echo "Se abrirá tu navegador para autenticarte."
    echo "Sigue las instrucciones en pantalla."
    echo ""
    
    gh auth login --web --hostname github.com
    
    if check_gh_auth; then
        echo -e "${GREEN}✅ Autenticación exitosa${NC}"
        return 0
    else
        echo -e "${RED}❌ Error en autenticación${NC}"
        return 1
    fi
}

# Función para crear repositorio y hacer push
create_and_push() {
    echo ""
    echo -e "${YELLOW}📦 Creando repositorio en GitHub...${NC}"
    
    # Verificar si el repo ya existe
    if gh repo view "$GITHUB_USER/$REPO_NAME" &>/dev/null; then
        echo -e "${YELLOW}⚠️  El repositorio ya existe${NC}"
        echo "Actualizando remote y haciendo push..."
        git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || \
        git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
    else
        echo "Creando nuevo repositorio..."
        gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
        echo -e "${GREEN}✅ Repositorio creado y código subido${NC}"
        return 0
    fi
    
    echo ""
    echo -e "${YELLOW}⬆️  Subiendo código...${NC}"
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Código subido exitosamente${NC}"
        return 0
    else
        echo -e "${RED}❌ Error al subir código${NC}"
        return 1
    fi
}

# Verificar si estamos en un repo git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ No estás en un repositorio Git${NC}"
    exit 1
fi

# Verificar si hay cambios sin commitear
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Hay cambios sin commitear${NC}"
    read -p "¿Deseas commitearlos ahora? (s/n): " commit_changes
    if [ "$commit_changes" == "s" ]; then
        git add .
        git commit -m "Auto-commit antes de push"
    fi
fi

# Verificar autenticación de GitHub CLI
if ! check_gh_auth; then
    echo -e "${YELLOW}GitHub CLI no está autenticado${NC}"
    echo ""
    read -p "¿Deseas autenticarte ahora? (s/n): " auth_choice
    
    if [ "$auth_choice" == "s" ]; then
        if ! authenticate_gh; then
            echo -e "${RED}❌ No se pudo autenticar. Saliendo.${NC}"
            exit 1
        fi
    else
        echo ""
        echo -e "${YELLOW}📝 Para continuar manualmente:${NC}"
        echo "   1. Ejecuta: gh auth login"
        echo "   2. Luego ejecuta este script nuevamente"
        exit 0
    fi
fi

# Crear repo y hacer push
if create_and_push; then
    echo ""
    echo -e "${GREEN}🎉 ¡ÉXITO!${NC}"
    echo ""
    echo "Tu repositorio está disponible en:"
    echo "https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Error en el proceso${NC}"
    echo ""
    echo "Verifica:"
    echo "  1. Que tengas permisos para crear repositorios"
    echo "  2. Que el nombre del repositorio no esté en uso"
    echo "  3. Que tu conexión a internet funcione"
    exit 1
fi

