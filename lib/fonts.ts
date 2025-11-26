/**
 * Configuración de fuentes usando next/font/google
 * Esto evita problemas de CSP y mejora el rendimiento
 * Las fuentes se sirven desde el propio dominio
 */
import {
  Inter,
  Roboto,
  Poppins,
  Montserrat,
  Open_Sans,
  Lato,
  Raleway,
  Nunito,
  Source_Sans_3,
  Playfair_Display,
} from 'next/font/google'

// Fuente principal: Inter
export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
})

// Fuente secundaria: Roboto
export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto',
})

// Fuente alternativa: Poppins
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins',
})

// Fuente alternativa: Montserrat
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-montserrat',
})

// Fuente alternativa: Open Sans
export const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-open-sans',
})

// Fuente alternativa: Lato
export const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  display: 'swap',
  variable: '--font-lato',
})

// Fuente alternativa: Raleway
export const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-raleway',
})

// Fuente alternativa: Nunito
export const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito',
})

// Fuente alternativa: Source Sans 3
export const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
  variable: '--font-source-sans-3',
})

// Fuente decorativa: Playfair Display
export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-playfair-display',
})

// Variable CSS combinada para usar en className
export const fontVariables = [
  inter.variable,
  roboto.variable,
  poppins.variable,
  montserrat.variable,
  openSans.variable,
  lato.variable,
  raleway.variable,
  nunito.variable,
  sourceSans3.variable,
  playfairDisplay.variable,
].join(' ')
