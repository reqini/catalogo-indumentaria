import { 
  Shirt, 
  Users, 
  Baby, 
  Footprints, 
  Dumbbell, 
  Sparkles,
  ShoppingBag,
  Gift,
  LucideProps
} from 'lucide-react'

export interface CategoryIcon {
  name: string
  icon: React.ComponentType<LucideProps>
  slug: string
}

export const categoryIcons: CategoryIcon[] = [
  { name: 'Remeras', icon: Shirt, slug: 'remeras' },
  { name: 'Pantalones', icon: Users, slug: 'pantalones' },
  { name: 'Buzos', icon: ShoppingBag, slug: 'buzos' },
  { name: 'Zapatillas', icon: Footprints, slug: 'zapatillas' },
  { name: 'Running', icon: Footprints, slug: 'running' },
  { name: 'Training', icon: Dumbbell, slug: 'training' },
  { name: 'Lifestyle', icon: Sparkles, slug: 'lifestyle' },
  { name: 'Kids', icon: Baby, slug: 'kids' },
  { name: 'Accesorios', icon: Gift, slug: 'accesorios' },
  { name: 'Outdoor', icon: Footprints, slug: 'outdoor' },
]

export function getCategoryIcon(categoria: string | undefined): CategoryIcon | null {
  if (!categoria) return null
  
  const normalized = categoria.toLowerCase().trim()
  return categoryIcons.find(cat => 
    cat.slug === normalized || 
    cat.name.toLowerCase() === normalized
  ) || null
}

export function CategoryIconComponent({ 
  categoria, 
  size = 20, 
  className = '' 
}: { 
  categoria: string | undefined
  size?: number | string
  className?: string 
}) {
  const iconData = getCategoryIcon(categoria)
  
  if (!iconData) {
    return <ShoppingBag size={size} className={className} />
  }
  
  const Icon = iconData.icon
  return <Icon size={size} className={className} />
}

