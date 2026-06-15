export interface Product {
  id: string
  name: string
  emotion: string
  fragrance: string
  description: string
  long_description: string
  price: number
  image_url: string
  badge?: string
  burn_time?: string
  wax?: string
  size?: string
  for_text?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id?: string
  name: string
  email: string
  phone?: string
  preferred_contact: string
  address: string
  city: string
  state?: string
  zip: string
  country: string
  notes?: string
  items: CartItem[]
  subtotal: number
  status?: string
  created_at?: string
}
