/**
 * Bulk Import V2 Parser - Parser mejorado con IA avanzada
 * Versión 2.0 - Reconstrucción completa
 */

export interface ParsedProduct {
  nombre: string
  descripcion?: string
  descripcionLarga?: string
  categoria: string
  precio: number
  precioOriginal?: string // Precio original antes de normalizar
  stock: number
  stockPorTalle?: Record<string, number>
  talles?: string[]
  colores?: string[]
  sku?: string
  tags?: string[]
  imagenes?: string[]
  imagenPrincipal?: string
  activo?: boolean
  calidad?: number
  errores?: string[]
  advertencias?: string[]
  metadata?: {
    fila?: number
    fuente?: string
    confianza?: number
  }
}

export interface ParseResult {
  products: ParsedProduct[]
  errors: Array<{ fila: number; mensaje: string; datos?: any }>
  warnings: Array<{ fila: number; mensaje: string }>
  metadata: {
    totalLineas: number
    productosDetectados: number
    tiempoProcesamiento: number
    formatoDetectado: 'pipe' | 'semicolon' | 'csv' | 'json' | 'natural' | 'unknown'
  }
}

/**
 * Parser principal V2 mejorado
 */
export function parseBulkProductsV2(
  input: string,
  source: 'text' | 'csv' | 'xlsx' | 'json' | 'ocr' | 'voice' = 'text',
  options: {
    enhance?: boolean
    detectTalles?: boolean
    detectColores?: boolean
    autoFix?: boolean
  } = {}
): ParseResult {
  const startTime = Date.now()
  const { enhance = true, detectTalles = true, detectColores = true, autoFix = true } = options

  const errors: ParseResult['errors'] = []
  const warnings: ParseResult['warnings'] = []
  const products: ParsedProduct[] = []

  try {
    // Detectar formato
    const formato = detectFormat(input, source)

    // Normalizar input según formato
    const lineas = normalizeInput(input, formato)

    // Procesar cada línea
    lineas.forEach((linea, index) => {
      try {
        const producto = parseLineV2(linea, formato, {
          detectTalles,
          detectColores,
          autoFix,
          fila: index + 1,
        })

        if (producto) {
          // Validar producto
          const validacion = validateProductV2(producto)

          if (validacion.esValido) {
            // Mejorar con IA si está habilitado
            const productoMejorado = enhance ? enhanceProductV2(producto) : producto

            // Calcular calidad
            productoMejorado.calidad = calculateQualityScore(productoMejorado)
            productoMejorado.errores = validacion.errores
            productoMejorado.advertencias = validacion.advertencias

            products.push(productoMejorado)
          } else {
            errors.push({
              fila: index + 1,
              mensaje: `Producto inválido: ${validacion.errores.join(', ')}`,
              datos: producto,
            })
          }
        } else {
          warnings.push({
            fila: index + 1,
            mensaje: 'No se pudo parsear la línea',
          })
        }
      } catch (error: any) {
        errors.push({
          fila: index + 1,
          mensaje: `Error al procesar: ${error.message}`,
        })
      }
    })

    const tiempoProcesamiento = Date.now() - startTime

    return {
      products,
      errors,
      warnings,
      metadata: {
        totalLineas: lineas.length,
        productosDetectados: products.length,
        tiempoProcesamiento,
        formatoDetectado: formato,
      },
    }
  } catch (error: any) {
    return {
      products: [],
      errors: [
        {
          fila: 0,
          mensaje: `Error general: ${error.message}`,
        },
      ],
      warnings: [],
      metadata: {
        totalLineas: 0,
        productosDetectados: 0,
        tiempoProcesamiento: Date.now() - startTime,
        formatoDetectado: 'unknown',
      },
    }
  }
}

/**
 * Detecta el formato del input
 */
function detectFormat(input: string, source: string): ParseResult['metadata']['formatoDetectado'] {
  if (source === 'json') return 'json'
  if (source === 'csv') return 'csv'

  // Detectar por contenido
  if (input.includes('|')) return 'pipe'
  if (input.includes(';')) return 'semicolon'
  if (input.trim().startsWith('[') || input.trim().startsWith('{')) return 'json'

  return 'natural'
}

/**
 * Normaliza el input según formato
 */
function normalizeInput(
  input: string,
  formato: ParseResult['metadata']['formatoDetectado']
): string[] {
  if (formato === 'json') {
    try {
      const json = JSON.parse(input)
      if (Array.isArray(json)) {
        return json.map((item) => JSON.stringify(item))
      }
      return [JSON.stringify(json)]
    } catch {
      return []
    }
  }

  if (formato === 'csv') {
    return parseCSV(input)
  }

  // Formato de líneas
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
}

/**
 * Parsea CSV básico
 */
function parseCSV(csv: string): string[] {
  const lines: string[] = []
  const rows = csv.split('\n')

  // Detectar header
  const header = rows[0]?.split(',').map((h) => h.trim()) || []

  // Procesar filas
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split(',').map((cell) => cell.trim())
    if (row.length === header.length) {
      // Convertir a formato pipe
      const parts: string[] = []
      header.forEach((h, idx) => {
        if (row[idx]) {
          parts.push(`${h}: ${row[idx]}`)
        }
      })
      if (parts.length > 0) {
        lines.push(parts.join(' | '))
      }
    }
  }

  return lines
}

/**
 * Parsea una línea V2 mejorado
 */
function parseLineV2(
  linea: string,
  formato: ParseResult['metadata']['formatoDetectado'],
  options: {
    detectTalles: boolean
    detectColores: boolean
    autoFix: boolean
    fila: number
  }
): ParsedProduct | null {
  let cleanLine = linea.trim()

  // Limpiar prefijos comunes
  cleanLine = cleanLine.replace(/^(Quiero cargar:|Cargar:|Producto:|Item:|#)\s*/i, '')

  if (formato === 'pipe' || cleanLine.includes('|')) {
    return parsePipeFormat(cleanLine, options)
  }

  if (formato === 'semicolon' || cleanLine.includes(';')) {
    return parseSemicolonFormat(cleanLine, options)
  }

  if (formato === 'json') {
    return parseJSONFormat(cleanLine, options)
  }

  return parseNaturalFormat(cleanLine, options)
}

/**
 * Parsea formato pipe (|)
 */
function parsePipeFormat(
  linea: string,
  options: { detectTalles: boolean; detectColores: boolean; autoFix: boolean; fila: number }
): ParsedProduct | null {
  const parts = linea.split('|').map((p) => p.trim())

  if (parts.length < 2) return null

  const nombre = normalizeName(parts[0].trim())
  if (!nombre) return null

  let categoria = ''
  let precio = 0
  let precioOriginal = ''
  let stock = 0
  let stockPorTalle: Record<string, number> = {}
  let talles: string[] = []
  let colores: string[] = []
  let sku: string | undefined = undefined
  let descripcion: string | undefined = undefined
  let imagenes: string[] = []

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].toLowerCase()

    // Categoría
    if (part.includes('categoría:') || part.includes('categoria:')) {
      categoria = extractValue(parts[i], /categor[íi]a:\s*(.+)/i)
    }

    // Precio
    else if (part.includes('precio:') || part.includes('price:')) {
      const precioStr =
        extractValue(parts[i], /precio:\s*(.+)/i) || extractValue(parts[i], /price:\s*(.+)/i)
      precioOriginal = precioStr
      precio = parsePriceV2(precioStr, options.autoFix)
    }

    // Stock
    else if (part.includes('stock:') || part.includes('cantidad:')) {
      const stockStr =
        extractValue(parts[i], /stock:\s*(.+)/i) || extractValue(parts[i], /cantidad:\s*(.+)/i)
      stock = parseInt(stockStr) || 0
    }

    // Talles
    else if (options.detectTalles && (part.includes('talle:') || part.includes('talles:'))) {
      const tallesStr = extractValue(parts[i], /talle[s]?:\s*(.+)/i)
      talles = parseTalles(tallesStr)
      if (talles.length > 0 && stock > 0) {
        // Distribuir stock entre talles
        const stockPorTalleCalculado = distributeStock(talles, stock)
        stockPorTalle = stockPorTalleCalculado
      }
    }

    // Colores
    else if (options.detectColores && (part.includes('color:') || part.includes('colores:'))) {
      const coloresStr = extractValue(parts[i], /color[es]?:\s*(.+)/i)
      colores = parseColores(coloresStr)
    }

    // SKU
    else if (part.includes('sku:')) {
      sku = extractValue(parts[i], /sku:\s*(.+)/i)
    }

    // Descripción
    else if (part.includes('descripción:') || part.includes('descripcion:')) {
      descripcion = extractValue(parts[i], /descripci[óo]n:\s*(.+)/i)
    }

    // Imágenes
    else if (part.includes('imagen:') || part.includes('imagenes:') || part.includes('imágenes:')) {
      const imagenesStr = extractValue(parts[i], /im[áa]gen[es]?:\s*(.+)/i)
      imagenes = parseImagenes(imagenesStr)
    }
  }

  // Inferir categoría si no existe
  if (!categoria) {
    categoria = inferCategoryV2(nombre)
  }

  // Detectar talles en nombre si no se especificaron
  if (options.detectTalles && talles.length === 0) {
    const tallesEnNombre = detectTallesInText(nombre + ' ' + (descripcion || ''))
    if (tallesEnNombre.length > 0) {
      talles = tallesEnNombre
      if (stock > 0) {
        stockPorTalle = distributeStock(talles, stock)
      }
    }
  }

  // Detectar colores en nombre si no se especificaron
  if (options.detectColores && colores.length === 0) {
    const coloresEnNombre = detectColoresInText(nombre)
    if (coloresEnNombre.length > 0) {
      colores = coloresEnNombre
    }
  }

  // Validaciones básicas
  if (!nombre || !categoria || precio <= 0) {
    return null
  }

  // Si hay talles pero no stock por talle, asignar stock total al primer talle
  if (talles.length > 0 && Object.keys(stockPorTalle).length === 0 && stock > 0) {
    stockPorTalle[talles[0]] = stock
  }

  return {
    nombre,
    descripcion,
    categoria: normalizeCategory(categoria),
    precio,
    precioOriginal,
    stock,
    stockPorTalle: Object.keys(stockPorTalle).length > 0 ? stockPorTalle : undefined,
    talles: talles.length > 0 ? talles : undefined,
    colores: colores.length > 0 ? colores : undefined,
    sku,
    imagenes: imagenes.length > 0 ? imagenes : undefined,
    imagenPrincipal: imagenes[0],
    activo: true,
    metadata: {
      fila: options.fila,
      fuente: 'pipe',
    },
  }
}

/**
 * Parsea formato semicolon (;)
 */
function parseSemicolonFormat(
  linea: string,
  options: { detectTalles: boolean; detectColores: boolean; autoFix: boolean; fila: number }
): ParsedProduct | null {
  const parts = linea.split(';').map((p) => p.trim())
  if (parts.length < 2) return null

  const nombre = normalizeName(parts[0].trim())
  if (!nombre) return null

  // Similar a pipe pero con separador diferente
  return parsePipeFormat(parts.join(' | '), options)
}

/**
 * Parsea formato JSON
 */
function parseJSONFormat(
  linea: string,
  options: { detectTalles: boolean; detectColores: boolean; autoFix: boolean; fila: number }
): ParsedProduct | null {
  try {
    const data = JSON.parse(linea)

    return {
      nombre: normalizeName(data.nombre || data.name || ''),
      descripcion: data.descripcion || data.description || data.desc,
      categoria: normalizeCategory(data.categoria || data.category || data.cat || ''),
      precio: parsePriceV2(data.precio || data.price || '0', options.autoFix),
      precioOriginal: String(data.precio || data.price || ''),
      stock: parseInt(data.stock || data.quantity || data.cantidad || '0') || 0,
      talles: options.detectTalles ? data.talles || data.sizes || [] : undefined,
      colores: options.detectColores ? data.colores || data.colors || [] : undefined,
      sku: data.sku || data.code,
      imagenes: data.imagenes || data.images || [],
      imagenPrincipal: data.imagenPrincipal || data.mainImage || data.imagenes?.[0],
      activo: data.activo !== false,
      metadata: {
        fila: options.fila,
        fuente: 'json',
      },
    }
  } catch {
    return null
  }
}

/**
 * Parsea formato natural (texto libre)
 */
function parseNaturalFormat(
  linea: string,
  options: { detectTalles: boolean; detectColores: boolean; autoFix: boolean; fila: number }
): ParsedProduct | null {
  const nombreMatch = linea.match(/^([^,]+?)(?:,|\s+categor[íi]a|$)/i)
  const nombre = nombreMatch
    ? normalizeName(nombreMatch[1].trim())
    : normalizeName(linea.split(',')[0].trim())

  if (!nombre) return null

  let categoria = ''
  const categoriaMatch = linea.match(/categor[íi]a\s+([^,]+)/i)
  if (categoriaMatch) {
    categoria = categoriaMatch[1].trim()
  } else {
    categoria = inferCategoryV2(nombre)
  }

  let precio = 0
  const precioMatch = linea.match(/(?:precio|price|pesos?|ars|$)\s*:?\s*(\d+(?:[.,]\d+)?)/i)
  if (precioMatch) {
    precio = parsePriceV2(precioMatch[1], options.autoFix)
  }

  let stock = 0
  const stockMatch = linea.match(/(?:stock|cantidad|unidades?)\s*:?\s*(\d+)/i)
  if (stockMatch) {
    stock = parseInt(stockMatch[1]) || 0
  }

  // Detectar talles y colores en texto natural
  let talles: string[] = []
  let colores: string[] = []

  if (options.detectTalles) {
    talles = detectTallesInText(linea)
  }

  if (options.detectColores) {
    colores = detectColoresInText(linea)
  }

  if (!categoria || precio <= 0) return null

  return {
    nombre,
    categoria: normalizeCategory(categoria),
    precio,
    stock,
    talles: talles.length > 0 ? talles : undefined,
    colores: colores.length > 0 ? colores : undefined,
    activo: true,
    metadata: {
      fila: options.fila,
      fuente: 'natural',
    },
  }
}

/**
 * Parsea precio mejorado con auto-fix
 */
function parsePriceV2(priceStr: string, autoFix: boolean): number {
  if (!priceStr) return 0

  let cleaned = priceStr.trim()

  // Auto-fix: remover símbolos comunes
  if (autoFix) {
    cleaned = cleaned
      .replace(/[^\d.,]/g, '') // Remover todo excepto números, punto y coma
      .replace(/\.(?=\d{3})/g, '') // Remover puntos de miles (1.000 → 1000)
      .replace(',', '.') // Convertir coma a punto decimal
  } else {
    cleaned = cleaned.replace(/[^\d.,]/g, '')
  }

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Detecta talles en texto
 */
function detectTallesInText(text: string): string[] {
  const talles: string[] = []
  const lowerText = text.toLowerCase()

  // Patrones comunes
  const patrones = [
    /talle[s]?[:\s]+([SMLXLXXL]+)/i,
    /talle[s]?[:\s]+(\d{1,2})/i,
    /\b([SMLXLXXL]{1,4})\b/g,
    /(\d{1,2})\s*\/\s*(\d{1,2})/g, // 36/38/40
  ]

  patrones.forEach((patron) => {
    const matches = text.matchAll(patron)
    for (const match of matches) {
      if (match[1]) {
        // Si es formato S/M/L
        if (/^[SMLXLXXL]+$/i.test(match[1])) {
          talles.push(...match[1].split('/').map((t) => t.trim().toUpperCase()))
        }
        // Si es formato numérico (36/38/40)
        else if (match[2]) {
          talles.push(match[1], match[2])
        } else {
          talles.push(match[1])
        }
      }
    }
  })

  // Normalizar talles comunes
  const tallesNormalizados = talles
    .map((t) => {
      const num = parseInt(t)
      if (!isNaN(num)) {
        // Convertir numérico a letra si es posible
        if (num >= 36 && num <= 46) {
          const map: Record<number, string> = {
            36: 'S',
            38: 'M',
            40: 'L',
            42: 'XL',
            44: 'XXL',
          }
          return map[num] || t
        }
        return t
      }
      return t.toUpperCase()
    })
    .filter((t, i, arr) => arr.indexOf(t) === i) // Únicos

  return tallesNormalizados.slice(0, 10) // Máximo 10 talles
}

/**
 * Detecta colores en texto
 */
function detectColoresInText(text: string): string[] {
  const colores: string[] = []
  const lowerText = text.toLowerCase()

  const coloresComunes = [
    'negro',
    'blanco',
    'gris',
    'rojo',
    'azul',
    'verde',
    'amarillo',
    'rosa',
    'beige',
    'marron',
    'marrón',
    'naranja',
    'violeta',
    'celeste',
    'turquesa',
    'coral',
    'salmon',
    'salmón',
    'dorado',
    'plateado',
  ]

  coloresComunes.forEach((color) => {
    if (lowerText.includes(color)) {
      colores.push(color.charAt(0).toUpperCase() + color.slice(1))
    }
  })

  // También buscar patrones como "color: X"
  const colorMatch = text.match(/color[es]?[:\s]+([^|,;]+)/i)
  if (colorMatch) {
    const colorStr = colorMatch[1].trim()
    if (colorStr && !colores.includes(colorStr)) {
      colores.push(colorStr)
    }
  }

  return colores.filter((c, i, arr) => arr.indexOf(c) === i) // Únicos
}

/**
 * Parsea string de talles
 */
function parseTalles(tallesStr: string): string[] {
  if (!tallesStr) return []

  return tallesStr
    .split(/[,\/]/)
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0)
}

/**
 * Parsea string de colores
 */
function parseColores(coloresStr: string): string[] {
  if (!coloresStr) return []

  return coloresStr
    .split(/[,\/]/)
    .map((c) => c.trim())
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())
    .filter((c) => c.length > 0)
}

/**
 * Parsea string de imágenes (URLs)
 */
function parseImagenes(imagenesStr: string): string[] {
  if (!imagenesStr) return []

  return imagenesStr
    .split(/[,\s]+/)
    .map((img) => img.trim())
    .filter((img) => {
      // Validar que sea URL válida
      try {
        new URL(img)
        return true
      } catch {
        return img.startsWith('/') || img.startsWith('./')
      }
    })
}

/**
 * Distribuye stock entre talles
 */
function distributeStock(talles: string[], stockTotal: number): Record<string, number> {
  const stockPorTalle: Record<string, number> = {}
  const stockPorTalleCalculado = Math.floor(stockTotal / talles.length)
  const resto = stockTotal % talles.length

  talles.forEach((talle, index) => {
    stockPorTalle[talle] = stockPorTalleCalculado + (index < resto ? 1 : 0)
  })

  return stockPorTalle
}

/**
 * Extrae valor de un string usando regex
 */
function extractValue(text: string, regex: RegExp): string {
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

/**
 * Infiere categoría mejorada
 */
function inferCategoryV2(nombre: string): string {
  const lowerNombre = nombre.toLowerCase()

  const categoryKeywords: Record<string, string[]> = {
    Remeras: ['remera', 'camiseta', 't-shirt', 'tshirt', 'polo', 'musculosa'],
    Pantalones: ['pantalón', 'pantalon', 'jean', 'jeans', 'pantalones', 'bermuda', 'short'],
    Buzos: ['buzo', 'sweater', 'hoodie', 'sudadera', 'canguro'],
    Zapatillas: ['zapatilla', 'zapatillas', 'sneaker', 'sneakers', 'calzado', 'zapato'],
    Accesorios: ['accesorio', 'accesorios', 'gorra', 'cinturón', 'cinturon', 'mochila', 'bolso'],
    Camperas: ['campera', 'camperas', 'jacket', 'chaqueta', 'abrigo'],
    Vestidos: ['vestido', 'vestidos', 'enterito'],
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lowerNombre.includes(keyword))) {
      return category
    }
  }

  return 'General'
}

/**
 * Normaliza nombre
 */
function normalizeName(name: string): string {
  if (!name) return ''

  return name
    .trim()
    .split(' ')
    .map((word) => {
      if (word.length === 0) return ''
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
    .trim()
}

/**
 * Normaliza categoría
 */
function normalizeCategory(category: string): string {
  if (!category) return 'General'

  const normalized = category.trim()
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
}

/**
 * Valida producto V2
 */
export function validateProductV2(product: ParsedProduct): {
  esValido: boolean
  errores: string[]
  advertencias: string[]
} {
  const errores: string[] = []
  const advertencias: string[] = []

  // Validaciones críticas
  if (!product.nombre || product.nombre.trim().length < 3) {
    errores.push('Nombre debe tener al menos 3 caracteres')
  }

  if (!product.categoria || product.categoria.trim().length === 0) {
    errores.push('Categoría requerida')
  }

  if (!product.precio || product.precio <= 0) {
    errores.push('Precio debe ser mayor a 0')
  }

  if (product.stock < 0) {
    errores.push('Stock no puede ser negativo')
  }

  // Validaciones de advertencia
  if (!product.descripcion || product.descripcion.length < 20) {
    advertencias.push('Descripción muy corta (recomendado: 20+ caracteres)')
  }

  if (!product.imagenPrincipal && (!product.imagenes || product.imagenes.length === 0)) {
    advertencias.push('Sin imagen principal')
  }

  if (!product.sku) {
    advertencias.push('Sin SKU (recomendado para inventario)')
  }

  // Validar URLs de imágenes
  if (product.imagenes) {
    product.imagenes.forEach((img, index) => {
      if (!isValidImageURL(img)) {
        advertencias.push(`Imagen ${index + 1} tiene URL inválida: ${img}`)
      }
    })
  }

  return {
    esValido: errores.length === 0,
    errores,
    advertencias,
  }
}

/**
 * Valida URL de imagen
 */
function isValidImageURL(url: string): boolean {
  if (!url) return false

  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    // URL relativa
    return url.startsWith('/') || url.startsWith('./')
  }
}

/**
 * Mejora producto con IA V2
 */
function enhanceProductV2(product: ParsedProduct): ParsedProduct {
  // Generar descripción si no existe
  const descripcion =
    product.descripcion || generateShortDescriptionV2(product.nombre, product.categoria)

  // Generar descripción larga
  const descripcionLarga = generateLongDescriptionV2(
    product.nombre,
    product.categoria,
    descripcion,
    product.colores,
    product.talles
  )

  // Generar tags SEO mejorados
  const tags = generateTagsV2(product.nombre, product.categoria, product.colores)

  // Sugerir talles si no existen
  const talles = product.talles || suggestTalles(product.categoria)

  // Sugerir stock por talle si no existe
  let stockPorTalle = product.stockPorTalle
  if (!stockPorTalle && talles.length > 0 && product.stock > 0) {
    stockPorTalle = distributeStock(talles, product.stock)
  }

  return {
    ...product,
    descripcion,
    descripcionLarga,
    tags,
    talles,
    stockPorTalle,
  }
}

/**
 * Genera descripción corta V2
 */
function generateShortDescriptionV2(nombre: string, categoria: string): string {
  return `${nombre} de alta calidad en la categoría ${categoria}. Diseño moderno y confortable.`
}

/**
 * Genera descripción larga V2
 */
function generateLongDescriptionV2(
  nombre: string,
  categoria: string,
  descripcionCorta: string,
  colores?: string[],
  talles?: string[]
): string {
  let desc = `${descripcionCorta}\n\nCaracterísticas:\n- Material de primera calidad\n- Diseño moderno y versátil\n- Perfecto para uso diario`

  if (talles && talles.length > 0) {
    desc += `\n- Disponible en talles: ${talles.join(', ')}`
  }

  if (colores && colores.length > 0) {
    desc += `\n- Colores disponibles: ${colores.join(', ')}`
  }

  desc += `\n\nIdeal para quienes buscan ${categoria.toLowerCase()} de calidad y estilo.`

  return desc
}

/**
 * Genera tags V2 mejorados
 */
function generateTagsV2(nombre: string, categoria: string, colores?: string[]): string[] {
  const tags: string[] = []

  // Tags de categoría
  tags.push(categoria.toLowerCase())

  // Tags del nombre (palabras clave)
  const palabras = nombre.toLowerCase().split(' ')
  palabras.forEach((palabra) => {
    if (palabra.length > 3 && !['de', 'la', 'el', 'los', 'las', 'del', 'con'].includes(palabra)) {
      tags.push(palabra)
    }
  })

  // Tags de colores
  if (colores) {
    colores.forEach((color) => {
      tags.push(color.toLowerCase())
    })
  }

  // Tags comunes
  tags.push('indumentaria', 'moda', 'ropa')

  return [...new Set(tags)].slice(0, 15) // Máximo 15 tags
}

/**
 * Sugiere talles según categoría
 */
function suggestTalles(categoria: string): string[] {
  const tallesPorCategoria: Record<string, string[]> = {
    Remeras: ['S', 'M', 'L', 'XL'],
    Pantalones: ['36', '38', '40', '42'],
    Buzos: ['S', 'M', 'L', 'XL'],
    Zapatillas: ['38', '39', '40', '41', '42'],
  }

  return tallesPorCategoria[categoria] || ['S', 'M', 'L']
}

/**
 * Calcula score de calidad
 */
function calculateQualityScore(product: ParsedProduct): number {
  let score = 0

  if (product.nombre && product.nombre.length >= 3) score += 20
  if (product.categoria) score += 15
  if (product.precio > 0) score += 15
  if (product.stock >= 0) score += 10
  if (product.descripcion && product.descripcion.length > 20) score += 15
  if (product.descripcionLarga && product.descripcionLarga.length > 50) score += 10
  if (product.tags && product.tags.length > 0) score += 5
  if (product.imagenPrincipal || (product.imagenes && product.imagenes.length > 0)) score += 10
  if (product.talles && product.talles.length > 0) score += 5
  if (product.colores && product.colores.length > 0) score += 5
  if (product.sku) score += 5

  return Math.min(100, score)
}

export default parseBulkProductsV2
