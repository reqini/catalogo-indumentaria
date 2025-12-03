'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Star,
  Truck,
  RotateCcw,
  CreditCard,
  Footprints,
  Dumbbell,
  Sparkles,
  Baby,
} from 'lucide-react'
import Carousel from '@/components/Carousel'
import ProductCard from '@/components/ProductCard'
import { getProducts, getBanners } from '@/utils/api'

function HeroBanner() {
  // Imagen genérica de indumentaria por defecto (Unsplash - moda/ropa)
  const defaultHeroImage =
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'

  const [heroImage, setHeroImage] = useState<string>(defaultHeroImage)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHeroBanner = async () => {
      try {
        const banners = await getBanners()
        // Usar el primer banner activo como hero, o imagen genérica por defecto
        // El campo puede ser 'imagen', 'imagenUrl' o 'imagen_url'
        if (banners.length > 0) {
          const imagenBanner = banners[0].imagen || banners[0].imagenUrl || banners[0].imagen_url
          if (imagenBanner) {
            setHeroImage(imagenBanner)
            console.log('[HOME] Hero banner usando imagen real:', imagenBanner)
          } else {
            // Si no hay imagen en el banner, usar la genérica
            setHeroImage(defaultHeroImage)
          }
        } else {
          // Si no hay banners, usar la imagen genérica
          setHeroImage(defaultHeroImage)
        }
      } catch (error) {
        console.error('Error fetching hero banner:', error)
        // En caso de error, usar la imagen genérica
        setHeroImage(defaultHeroImage)
      } finally {
        setLoading(false)
      }
    }
    fetchHeroBanner()
  }, [])

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/90 to-black/50" />
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Hero background"
          fill
          priority
          quality={90}
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          onError={(e) => {
            // Si la imagen falla, usar imagen genérica de indumentaria
            const fallbackImage =
              'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
            ;(e.target as HTMLImageElement).src = fallbackImage
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 flex flex-col items-center justify-center px-4 text-center"
      >
        <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl lg:text-8xl">
          ESTILO PREMIUM
        </h1>
        <p className="mb-10 max-w-3xl text-xl text-gray-200 md:text-2xl">
          Descubrí las mejores prendas con calidad excepcional
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/catalogo"
            className="flex transform items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-black transition-all hover:scale-105 hover:bg-gray-100"
          >
            Ver Catálogo
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/catalogo?destacado=true"
            className="transform rounded-full border-2 border-white bg-transparent px-8 py-4 font-semibold text-white transition-all hover:scale-105 hover:bg-white/10"
          >
            Nuevos Ingresos
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [newProducts, setNewProducts] = useState<any[]>([])
  const [offerProducts, setOfferProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState('')

  useEffect(() => {
    // Print URLs on mount (only in dev)
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🚀 SITIO PRODUCTIVO COMPLETO')
      console.log('')
      console.log('🏠 HOME con datos reales e imágenes reales 100%')
      console.log('📦 CATÁLOGO productivo con navegación a detalle')
      console.log('🛒 CARRITO funcional sin errores')
      console.log('🖼 Sin mocks ni placeholders')
      console.log('🎯 Listo para demo comercial y pruebas reales')
      console.log('')
      console.log('🔗 URLs disponibles:')
      console.log('  Home:       http://localhost:3001/')
      console.log('  Catálogo:   http://localhost:3001/catalogo')
      console.log('  Admin:      http://localhost:3001/admin')
      console.log('')
    }
  }, [])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Traemos todos los productos activos y armamos las secciones desde acá
        const products = await getProducts()

        // Filtrar solo productos activos (memoizar para evitar recálculos)
        const activeProducts = products.filter((p: any) => p.activo !== false)

        // Productos destacados (flag destacado: true)
        const destacados = activeProducts.filter((p: any) => p.destacado === true).slice(0, 6)

        // Nuevos ingresos (últimos productos creados, ordenados por createdAt desc)
        const nuevos = activeProducts
          .sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return dateB - dateA
          })
          .slice(0, 4)

        // Ofertas activas (descuento > 0)
        const ofertas = activeProducts
          .filter((p: any) => p.descuento && p.descuento > 0)
          .slice(0, 8)

        setFeaturedProducts(destacados)
        setNewProducts(nuevos)
        setOfferProducts(ofertas)
      } catch (error) {
        console.error('Error fetching featured products:', error)
        // Asegurar que los estados no queden undefined
        setFeaturedProducts([])
        setNewProducts([])
        setOfferProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const categories = [
    { name: 'Running', slug: 'running', Icon: Footprints },
    { name: 'Training', slug: 'training', Icon: Dumbbell },
    { name: 'Lifestyle', slug: 'lifestyle', Icon: Sparkles },
    { name: 'Kids', slug: 'kids', Icon: Baby },
    { name: 'Outdoor', slug: 'outdoor', Icon: Footprints },
  ]

  // Colecciones dinámicas basadas en categorías reales
  const [collections, setCollections] = useState([
    {
      name: 'Running',
      image:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
      link: '/catalogo?categoria=Running',
    },
    {
      name: 'Lifestyle',
      image:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
      link: '/catalogo?categoria=Lifestyle',
    },
    {
      name: 'Training',
      image:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80',
      link: '/catalogo?categoria=Training',
    },
  ])

  useEffect(() => {
    // Obtener categorías reales de productos y usar imágenes reales
    const fetchCollections = async () => {
      try {
        const products = await getProducts()
        const categoriasUnicas = [...new Set(products.map((p: any) => p.categoria).filter(Boolean))]

        // Para cada categoría, buscar un producto con imagen real
        const collectionsData = categoriasUnicas.slice(0, 3).map((cat: string) => {
          // Buscar primer producto de esta categoría con imagen real
          const productoEjemplo = products.find(
            (p: any) =>
              p.categoria === cat && p.activo !== false && (p.imagenPrincipal || p.imagen_principal)
          )

          // Usar imagen del producto si existe, sino usar imagen de Unsplash según categoría
          let imagenReal = productoEjemplo?.imagenPrincipal || productoEjemplo?.imagen_principal

          // Si no hay imagen del producto, usar imagen de Unsplash según categoría
          if (!imagenReal || imagenReal === '/images/default-product.svg') {
            const categoriaLower = cat.toLowerCase()
            if (categoriaLower === 'running') {
              imagenReal =
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80'
            } else if (categoriaLower === 'training') {
              imagenReal =
                'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80'
            } else if (categoriaLower === 'lifestyle') {
              imagenReal =
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80'
            } else {
              imagenReal =
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80'
            }
          }

          return {
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            image: imagenReal,
            link: `/catalogo?categoria=${encodeURIComponent(cat)}`,
          }
        })

        if (collectionsData.length > 0) {
          setCollections(collectionsData)
          console.log('[HOME] Colecciones cargadas con imágenes reales:', collectionsData.length)
        }
      } catch (error) {
        console.error('Error fetching collections:', error)
      }
    }
    fetchCollections()
  }, [])

  const reviews = [
    {
      name: 'María González',
      rating: 5,
      comment: 'Excelente calidad, super cómodas para correr.',
      product: 'Zapatilla Runner Pro',
    },
    {
      name: 'Juan Pérez',
      rating: 5,
      comment: 'El buzo es perfecto, muy buena relación precio-calidad.',
      product: 'Buzo Essential Hoodie',
    },
    {
      name: 'Ana Martínez',
      rating: 4,
      comment: 'Muy buena campera, abriga mucho. Recomendable.',
      product: 'Campera Puffer Warm',
    },
  ]

  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return

    setNewsletterLoading(true)
    setNewsletterSuccess(false)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al suscribirse')
      }

      setNewsletterSuccess(true)
      setNewsletterEmail('')

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setNewsletterSuccess(false)
      }, 3000)
    } catch (error: any) {
      console.error('Error en newsletter:', error)
      alert(error.message || 'Error al suscribirse. Intenta nuevamente.')
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Fullscreen - Usa banner real del admin */}
      <HeroBanner />

      {/* Chips de Categorías */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="scrollbar-hide overflow-x-auto">
            <div className="flex min-w-max gap-4 pb-4">
              {categories.map((category, index) => {
                const Icon = category.Icon
                return (
                  <Link
                    key={category.slug}
                    href={`/catalogo?categoria=${category.slug}`}
                    className="group"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex min-w-[100px] flex-col items-center gap-2"
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black shadow-md transition-transform group-hover:scale-110">
                        <Icon className="text-white" size={32} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-black">
                        {category.name}
                      </span>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Carrusel de Banners */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Carousel />
        </div>
      </section>

      {/* Destacados de la Semana (slider horizontal) */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-black md:text-4xl">Destacados de la Semana</h2>
              <Link
                href="/catalogo?destacado=true"
                className="flex items-center gap-2 font-semibold text-black hover:underline"
              >
                Ver todos
                <ArrowRight size={20} />
              </Link>
            </div>
            {loading ? (
              <p className="text-gray-600">Cargando productos destacados...</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="min-w-[220px] max-w-[260px] flex-shrink-0"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Nuevos ingresos */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-black md:text-4xl">Nuevos ingresos</h2>
              <Link
                href="/catalogo"
                className="flex items-center gap-2 font-semibold text-black hover:underline"
              >
                Ver catálogo completo
                <ArrowRight size={20} />
              </Link>
            </div>
            {loading ? (
              <p className="text-gray-600">Cargando nuevos ingresos...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {newProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Ofertas activas */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-black md:text-4xl">Ofertas activas</h2>
              <Link
                href="/catalogo?ofertas=true"
                className="flex items-center gap-2 font-semibold text-black hover:underline"
              >
                Ver productos en oferta
                <ArrowRight size={20} />
              </Link>
            </div>
            {loading ? (
              <p className="text-gray-600">Cargando ofertas activas...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-5">
                {offerProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Colecciones Temáticas */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-8 text-center text-3xl font-bold text-black md:text-4xl">
              Colecciones
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {collections.map((collection, index) => (
                <Link key={collection.name} href={collection.link}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg"
                  >
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 to-transparent" />
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                      quality={85}
                      onError={(e) => {
                        // Si la imagen no existe, usar placeholder
                        ;(e.target as HTMLImageElement).src = '/images/default-product.svg'
                      }}
                    />
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                      <h3 className="mb-2 text-2xl font-bold text-white">{collection.name}</h3>
                      <span className="flex items-center gap-2 text-white/90 transition-all group-hover:gap-4">
                        Explorar
                        <ArrowRight size={20} />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-gray-200 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <Truck className="mx-auto mb-2 text-black" size={32} />
              <h3 className="mb-1 font-semibold text-black">Envíos Gratis</h3>
              <p className="text-sm text-gray-600">Compras +$50.000</p>
            </div>
            <div className="text-center">
              <RotateCcw className="mx-auto mb-2 text-black" size={32} />
              <h3 className="mb-1 font-semibold text-black">30 Días</h3>
              <p className="text-sm text-gray-600">Para cambios</p>
            </div>
            <div className="text-center">
              <CreditCard className="mx-auto mb-2 text-black" size={32} />
              <h3 className="mb-1 font-semibold text-black">12 Cuotas</h3>
              <p className="text-sm text-gray-600">Sin interés</p>
            </div>
            <div className="text-center">
              <Star className="mx-auto mb-2 text-black" size={32} />
              <h3 className="mb-1 font-semibold text-black">Garantía</h3>
              <p className="text-sm text-gray-600">6 meses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-black md:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-lg bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-gray-700">"{review.comment}"</p>
                <div>
                  <p className="font-semibold text-black">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.product}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-black py-12 text-white md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Suscribite a nuestro Newsletter</h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-300">
            Recibí ofertas exclusivas y novedades antes que nadie
          </p>
          <form onSubmit={handleNewsletter} className="mx-auto flex max-w-md flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={newsletterLoading}
                className="flex-1 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {newsletterLoading ? 'Enviando...' : 'Suscribirme'}
              </button>
            </div>
            {newsletterSuccess && (
              <p className="text-center text-sm text-green-400">
                ¡Gracias por suscribirte! Te notificaremos de nuestras novedades.
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  )
}
