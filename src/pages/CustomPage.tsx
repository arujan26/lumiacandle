import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchPublishedPage, Blocks, type PageRow } from '../lib/blocks'

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<PageRow | null | undefined>(undefined)

  useEffect(() => {
    setPage(undefined)
    if (slug) fetchPublishedPage(slug).then(p => setPage(p))
  }, [slug])

  if (page === undefined) return <div style={{ minHeight: '60vh' }} />
  if (!page) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <span className="eyebrow">404</span>
      <h2>Page not found</h2>
      <Link to="/" className="btn btn-dark">Back home</Link>
    </div>
  )
  return <div style={{ background: 'var(--white)' }}><Blocks blocks={page.blocks} /></div>
}
