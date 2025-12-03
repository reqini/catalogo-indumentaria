'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePersistedState } from '@/hooks/usePersistedState'
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  Save,
  XCircle,
  Upload,
  FileText,
  Camera,
  Mic,
  Zap,
  Image as ImageIcon,
  AlertCircle,
  TrendingUp,
  Clock,
  BarChart3,
  ExternalLink,
  Copy,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import SmartProductTable from '@/components/admin/SmartProductTable'
import AutoQA from '@/components/admin/AutoQA'
import MetricsDisplay from '@/components/admin/MetricsDisplay'
import BulkImportErrorBoundary from '@/components/admin/BulkImportErrorBoundary'

export interface EnhancedProduct {
  id?: string
  nombre: string
  descripcion?: string
  descripcionLarga?: string
  categoria: string
  precio: number
  precioSugerido?: number
  precioOriginal?: string
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

interface ImportMetrics {
  productosCreados: number
  tiempoAhorrado: number
  erroresDetectados: number
  calidadPromedio: number
  duplicadosEncontrados: number
}

// Ejemplo precargado editable
const EXAMPLE_TEXT = `Remera oversize negra | categoría: Remeras | precio: 25000 | stock: 10 | sku: RON-01
Jean mom azul talle 36/38/40 | categoría: Pantalones | precio: 35000 | stock: 15 | sku: JMM-04
Buzo hoodie frisa premium gris | categoría: Buzos | precio: 42000 | stock: 6 | sku: BHF-22
Zapatillas urban street blancas | categoría: Calzado | precio: 65000 | stock: 8 | sku: ZUS-31`

// Prompt para ChatGPT
const CHATGPT_PROMPT = `Necesito que generes una lista de productos en formato:

NOMBRE | categoría: X | precio: X | stock: X | sku: código sugerido

Ejemplo:
Remera oversize negra | categoría: Remeras | precio: 25000 | stock: 10 | sku: RON-01

Generá 10 productos de indumentaria moderna urbana y deportiva.`

export default function AdminCargaInteligentePage() {
  const router = useRouter()

  // Estados persistentes (sobreviven a refresh)
  const [currentStep, setCurrentStep] = usePersistedState<1 | 2 | 3>('bulk-import-step', 1)
  const [inputText, setInputText] = usePersistedState('bulk-import-input', EXAMPLE_TEXT)
  const [parsedProducts, setParsedProducts] = usePersistedState<EnhancedProduct[]>(
    'bulk-import-products',
    []
  )
  const [importResult, setImportResult] = usePersistedState<{
    created: number
    errors: Array<{ index: number; reason: string }>
    metrics?: ImportMetrics
  } | null>('bulk-import-result', null)

  // Estados temporales (no necesitan persistencia)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  // Limpiar estados persistentes solo cuando se completa la importación exitosamente
  const handleImportSuccess = () => {
    // Limpiar solo después de importación exitosa
    sessionStorage.removeItem('bulk-import-step')
    sessionStorage.removeItem('bulk-import-input')
    sessionStorage.removeItem('bulk-import-products')
    sessionStorage.removeItem('bulk-import-result')
    setCurrentStep(1)
    setInputText(EXAMPLE_TEXT)
    setParsedProducts([])
    setImportResult(null)
  }

  const handleGeneratePrompt = () => {
    // Copiar prompt al clipboard
    navigator.clipboard.writeText(CHATGPT_PROMPT).then(() => {
      setCopiedPrompt(true)
      toast.success('Prompt copiado al portapapeles')
      setTimeout(() => setCopiedPrompt(false), 3000)
    })

    // Abrir ChatGPT en nueva pestaña
    window.open('https://chat.openai.com/', '_blank')
  }

  const handleProcess = async () => {
    if (!inputText.trim()) {
      toast.error('Por favor, ingresá texto para analizar')
      return
    }

    setIsProcessing(true)
    setCurrentStep(2)
    setParsedProducts([])
    setImportResult(null)
    setShowMetrics(false)

    try {
      // Usar error handler con retry
      const { getBulkImportErrorHandler } = await import('@/lib/bulk-import/error-handler')
      const errorHandler = getBulkImportErrorHandler()

      const response = await errorHandler.executeWithRetry(async () => {
        return await fetch('/api/admin/ia-bulk-parse-v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            text: inputText,
            source: 'text',
            enhance: true,
            detectTalles: true,
            detectColores: true,
            autoFix: true,
          }),
        })
      }, 'parsear productos')

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al analizar el contenido')
      }

      const data = await response.json()

      // Mostrar errores si los hay
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((err: any) => {
          if (err.tipo === 'critical' || err.tipo === 'error') {
            toast.error(err.mensajeAmigable || err.mensaje, { duration: 5000 })
          } else {
            toast.error(err.mensajeAmigable || err.mensaje, { duration: 3000 })
          }
        })
      }

      if (!data.products || data.products.length === 0) {
        toast.error('No se pudieron detectar productos. Revisá el formato.')
        setCurrentStep(1)
        return
      }

      // Los productos ya vienen con calidad, errores y advertencias del parser V2
      // Solo necesitamos mapearlos al formato esperado por el componente
      const productsWithQuality = data.products.map((p: any) => ({
        ...p,
        // Asegurar que tenga los campos esperados
        calidad: p.calidad || calculateQualityScore(p),
        errores: p.errores || validateProduct(p),
        advertencias: p.advertencias || getWarnings(p),
      }))

      setParsedProducts(productsWithQuality)
      setCurrentStep(3)
      toast.success(`Se detectaron ${productsWithQuality.length} productos`)

      // Mostrar metadata si está disponible
      if (data.metadata) {
        console.log('[Carga Inteligente] Metadata:', data.metadata)
      }
    } catch (error: any) {
      console.error('Error parsing:', error)
      toast.error(error.message || 'Error al procesar el contenido')
      setCurrentStep(1)
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateQualityScore = (product: EnhancedProduct): number => {
    let score = 0

    if (product.nombre && product.nombre.length >= 3) score += 20
    if (product.categoria) score += 15
    if (product.precio > 0) score += 15
    if (product.stock >= 0) score += 10
    if (product.descripcion && product.descripcion.length > 20) score += 15
    if (product.descripcionLarga && product.descripcionLarga.length > 50) score += 10
    if (product.tags && product.tags.length > 0) score += 5
    if (product.imagenPrincipal || (product.imagenes && product.imagenes.length > 0)) score += 10

    return Math.min(100, score)
  }

  const validateProduct = (product: EnhancedProduct): string[] => {
    const errors: string[] = []

    if (!product.nombre || product.nombre.trim() === '') {
      errors.push('Nombre requerido')
    }
    if (!product.categoria || product.categoria.trim() === '') {
      errors.push('Categoría requerida')
    }
    if (!product.precio || product.precio <= 0) {
      errors.push('Precio inválido')
    }
    if (product.stock < 0) {
      errors.push('Stock no puede ser negativo')
    }

    return errors
  }

  const getWarnings = (product: EnhancedProduct): string[] => {
    const warnings: string[] = []

    if (!product.descripcion || product.descripcion.length < 20) {
      warnings.push('Descripción muy corta')
    }
    if (!product.imagenPrincipal) {
      warnings.push('Sin imagen')
    }
    if (!product.sku) {
      warnings.push('Sin SKU')
    }

    return warnings
  }

  const handleUpdateProduct = (index: number, updates: Partial<EnhancedProduct>) => {
    const updated = [...parsedProducts]
    updated[index] = {
      ...updated[index],
      ...updates,
      calidad: calculateQualityScore({ ...updated[index], ...updates }),
      errores: validateProduct({ ...updated[index], ...updates }),
      advertencias: getWarnings({ ...updated[index], ...updates }),
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

    // Validar que no haya errores críticos
    const productosConErrores = parsedProducts.filter((p) => (p.errores?.length || 0) > 0)
    if (productosConErrores.length > 0) {
      toast.error(
        `Hay ${productosConErrores.length} productos con errores. Corregilos antes de importar.`
      )
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
      const tiempoTranscurrido = Math.round((endTime - startTime) / 1000)

      // Guardar log de importación
      try {
        const { getBulkImportErrorHandler } = await import('@/lib/bulk-import/error-handler')
        const errorHandler = getBulkImportErrorHandler()

        const log = errorHandler.generateLog({
          totalProductos: parsedProducts.length,
          productosExitosos: result.created,
          formato: 'text',
        })

        await errorHandler.saveLog(log)
      } catch (logError) {
        console.error('Error guardando log:', logError)
      }

      // Calcular métricas
      const metrics: ImportMetrics = {
        productosCreados: result.created,
        tiempoAhorrado: Math.max(
          0,
          Math.round((parsedProducts.length * 2 - tiempoTranscurrido) / 60)
        ),
        erroresDetectados: result.errors?.length || 0,
        calidadPromedio: Math.round(
          parsedProducts.reduce((acc, p) => acc + (p.calidad || 0), 0) / parsedProducts.length
        ),
        duplicadosEncontrados: 0, // Se calcula en QA
      }

      setImportResult({
        ...result,
        metrics,
      })
      setShowMetrics(true)

      if (result.created > 0) {
        toast.success(`✅ Se crearon ${result.created} productos correctamente`)
        // Limpiar estados persistentes después de importación exitosa
        handleImportSuccess()
      }

      if (result.errors && result.errors.length > 0) {
        toast.error(`⚠️ ${result.errors.length} productos fallaron`)
      }
    } catch (error: any) {
      console.error('Error importing:', error)
      toast.error(error.message || 'Error al importar productos')
    } finally {
      setIsImporting(false)
    }
  }

  const handleReset = () => {
    setInputText(EXAMPLE_TEXT)
    setCurrentStep(1)
    setParsedProducts([])
    setImportResult(null)
    setShowMetrics(false)
  }

  return (
    <BulkImportErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-3">
              <Sparkles className="text-black" size={24} />
              <h1 className="text-2xl font-bold text-black">Carga Inteligente con IA</h1>
            </div>
            <button
              onClick={() => router.push('/admin/productos')}
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-50"
            >
              Volver a Productos
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-8 py-8">
          {/* Indicador de pasos */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <div className="mb-6 flex items-center justify-between">
              <div
                className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-black' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    currentStep >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  1
                </div>
                <span className="font-semibold">Ingreso</span>
              </div>
              <div className="mx-4 h-1 flex-1 bg-gray-200">
                <div
                  className={`h-full transition-all ${currentStep >= 2 ? 'bg-black' : ''}`}
                  style={{ width: currentStep >= 2 ? '100%' : '0%' }}
                />
              </div>
              <div
                className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-black' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    currentStep >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  2
                </div>
                <span className="font-semibold">Procesado</span>
              </div>
              <div className="mx-4 h-1 flex-1 bg-gray-200">
                <div
                  className={`h-full transition-all ${currentStep >= 3 ? 'bg-black' : ''}`}
                  style={{ width: currentStep >= 3 ? '100%' : '0%' }}
                />
              </div>
              <div
                className={`flex items-center gap-3 ${currentStep >= 3 ? 'text-black' : 'text-gray-400'}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    currentStep >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  3
                </div>
                <span className="font-semibold">Vista Previa</span>
              </div>
            </div>
          </div>

          {/* Paso 1: Ingreso */}
          {currentStep === 1 && (
            <div className="mb-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-black">Paso 1: Ingresá tus productos</h2>

              <p className="mb-4 text-gray-600">
                Podés pegar tu lista de productos desde Excel, WhatsApp o generarla con IA.
              </p>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Listado de productos
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={EXAMPLE_TEXT}
                  className="h-64 w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={isProcessing}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Formato: NOMBRE | categoría: X | precio: X | stock: X | sku: código
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !inputText.trim()}
                  className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Procesar con IA / Analizar</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleGeneratePrompt}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  {copiedPrompt ? (
                    <>
                      <CheckCircle size={20} className="text-green-600" />
                      <span>Prompt Copiado</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink size={20} />
                      <span>Generar prompt IA</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(EXAMPLE_TEXT)
                    toast.success('Ejemplo copiado')
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  <Copy size={18} />
                  <span>Copiar ejemplo</span>
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Procesado */}
          {currentStep === 2 && isProcessing && (
            <div className="rounded-lg bg-white p-12 text-center shadow">
              <Loader2 className="mx-auto mb-4 animate-spin text-black" size={48} />
              <h3 className="mb-2 text-xl font-bold text-black">Procesando con IA...</h3>
              <p className="text-gray-600">
                Analizando productos, generando descripciones y optimizando contenido...
              </p>
            </div>
          )}

          {/* Paso 3: Vista Previa */}
          {currentStep === 3 && parsedProducts.length > 0 && (
            <>
              <div className="mb-6 rounded-lg bg-white p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="mb-2 text-xl font-bold text-black">
                      Paso 3: Revisá y editá los productos ({parsedProducts.length} productos)
                    </h2>
                    <p className="text-sm text-gray-600">
                      Calidad promedio:{' '}
                      {Math.round(
                        parsedProducts.reduce((acc, p) => acc + (p.calidad || 0), 0) /
                          parsedProducts.length
                      )}
                      /100
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                  >
                    Nuevo Proceso
                  </button>
                </div>

                {/* QA Automático */}
                <AutoQA products={parsedProducts} />

                {/* Mensaje sobre imágenes */}
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Las imágenes se asignarán momentáneamente con un
                    placeholder. Luego podés cargarlas a mano en la edición individual de productos.
                  </p>
                </div>
              </div>

              {/* Tabla inteligente */}
              <SmartProductTable
                products={parsedProducts}
                onUpdate={handleUpdateProduct}
                onDelete={handleDeleteProduct}
                onImageSearch={(_index: number, _query: string) => {
                  // La búsqueda de imágenes se maneja dentro del componente
                }}
              />

              {/* Botón de importación */}
              <div className="mb-6 rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-black">Listo para Importar</h3>
                    <p className="text-sm text-gray-600">
                      {parsedProducts.length} productos listos • Calidad promedio:{' '}
                      {Math.round(
                        parsedProducts.reduce((acc, p) => acc + (p.calidad || 0), 0) /
                          parsedProducts.length
                      )}
                      /100
                    </p>
                  </div>
                  <button
                    onClick={handleImport}
                    disabled={
                      isImporting || parsedProducts.some((p) => (p.errores?.length || 0) > 0)
                    }
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            </>
          )}

          {/* Resultado final */}
          {importResult && showMetrics && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-black">Resultado de la Importación</h2>

              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-lg font-semibold text-green-800">
                  ✅ {importResult.created} productos creados correctamente
                </p>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="mb-2 font-semibold text-red-800">
                    ❌ {importResult.errors.length} productos fallaron:
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                    {importResult.errors.map((error, idx) => (
                      <li key={idx}>
                        Producto #{error.index + 1}: {error.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult.metrics && <MetricsDisplay metrics={importResult.metrics} />}

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => router.push('/admin/productos')}
                  className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800"
                >
                  Ver Productos Creados
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  Nueva Importación
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BulkImportErrorBoundary>
  )
}
