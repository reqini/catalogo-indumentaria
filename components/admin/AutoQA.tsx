'use client'

import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { EnhancedProduct } from '@/app/admin/productos/carga-multiple-v2/page'

interface AutoQAProps {
  products: EnhancedProduct[]
}

export default function AutoQA({ products }: AutoQAProps) {
  const qaResults = analyzeProducts(products)

  if (qaResults.erroresCriticos === 0 && qaResults.advertencias === 0 && qaResults.duplicados === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle2 size={20} />
          <span className="font-semibold">Todos los productos están listos para importar</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {qaResults.erroresCriticos > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle size={20} />
            <span className="font-semibold">{qaResults.erroresCriticos} Errores Críticos</span>
          </div>
          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
            {qaResults.erroresDetalle.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {qaResults.duplicados > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800 mb-2">
            <AlertTriangle size={20} />
            <span className="font-semibold">{qaResults.duplicados} Productos Duplicados Detectados</span>
          </div>
          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
            {qaResults.duplicadosDetalle.map((dup, idx) => (
              <li key={idx}>{dup}</li>
            ))}
          </ul>
        </div>
      )}

      {qaResults.advertencias > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <AlertTriangle size={20} />
            <span className="font-semibold">{qaResults.advertencias} Advertencias</span>
          </div>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            {qaResults.advertenciasDetalle.map((adv, idx) => (
              <li key={idx}>{adv}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function analyzeProducts(products: EnhancedProduct[]) {
  const erroresCriticos = 0
  const erroresDetalle: string[] = []
  const duplicados = 0
  const duplicadosDetalle: string[] = []
  const advertencias = 0
  const advertenciasDetalle: string[] = []

  const nombresVistos = new Map<string, number[]>()

  products.forEach((product, index) => {
    // Errores críticos
    if (!product.nombre || product.nombre.trim() === '') {
      erroresDetalle.push(`Producto #${index + 1}: Falta nombre`)
    }
    if (!product.categoria || product.categoria.trim() === '') {
      erroresDetalle.push(`Producto #${index + 1}: Falta categoría`)
    }
    if (!product.precio || product.precio <= 0) {
      erroresDetalle.push(`Producto #${index + 1}: Precio inválido`)
    }
    if (product.stock < 0) {
      erroresDetalle.push(`Producto #${index + 1}: Stock negativo`)
    }

    // Duplicados
    const nombreNormalizado = product.nombre?.toLowerCase().trim() || ''
    if (nombreNormalizado) {
      if (nombresVistos.has(nombreNormalizado)) {
        const indices = nombresVistos.get(nombreNormalizado) || []
        indices.push(index + 1)
        nombresVistos.set(nombreNormalizado, indices)
      } else {
        nombresVistos.set(nombreNormalizado, [index + 1])
      }
    }

    // Advertencias
    if (!product.descripcion || product.descripcion.length < 20) {
      advertenciasDetalle.push(`Producto #${index + 1}: Descripción muy corta`)
    }
    if (!product.imagenPrincipal) {
      advertenciasDetalle.push(`Producto #${index + 1}: Sin imagen`)
    }
    if (!product.tags || product.tags.length === 0) {
      advertenciasDetalle.push(`Producto #${index + 1}: Sin tags SEO`)
    }
    if (product.precio && product.precioSugerido && Math.abs(product.precio - product.precioSugerido) > product.precio * 0.2) {
      advertenciasDetalle.push(`Producto #${index + 1}: Precio muy diferente al sugerido`)
    }
  })

  // Procesar duplicados
  nombresVistos.forEach((indices, nombre) => {
    if (indices.length > 1) {
      duplicadosDetalle.push(`${nombre}: productos #${indices.join(', #')}`)
    }
  })

  return {
    erroresCriticos: erroresDetalle.length,
    erroresDetalle,
    duplicados: duplicadosDetalle.length,
    duplicadosDetalle,
    advertencias: advertenciasDetalle.length,
    advertenciasDetalle,
  }
}

