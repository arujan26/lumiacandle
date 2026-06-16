import { useEffect } from 'react'
import { listActiveFonts, fontFaceCss, fallbackFor, sanitizeFamily } from '../lib/fonts'

/**
 * Loads published custom fonts on the public site:
 * - injects auto-generated @font-face rules (font-display: swap)
 * - applies role overrides to brand CSS vars (global/headings/body/buttons)
 * - preloads only the active font files
 * Disabled/draft fonts are never fetched (RLS only returns active).
 */
export default function FontLoader() {
  useEffect(() => {
    let styleEl: HTMLStyleElement | null = null
    const links: HTMLLinkElement[] = []

    listActiveFonts().then(fonts => {
      if (!fonts.length) return
      const faces = fonts.map(fontFaceCss).join('\n')

      const roleVar: Record<string, string> = {}
      for (const f of fonts) {
        const stack = `'${sanitizeFamily(f.family_name)}', ${fallbackFor(f.category)}`
        if (f.role === 'global') { roleVar['--serif'] = stack; roleVar['--sans'] = stack; roleVar['--font-btn'] = stack }
        else if (f.role === 'headings') roleVar['--serif'] = stack
        else if (f.role === 'body') roleVar['--sans'] = stack
        else if (f.role === 'buttons') roleVar['--font-btn'] = stack
      }
      const vars = Object.entries(roleVar).map(([k, v]) => `${k}:${v};`).join('')

      styleEl = document.createElement('style')
      styleEl.setAttribute('data-lumia-fonts', '')
      styleEl.textContent = `${faces}${vars ? `\n:root{${vars}}` : ''}`
      document.head.appendChild(styleEl)

      for (const f of fonts) {
        const l = document.createElement('link')
        l.rel = 'preload'; l.as = 'font'; l.href = f.file_url; l.crossOrigin = 'anonymous'
        l.type = f.format === 'woff2' ? 'font/woff2' : f.format === 'woff' ? 'font/woff' : f.format === 'truetype' ? 'font/ttf' : 'font/otf'
        document.head.appendChild(l); links.push(l)
      }
    }).catch(() => {})

    return () => { styleEl?.remove(); links.forEach(l => l.remove()) }
  }, [])

  return null
}
