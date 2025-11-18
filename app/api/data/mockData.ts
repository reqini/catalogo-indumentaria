// Datos mock compartidos para desarrollo
// En producción, estos datos vendrían de una base de datos real

export let products: any[] = [
  {
    id: '1',
    nombre: 'Remera Premium Negra',
    descripcion: 'Remera de algodón premium con diseño minimalista',
    precio: 15000,
    descuento: 20,
    categoria: 'remeras',
    color: 'negro',
    talles: ['S', 'M', 'L', 'XL'],
    stock: { S: 10, M: 5, L: 8, XL: 3 },
    imagenPrincipal: '/products/remera-1.jpg',
    imagenes: ['/products/remera-1.jpg', '/products/remera-1-2.jpg'],
    featured: true,
    mercadoPagoId: 'MP_TEST_123',
  },
  {
    id: '2',
    nombre: 'Pantalón Cargo Gris',
    descripcion: 'Pantalón cargo con múltiples bolsillos',
    precio: 25000,
    categoria: 'pantalones',
    color: 'gris',
    talles: ['M', 'L', 'XL'],
    stock: { M: 2, L: 1, XL: 0 },
    imagenPrincipal: '/products/pantalon-1.jpg',
    imagenes: ['/products/pantalon-1.jpg'],
    featured: true,
    mercadoPagoId: 'MP_TEST_456',
  },
  {
    id: '3',
    nombre: 'Buzo con Capucha Azul',
    descripcion: 'Buzo cómodo y abrigado para todas las estaciones',
    precio: 30000,
    descuento: 15,
    categoria: 'buzos',
    color: 'azul',
    talles: ['S', 'M', 'L'],
    stock: { S: 7, M: 4, L: 6 },
    imagenPrincipal: '/products/buzo-1.jpg',
    imagenes: ['/products/buzo-1.jpg'],
    featured: true,
    mercadoPagoId: 'MP_TEST_789',
  },
]

export let banners: any[] = [
  {
    id: '1',
    imagen: '/banner-1.jpg',
    titulo: 'Nueva Colección',
    subtitulo: 'Descubrí las últimas tendencias',
    link: '/catalogo',
    orden: 1,
    activo: true,
  },
  {
    id: '2',
    imagen: '/banner-2.jpg',
    titulo: 'Ofertas Especiales',
    subtitulo: 'Hasta 50% OFF',
    link: '/catalogo?precio=asc',
    orden: 2,
    activo: true,
  },
]



