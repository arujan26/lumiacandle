import { useState, useEffect } from 'react'
import type { CartItem, Product } from '../types'

const CART_KEY = 'lumia_cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

let _items: CartItem[] = loadCart()
const _listeners = new Set<() => void>()

function notify() {
  _listeners.forEach(fn => fn())
}

export const cart = {
  getItems: () => _items,
  subscribe: (fn: () => void) => {
    _listeners.add(fn)
    return () => { _listeners.delete(fn) }
  },
  add: (product: Product, qty = 1) => {
    const existing = _items.find(i => i.product.id === product.id)
    if (existing) {
      _items = _items.map(i =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
      )
    } else {
      _items = [..._items, { product, quantity: qty }]
    }
    saveCart(_items)
    notify()
  },
  remove: (productId: string) => {
    _items = _items.filter(i => i.product.id !== productId)
    saveCart(_items)
    notify()
  },
  updateQty: (productId: string, qty: number) => {
    if (qty <= 0) {
      cart.remove(productId)
      return
    }
    _items = _items.map(i =>
      i.product.id === productId ? { ...i, quantity: qty } : i
    )
    saveCart(_items)
    notify()
  },
  clear: () => {
    _items = []
    saveCart(_items)
    notify()
  },
  total: () => _items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  count: () => _items.reduce((sum, i) => sum + i.quantity, 0),
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(cart.getItems())
  useEffect(() => cart.subscribe(() => setItems([...cart.getItems()])), [])
  return items
}
