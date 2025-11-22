/**
 * Configuración de pnpm para autorizar lifecycle scripts de build
 * 
 * Este archivo autoriza que las siguientes dependencias ejecuten
 * sus scripts de postinstall durante el build en Vercel:
 * 
 * - core-js: Polyfills necesarios para cloudinary
 * - esbuild: Bundler usado por vite/vitest
 * - unrs-resolver: Resolver usado por eslint-import-resolver-typescript
 * 
 * Estas dependencias son seguras y necesarias para el funcionamiento
 * correcto de las herramientas de desarrollo y producción.
 */

function readPackage(pkg, context) {
  // Autorizar scripts de postinstall para dependencias específicas
  const allowedPackages = ['core-js', 'esbuild', 'unrs-resolver'];
  
  if (allowedPackages.includes(pkg.name)) {
    // Mantener los scripts de postinstall para estas dependencias
    return pkg;
  }
  
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};

