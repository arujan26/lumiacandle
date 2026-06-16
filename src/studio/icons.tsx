import type { CSSProperties, ReactNode } from 'react'

export type IconName =
  | 'home' | 'builder' | 'pages' | 'media' | 'theme' | 'products' | 'orders'
  | 'customers' | 'seo' | 'performance' | 'security' | 'settings' | 'audit'
  | 'bell' | 'command' | 'search' | 'plus' | 'sparkles' | 'chevronRight'
  | 'check' | 'mail' | 'arrowUp' | 'arrowDown' | 'monitor' | 'mobile'
  | 'zoomIn' | 'zoomOut' | 'eye' | 'dot' | 'logout' | 'external' | 'ticket'
  | 'calendar' | 'bolt'

export function Icon({ name, size = 18, style, strokeWidth = 1.7 }: { name: IconName; size?: number; style?: CSSProperties; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {paths(name)}
    </svg>
  )
}

function paths(n: IconName): ReactNode {
  switch (n) {
    case 'home': return <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>
    case 'builder': return <><rect x="3" y="3" width="18" height="18" rx="2.2" /><path d="M9 3v18M3 9h6" /></>
    case 'pages': return <><path d="M6 2.5h8l4 4V21.5H6z" /><path d="M14 2.5V7h4" /></>
    case 'media': return <><rect x="3" y="4" width="18" height="16" rx="2.2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M21 16l-5-5L5 20" /></>
    case 'theme': return <><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="9" r="1" /><circle cx="15.5" cy="9" r="1" /><circle cx="9" cy="15" r="1" /></>
    case 'products': return <><path d="M3 7.5 12 3l9 4.5v9L12 21 3 16.5z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></>
    case 'orders': return <><path d="M6 7h12l-1 13H7z" /><path d="M9 7a3 3 0 0 1 6 0" /></>
    case 'customers': return <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 5.5a3 3 0 0 1 0 5M21 20a5.5 5.5 0 0 0-4-5.3" /></>
    case 'seo': return <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>
    case 'performance': return <><path d="M12 21a9 9 0 1 1 9-9" /><path d="M12 12l4-3" /></>
    case 'security': return <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9.5 12l1.8 1.8 3.5-3.6" /></>
    case 'settings': return <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19 5l-2 2M7 17l-2 2M19 19l-2-2M7 7 5 5" /></>
    case 'audit': return <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>
    case 'bell': return <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></>
    case 'command': return <><path d="M9 6a2.5 2.5 0 1 0-2.5 2.5H9V6zM15 6a2.5 2.5 0 1 1 2.5 2.5H15V6zM9 18a2.5 2.5 0 1 1-2.5-2.5H9V18zM15 18a2.5 2.5 0 1 0 2.5-2.5H15V18z" /><rect x="9" y="9" width="6" height="6" /></>
    case 'search': return <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>
    case 'plus': return <path d="M12 5v14M5 12h14" />
    case 'sparkles': return <><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" /><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" /></>
    case 'chevronRight': return <path d="M9 6l6 6-6 6" />
    case 'check': return <path d="M5 12.5l4.5 4.5L19 7" />
    case 'mail': return <><rect x="3" y="5" width="18" height="14" rx="2.2" /><path d="M4 7l8 6 8-6" /></>
    case 'arrowUp': return <path d="M12 19V5M6 11l6-6 6 6" />
    case 'arrowDown': return <path d="M12 5v14M6 13l6 6 6-6" />
    case 'monitor': return <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>
    case 'mobile': return <><rect x="7" y="3" width="10" height="18" rx="2.4" /><path d="M11 18h2" /></>
    case 'zoomIn': return <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5M11 8v6M8 11h6" /></>
    case 'zoomOut': return <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5M8 11h6" /></>
    case 'eye': return <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.5" /></>
    case 'dot': return <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    case 'logout': return <><path d="M14 4h5v16h-5" /><path d="M3 12h12M11 8l4 4-4 4" /></>
    case 'external': return <><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v6H4V6h6" /></>
    case 'ticket': return <><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" /><path d="M15 6v12" /></>
    case 'calendar': return <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>
    case 'bolt': return <path d="M13 3L5 13h5l-1 8 8-10h-5z" />
  }
}
