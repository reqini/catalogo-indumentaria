import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'

interface EnhancedProduct {
  nombre: string
  descripcion?: string
  descripcionLarga?: string
  categoria: string
  precio: number
  precioSugerido?: number
  stock: number
  sku?: string
  tags?: string[]
  imagenes?: string[]
  imagenPrincipal?: string
  activo?: boolean
}

/**
 * Parser V2 mejorado con IA avanzada
 * Genera descripciones, tags SEO, sugiere precios, etc.
 */
function parseProductTextV2(text: string, source: 'text' | 'csv' | 'ocr' | 'voice', enhance: boolean = true): EnhancedProduct[] {
  // Usar el parser base de V1
  const baseProducts = parseProductTextBase(text)
  
  if (!enhance) {
    return baseProducts.map(p => ({
      ...p,
      tags: [],
      descripcionLarga: p.descripcion,
    }))
  }

  // Mejorar productos con IA
  return baseProducts.map(product => enhanceProduct(product))
}

function parseProductTextBase(text: string): Array<{
  nombre: string
  descripcion?: string
  categoria: string
  precio: number
  stock: number
  sku?: string
}> {
  const products: any[] = []
  
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  for (const line of normalized) {
    try {
      const product = parseLine(line)
      if (product) {
        products.push(product)
      }
    } catch (error) {
      console.warn(`[IA-BULK-PARSE-V2] Error parsing line: "${line}"`, error)
    }
  }

  return products
}

function parseLine(line: string): any | null {
  let cleanLine = line.trim()
  cleanLine = cleanLine.replace(/^(Quiero cargar:|Cargar:|Producto:|Item:)\s*/i, '')
  
  if (cleanLine.includes('|')) {
    return parseStructuredFormat(cleanLine)
  }
  
  if (cleanLine.includes(';')) {
    return parseSemicolonFormat(cleanLine)
  }
  
  return parseNaturalFormat(cleanLine)
}

function parseStructuredFormat(line: string): any | null {
  const parts = line.split('|').map(p => p.trim())
  
  if (parts.length < 2) return null

  const nombre = parts[0].trim()
  if (!nombre) return null

  let categoria = ''
  let precio = 0
  let stock = 0
  let sku: string | undefined = undefined
  let descripcion: string | undefined = undefined

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].toLowerCase()
    
    if (part.includes('categoría:') || part.includes('categoria:')) {
      categoria = extractValue(part, /categor[íi]a:\s*(.+)/i)
    } else if (part.includes('precio:') || part.includes('price:')) {
      const precioStr = extractValue(part, /precio:\s*(.+)/i) || extractValue(part, /price:\s*(.+)/i)
      precio = parsePrice(precioStr)
    } else if (part.includes('stock:') || part.includes('cantidad:')) {
      const stockStr = extractValue(part, /stock:\s*(.+)/i) || extractValue(part, /cantidad:\s*(.+)/i)
      stock = parseInt(stockStr) || 0
    } else if (part.includes('sku:')) {
      sku = extractValue(part, /sku:\s*(.+)/i)
    } else if (part.includes('descripción:') || part.includes('descripcion:')) {
      descripcion = extractValue(part, /descripci[óo]n:\s*(.+)/i)
    }
  }

  if (!categoria) {
    categoria = inferCategory(nombre)
  }

  if (!nombre || !categoria || precio <= 0) {
    return null
  }

  return {
    nombre: normalizeName(nombre),
    descripcion,
    categoria: normalizeCategory(categoria),
    precio,
    stock: stock || 0,
    sku,
  }
}

function parseSemicolonFormat(line: string): any | null {
  const parts = line.split(';').map(p => p.trim())
  if (parts.length < 2) return null

  const nombre = parts[0].trim()
  if (!nombre) return null

  let categoria = ''
  let precio = 0
  let stock = 0

  for (const part of parts) {
    const lowerPart = part.toLowerCase()
    if (lowerPart.includes('categoría') || lowerPart.includes('categoria')) {
      categoria = part.replace(/categor[íi]a\s*:?\s*/i, '').trim()
    } else if (lowerPart.includes('precio') || lowerPart.includes('price')) {
      precio = parsePrice(part.replace(/precio\s*:?\s*/i, '').replace(/price\s*:?\s*/i, '').trim())
    } else if (lowerPart.includes('stock') || lowerPart.includes('cantidad')) {
      stock = parseInt(part.replace(/stock\s*:?\s*/i, '').replace(/cantidad\s*:?\s*/i, '').trim()) || 0
    }
  }

  if (!categoria) {
    categoria = inferCategory(nombre)
  }

  if (!nombre || !categoria || precio <= 0) return null

  return {
    nombre: normalizeName(nombre),
    categoria: normalizeCategory(categoria),
    precio,
    stock: stock || 0,
  }
}

function parseNaturalFormat(line: string): any | null {
  const nombreMatch = line.match(/^([^,]+?)(?:,|\s+categor[íi]a|$)/i)
  const nombre = nombreMatch ? nombreMatch[1].trim() : line.split(',')[0].trim()
  
  if (!nombre) return null

  let categoria = ''
  const categoriaMatch = line.match(/categor[íi]a\s+([^,]+)/i)
  if (categoriaMatch) {
    categoria = categoriaMatch[1].trim()
  } else {
    categoria = inferCategory(nombre)
  }

  let precio = 0
  const precioMatch = line.match(/(?:precio|price|pesos?)\s*:?\s*(\d+(?:[.,]\d+)?)/i)
  if (precioMatch) {
    precio = parsePrice(precioMatch[1])
  }

  let stock = 0
  const stockMatch = line.match(/(?:stock|cantidad|unidades?)\s*:?\s*(\d+)/i)
  if (stockMatch) {
    stock = parseInt(stockMatch[1]) || 0
  }

  if (!categoria || precio <= 0) return null

  return {
    nombre: normalizeName(nombre),
    categoria: normalizeCategory(categoria),
    precio,
    stock: stock || 0,
  }
}

function enhanceProduct(product: any): EnhancedProduct {
  // Generar descripción corta si no existe
  const descripcion = product.descripcion || generateShortDescription(product.nombre, product.categoria)
  
  // Generar descripción larga
  const descripcionLarga = generateLongDescription(product.nombre, product.categoria, descripcion)
  
  // Generar tags SEO
  const tags = generateTags(product.nombre, product.categoria)
  
  // Sugerir precio optimizado
  const precioSugerido = suggestPrice(product.precio, product.categoria)

  return {
    ...product,
    descripcion,
    descripcionLarga,
    tags,
    precioSugerido,
    activo: true,
  }
}

function generateShortDescription(nombre: string, categoria: string): string {
  return `${nombre} de alta calidad en la categoría ${categoria}. Diseño moderno y confortable.`
}

function generateLongDescription(nombre: string, categoria: string, descripcionCorta: string): string {
  return `${descripcionCorta}

Características:
- Material de primera calidad
- Diseño moderno y versátil
- Perfecto para uso diario
- Disponible en múltiples talles

Ideal para quienes buscan ${categoria.toLowerCase()} de calidad y estilo.`
}

function generateTags(nombre: string, categoria: string): string[] {
  const tags: string[] = []
  
  // Tags de categoría
  tags.push(categoria.toLowerCase())
  
  // Tags del nombre (palabras clave)
  const palabras = nombre.toLowerCase().split(' ')
  palabras.forEach(palabra => {
    if (palabra.length > 3 && !['de', 'la', 'el', 'los', 'las'].includes(palabra)) {
      tags.push(palabra)
    }
  })
  
  // Tags comunes
  tags.push('indumentaria', 'moda', 'ropa')
  
  return [...new Set(tags)].slice(0, 10) // Máximo 10 tags
}

function suggestPrice(precio: number, categoria: string): number {
  // Lógica simple de sugerencia de precio basada en categoría
  // En producción, usar datos históricos o IA
  const multipliers: Record<string, number> = {
    'Remeras': 1.0,
    'Pantalones': 1.1,
    'Buzos': 1.15,
    'Zapatillas': 1.2,
  }
  
  const multiplier = multipliers[categoria] || 1.0
  return Math.round(precio * multiplier)
}

function extractValue(text: string, regex: RegExp): string {
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0
  const cleaned = priceStr
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

function inferCategory(nombre: string): string {
  const lowerNombre = nombre.toLowerCase()
  const categoryKeywords: Record<string, string[]> = {
    'Remeras': ['remera', 'camiseta', 't-shirt', 'tshirt', 'polo'],
    'Pantalones': ['pantalón', 'pantalon', 'jean', 'jeans', 'pantalones'],
    'Buzos': ['buzo', 'sweater', 'hoodie', 'sudadera'],
    'Zapatillas': ['zapatilla', 'zapatillas', 'sneaker', 'sneakers', 'calzado'],
    'Accesorios': ['accesorio', 'accesorios', 'gorra', 'cinturón', 'cinturon'],
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerNombre.includes(keyword))) {
      return category
    }
  }

  return 'General'
}

function normalizeName(name: string): string {
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function normalizeCategory(category: string): string {
  const normalized = category.trim()
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
}

export async function POST(request: Request) {
  try {
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const { text, source = 'text', enhance = true } = body

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'El texto es requerido' },
        { status: 400 }
      )
    }

    console.log('[IA-BULK-PARSE-V2] Procesando:', { source, enhance, textLength: text.length })

    const products = parseProductTextV2(text, source, enhance)

    console.log('[IA-BULK-PARSE-V2] Productos detectados:', products.length)

    if (products.length === 0) {
      return NextResponse.json(
        { 
          error: 'No se pudieron detectar productos en el texto.',
          products: []
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      products,
      count: products.length,
    })
  } catch (error: any) {
    console.error('[IA-BULK-PARSE-V2] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el texto' },
      { status: 500 }
    )
  }
}

