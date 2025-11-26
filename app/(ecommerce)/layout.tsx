// Layout de ecommerce - NO renderiza Navbar/Footer porque ya están en el layout raíz
// Esto evita duplicación del header
export default function EcommerceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
