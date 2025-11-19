import { NextResponse } from 'next/server'
import { getTenantFromRequest } from '@/lib/auth-helpers'

interface ParsedProduct {
  nombre: string
  descripcion?: string
  categoria: string
  precio: number
  stock: number
  sku?: string
}

/**
 * Parser inteligente de texto a productos
 * Soporta múltiples formatos:
 * - Formato estructurado: "Producto | categoría: X | precio: Y | stock: Z"
 * - Formato natural: "Producto, categoría X, precio Y, stock Z"
 */
function parseProductText(text: string): ParsedProduct[] {
  const products: ParsedProduct[] = []
  
  // Normalizar texto: eliminar espacios extra, normalizar separadores
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  for (const line of normalized) {
    try {
      // Intentar parsear línea por línea
      const product = parseLine(line)
      if (product) {
        products.push(product)
      }
    } catch (error) {
      console.warn(`[IA-BULK-PARSE] Error parsing line: "${line}"`, error)
      // Continuar con la siguiente línea aunque esta falle
    }
  }

  return products
}

function parseLine(line: string): ParsedProduct | null {
  // Limpiar línea
  let cleanLine = line.trim()
  
  // Remover prefijos comunes
  cleanLine = cleanLine.replace(/^(Quiero cargar:|Cargar:|Producto:|Item:)\s*/i, '')
  
  // Intentar formato estructurado con separadores |
  if (cleanLine.includes('|')) {
    return parseStructuredFormat(cleanLine)
  }
  
  // Intentar formato con separadores ;
  if (cleanLine.includes(';')) {
    return parseSemicolonFormat(cleanLine)
  }
  
  // Intentar formato natural (texto libre)
  return parseNaturalFormat(cleanLine)
}

function parseStructuredFormat(line: string): ParsedProduct | null {
  const parts = line.split('|').map(p => p.trim())
  
  if (parts.length < 2) {
    return null
  }

  const nombre = parts[0].trim()
  if (!nombre) {
    return null
  }

  let categoria = ''
  let precio = 0
  let stock = 0
  let sku: string | undefined = undefined
  let descripcion: string | undefined = undefined

  // Procesar partes restantes
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].toLowerCase()
    
    // Categoría
    if (part.includes('categoría:') || part.includes('categoria:')) {
      categoria = extractValue(part, /categor[íi]a:\s*(.+)/i)
    }
    // Precio
    else if (part.includes('precio:') || part.includes('price:')) {
      const precioStr = extractValue(part, /precio:\s*(.+)/i) || extractValue(part, /price:\s*(.+)/i)
      precio = parsePrice(precioStr)
    }
    // Stock
    else if (part.includes('stock:') || part.includes('cantidad:')) {
      const stockStr = extractValue(part, /stock:\s*(.+)/i) || extractValue(part, /cantidad:\s*(.+)/i)
      stock = parseInt(stockStr) || 0
    }
    // SKU
    else if (part.includes('sku:')) {
      sku = extractValue(part, /sku:\s*(.+)/i)
    }
    // Descripción
    else if (part.includes('descripción:') || part.includes('descripcion:')) {
      descripcion = extractValue(part, /descripci[óo]n:\s*(.+)/i)
    }
  }

  // Si no se encontró categoría, intentar inferirla del nombre
  if (!categoria) {
    categoria = inferCategory(nombre)
  }

  // Validaciones mínimas
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

function parseSemicolonFormat(line: string): ParsedProduct | null {
  const parts = line.split(';').map(p => p.trim())
  
  if (parts.length < 2) {
    return null
  }

  const nombre = parts[0].trim()
  if (!nombre) {
    return null
  }

  let categoria = ''
  let precio = 0
  let stock = 0

  // Buscar en todas las partes
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

  if (!nombre || !categoria || precio <= 0) {
    return null
  }

  return {
    nombre: normalizeName(nombre),
    categoria: normalizeCategory(categoria),
    precio,
    stock: stock || 0,
  }
}

function parseNaturalFormat(line: string): ParsedProduct | null {
  // Intentar extraer información usando expresiones regulares
  const nombreMatch = line.match(/^([^,]+?)(?:,|\s+categor[íi]a|$)/i)
  const nombre = nombreMatch ? nombreMatch[1].trim() : line.split(',')[0].trim()
  
  if (!nombre) {
    return null
  }

  // Buscar categoría
  let categoria = ''
  const categoriaMatch = line.match(/categor[íi]a\s+([^,]+)/i)
  if (categoriaMatch) {
    categoria = categoriaMatch[1].trim()
  } else {
    categoria = inferCategory(nombre)
  }

  // Buscar precio
  let precio = 0
  const precioMatch = line.match(/(?:precio|price|pesos?)\s*:?\s*(\d+(?:[.,]\d+)?)/i)
  if (precioMatch) {
    precio = parsePrice(precioMatch[1])
  }

  // Buscar stock
  let stock = 0
  const stockMatch = line.match(/(?:stock|cantidad|unidades?)\s*:?\s*(\d+)/i)
  if (stockMatch) {
    stock = parseInt(stockMatch[1]) || 0
  }

  if (!categoria || precio <= 0) {
    return null
  }

  return {
    nombre: normalizeName(nombre),
    categoria: normalizeCategory(categoria),
    precio,
    stock: stock || 0,
  }
}

function extractValue(text: string, regex: RegExp): string {
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0
  
  // Remover símbolos de moneda y espacios
  const cleaned = priceStr
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '') // Remover puntos (separadores de miles)
    .replace(',', '.') // Convertir coma a punto decimal
  
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

function inferCategory(nombre: string): string {
  const lowerNombre = nombre.toLowerCase()
  
  // Diccionario de palabras clave por categoría
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

  // Si no se encuentra, usar "General"
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
  // Normalizar categoría: primera letra mayúscula, resto minúscula
  const normalized = category.trim()
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const tenant = await getTenantFromRequest(request)
    if (!tenant) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'El texto es requerido' },
        { status: 400 }
      )
    }

    console.log('[IA-BULK-PARSE] Procesando texto:', text.substring(0, 200) + '...')

    // Parsear texto
    const products = parseProductText(text)

    console.log('[IA-BULK-PARSE] Productos detectados:', products.length)

    if (products.length === 0) {
      return NextResponse.json(
        { 
          error: 'No se pudieron detectar productos en el texto. Intentá con un formato más estructurado.',
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
    console.error('[IA-BULK-PARSE] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el texto' },
      { status: 500 }
    )
  }
}

