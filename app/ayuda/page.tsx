'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HelpCircle, BookOpen, MessageCircle, ArrowLeft } from 'lucide-react'

export default function AyudaPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-black text-sm"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <HelpCircle size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                Centro de ayuda
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Todo lo que necesitás para sacar el máximo provecho de tu
                catálogo.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <section className="md:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                <BookOpen size={18} />
                Guía rápida (3 pasos)
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm md:text-base">
                <li>
                  <strong>Creá tu cuenta</strong> desde{' '}
                  <Link
                    href="/auth/register"
                    className="text-black font-semibold underline"
                  >
                    Registro
                  </Link>{' '}
                  y completá los datos de tu negocio.
                </li>
                <li>
                  <strong>Cargá tus productos</strong> desde el panel{' '}
                  <span className="font-semibold">Admin &gt; Productos</span>,
                  con fotos, talles y precios.
                </li>
                <li>
                  <strong>Compartí tu catálogo</strong> usando la URL{' '}
                  <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                    /[tu-tenant]/catalogo
                  </code>{' '}
                  o vinculalo a tu dominio.
                </li>
              </ol>

              <div className="pt-4 space-y-3">
                <h2 className="text-lg font-semibold text-black">
                  Preguntas frecuentes
                </h2>
                <details className="bg-gray-50 rounded-lg p-3">
                  <summary className="cursor-pointer font-medium text-sm text-black">
                    ¿Cómo cargo un producto nuevo?
                  </summary>
                  <p className="mt-2 text-sm text-gray-700">
                    Ingresá a <strong>Admin &gt; Productos</strong> y hacé clic
                    en <strong>“Nuevo Producto”</strong>. Completá nombre,
                    precio, categoría, talles y subí al menos una imagen. El
                    botón guardar se habilita cuando todos los campos obligatorios
                    son válidos.
                  </p>
                </details>

                <details className="bg-gray-50 rounded-lg p-3">
                  <summary className="cursor-pointer font-medium text-sm text-black">
                    ¿Cómo configuro Mercado Pago?
                  </summary>
                  <p className="mt-2 text-sm text-gray-700">
                    En tu cuenta de Mercado Pago generá un{' '}
                    <strong>Access Token</strong> y configuralo en tus variables
                    de entorno como <code>MP_ACCESS_TOKEN</code>. Luego podés
                    asignar IDs de Mercado Pago a cada producto desde el panel
                    de administración.
                  </p>
                </details>

                <details className="bg-gray-50 rounded-lg p-3">
                  <summary className="cursor-pointer font-medium text-sm text-black">
                    ¿Qué pasa si llego al límite de mi plan?
                  </summary>
                  <p className="mt-2 text-sm text-gray-700">
                    El sistema te avisará con un mensaje como{' '}
                    <strong>
                      “Límite de productos alcanzado. Actualizá tu plan para
                      continuar.”
                    </strong>{' '}
                    y bloqueará la creación de nuevos productos o banners según
                    tu plan. Podés subir de plan desde{' '}
                    <Link
                      href="/planes"
                      className="text-black font-semibold underline"
                    >
                      /planes
                    </Link>
                    .
                  </p>
                </details>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                <MessageCircle size={18} />
                ¿Necesitás ayuda?
              </h2>
              <p className="text-sm text-gray-700">
                Si algo no funciona como esperás o tenés dudas, podés escribirnos
                y te ayudamos a resolverlo.
              </p>
              <div className="space-y-2 text-sm">
                <a
                  href="mailto:soporte@catalogosimple.com"
                  className="block px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  soporte@catalogosimple.com
                </a>
                <a
                  href="https://wa.me/5491112345678"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-4 py-2 rounded-lg bg-green-500 text-white text-center font-semibold hover:bg-green-600 transition-colors"
                >
                  Escribir por WhatsApp
                </a>
              </div>
              <p className="text-xs text-gray-500">
                Tiempo de respuesta habitual: 24 hs hábiles.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  )
}


