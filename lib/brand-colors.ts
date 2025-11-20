/**
 * Colores oficiales del branding "ASÍ SOMOS"
 * 
 * Estos colores deben usarse consistentemente en todo el proyecto
 * para mantener la identidad visual del brand.
 */

export const BRAND_COLORS = {
  primary: '#7452A8',    // Violeta pastel intenso
  secondary: '#F7E8B5',  // Crema / amarillo pastel claro
} as const

export type BrandColor = typeof BRAND_COLORS[keyof typeof BRAND_COLORS]

/**
 * Utilidades para trabajar con los colores del brand
 */
export const brandUtils = {
  /**
   * Obtiene el color primario
   */
  getPrimary: () => BRAND_COLORS.primary,
  
  /**
   * Obtiene el color secundario
   */
  getSecondary: () => BRAND_COLORS.secondary,
  
  /**
   * Verifica si un color es parte de la paleta oficial
   */
  isBrandColor: (color: string): boolean => {
    return Object.values(BRAND_COLORS).includes(color as BrandColor)
  },
}

