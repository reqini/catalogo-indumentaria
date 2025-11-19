'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, Loader2, CheckCircle2, X, Trash2, Edit2, Save, XCircle, 
  Upload, FileText, Camera, Mic, Zap, Image as ImageIcon, AlertCircle,
  TrendingUp, Clock, BarChart3
} from 'lucide-react'
import { X as XIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import BulkImportTabs from '@/components/admin/BulkImportTabs'
import IntelligentParser from '@/components/admin/IntelligentParser'
import SmartProductTable from '@/components/admin/SmartProductTable'
import ImageSearch from '@/components/admin/ImageSearch'
import AutoQA from '@/components/admin/AutoQA'
import MetricsDisplay from '@/components/admin/MetricsDisplay'

export interface EnhancedProduct {
  id?: string
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
  calidad?: number // Score 0-100
  errores?: string[]
  advertencias?: string[]
}

interface ImportMetrics {
  productosCreados: number
  tiempoAhorrado: number // minutos
  erroresDetectados: number
  calidadPromedio: number
  duplicadosEncontrados: number
}

export default function AdminBulkImportV2Page() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'normal' | 'ia' | 'ocr'>('ia')
  const [parsedProducts, setParsedProducts] = useState<EnhancedProduct[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    created: number
    errors: Array<{ index: number; reason: string }>
    metrics?: ImportMetrics
  } | null>(null)
  const [showMetrics, setShowMetrics] = useState(false)

  const handleParse = async (input: string, source: 'text' | 'csv' | 'ocr' | 'voice') => {
    setIsProcessing(true)
    setParsedProducts([])
    setImportResult(null)
    setShowMetrics(false)

    try {
      const response = await fetch('/api/admin/ia-bulk-parse-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          text: input,
          source,
          enhance: true, // Activar mejoras IA
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al analizar el contenido')
      }

      const data = await response.json()
      
      if (!data.products || data.products.length === 0) {
        toast.error('No se pudieron detectar productos. Intentá con un formato más estructurado.')
        return
      }

      // Calcular calidad inicial para cada producto
      const productsWithQuality = data.products.map((p: EnhancedProduct) => ({
        ...p,
        calidad: calculateQualityScore(p),
      }))

      setParsedProducts(productsWithQuality)
      toast.success(`Se detectaron ${productsWithQuality.length} productos`)
    } catch (error: any) {
      console.error('Error parsing:', error)
      toast.error(error.message || 'Error al procesar el contenido')
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateQualityScore = (product: EnhancedProduct): number {
    let score = 0
    
    // Nombre: 20 puntos
    if (product.nombre && product.nombre.length >= 3) score += 20
    
    // Categoría: 15 puntos
    if (product.categoria) score += 15
    
    // Precio: 15 puntos
    if (product.precio > 0) score += 15
    
    // Stock: 10 puntos
    if (product.stock >= 0) score += 10
    
    // Descripción: 15 puntos
    if (product.descripcion && product.descripcion.length > 20) score += 15
    
    // Descripción larga: 10 puntos
    if (product.descripcionLarga && product.descripcionLarga.length > 50) score += 10
    
    // Tags: 5 puntos
    if (product.tags && product.tags.length > 0) score += 5
    
    // Imágenes: 10 puntos
    if (product.imagenPrincipal || (product.imagenes && product.imagenes.length > 0)) score += 10
    
    return Math.min(100, score)
  }

  const handleOptimizeAll = async () => {
    if (parsedProducts.length === 0) {
      toast.error('No hay productos para optimizar')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/admin/ia-optimize-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ products: parsedProducts }),
      })

      if (!response.ok) {
        throw new Error('Error al optimizar productos')
      }

      const data = await response.json()
      
      // Recalcular calidad después de optimización
      const optimized = data.products.map((p: EnhancedProduct) => ({
        ...p,
        calidad: calculateQualityScore(p),
      }))

      setParsedProducts(optimized)
      toast.success('Productos optimizados con IA')
    } catch (error: any) {
      console.error('Error optimizing:', error)
      toast.error('Error al optimizar productos')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateProduct = (index: number, updates: Partial<EnhancedProduct>) => {
    const updated = [...parsedProducts]
    updated[index] = {
      ...updated[index],
      ...updates,
      calidad: calculateQualityScore({ ...updated[index], ...updates }),
    }
    setParsedProducts(updated)
  }

  const handleDeleteProduct = (index: number) => {
    if (!confirm(`¿Eliminar "${parsedProducts[index].nombre}" de la importación?`)) {
      return
    }
    const updated = parsedProducts.filter((_, i) => i !== index)
    setParsedProducts(updated)
    toast.success('Producto eliminado')
  }

  const handleImport = async () => {
    if (parsedProducts.length === 0) {
      toast.error('No hay productos para importar')
      return
    }

    // QA automático antes de importar
    const qaResult = await runAutoQA(parsedProducts)
    
    if (qaResult.erroresCriticos > 0) {
      toast.error(`Hay ${qaResult.erroresCriticos} errores críticos. Corregilos antes de importar.`)
      return
    }

    setIsImporting(true)
    setImportResult(null)

    const startTime = Date.now()

    try {
      const response = await fetch('/api/admin/bulk-products-create-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ products: parsedProducts }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al importar productos')
      }

      const result = await response.json()
      const endTime = Date.now()
      const tiempoTranscurrido = Math.round((endTime - startTime) / 1000) // segundos
      
      // Calcular métricas
      const metrics: ImportMetrics = {
        productosCreados: result.created,
        tiempoAhorrado: Math.round((parsedProducts.length * 2 - tiempoTranscurrido) / 60), // Estimado 2 min por producto manual
        erroresDetectados: result.errors?.length || 0,
        calidadPromedio: Math.round(
          parsedProducts.reduce((acc, p) => acc + (p.calidad || 0), 0) / parsedProducts.length
        ),
        duplicadosEncontrados: qaResult.duplicados || 0,
      }

      setImportResult({
        ...result,
        metrics,
      })
      setShowMetrics(true)

      if (result.created > 0) {
        toast.success(`Se crearon ${result.created} productos correctamente`)
      }

      if (result.errors && result.errors.length > 0) {
        toast.error(`${result.errors.length} productos fallaron`)
      }
    } catch (error: any) {
      console.error('Error importing:', error)
      toast.error(error.message || 'Error al importar productos')
    } finally {
      setIsImporting(false)
    }
  }

  const runAutoQA = async (products: EnhancedProduct[]) => {
    // QA automático: detectar duplicados, inconsistencias, etc.
    const duplicados = new Set<string>()
    const nombresVistos = new Map<string, number>()
    
    products.forEach((p, index) => {
      const nombreNormalizado = p.nombre.toLowerCase().trim()
      if (nombresVistos.has(nombreNormalizado)) {
        duplicados.add(nombreNormalizado)
      } else {
        nombresVistos.set(nombreNormalizado, index)
      }
    })

    const erroresCriticos = products.filter(p => {
      return !p.nombre || !p.categoria || p.precio <= 0 || p.stock < 0
    }).length

    return {
      duplicados: duplicados.size,
      erroresCriticos,
      productosConAdvertencias: products.filter(p => (p.advertencias?.length || 0) > 0).length,
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-black" size={24} />
            <h1 className="text-2xl font-bold text-black">Carga Múltiple Inteligente V2</h1>
          </div>
          <button
            onClick={() => router.push('/admin/productos')}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            Volver a Productos
          </button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* Tabs de entrada */}
        <BulkImportTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onParse={handleParse}
          isProcessing={isProcessing}
        />

        {/* Optimización masiva */}
        {parsedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-black mb-2">
                  Productos Detectados ({parsedProducts.length})
                </h2>
                <p className="text-sm text-gray-600">
                  Calidad promedio: {Math.round(
                    parsedProducts.reduce((acc, p) => acc + (p.calidad || 0), 0) / parsedProducts.length
                  )}/100
                </p>
              </div>
              <button
                onClick={handleOptimizeAll}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={20} />
                <span>Optimizar Todos con IA</span>
              </button>
            </div>

            {/* QA Automático */}
            <AutoQA products={parsedProducts} />
          </div>
        )}

        {/* Tabla inteligente */}
        {parsedProducts.length > 0 && (
          <SmartProductTable
            products={parsedProducts}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
            onImageSearch={(index: number, query: string) => {
              // Abrir modal de búsqueda de imágenes
              console.log('Buscar imágenes para:', query)
            }}
          />
        )}

        {/* Botón de importación */}
        {parsedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black mb-1">Listo para Importar</h3>
                <p className="text-sm text-gray-600">
                  {parsedProducts.length} productos listos • 
                  Calidad promedio: {Math.round(
                    parsedProducts.reduce((acc, p) => acc + (p.calidad || 0), 0) / parsedProducts.length
                  )}/100
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>Importando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={24} />
                      <span>Importar {parsedProducts.length} Productos</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resultado y métricas */}
        {importResult && showMetrics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-black mb-4">Resultado de la Importación</h2>
            
            <MetricsDisplay metrics={importResult.metrics!} />

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 font-semibold mb-2">
                  ❌ {importResult.errors.length} productos fallaron:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {importResult.errors.map((error, idx) => (
                    <li key={idx}>
                      Producto #{error.index + 1}: {error.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => router.push('/admin/productos')}
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
              >
                Ver Productos
              </button>
              <button
                onClick={() => {
                  setParsedProducts([])
                  setImportResult(null)
                  setShowMetrics(false)
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Nueva Importación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

