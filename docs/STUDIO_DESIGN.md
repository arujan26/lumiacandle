# Lumia Studio — Dashboard Design System

A premium, dark, SaaS-grade admin/visual-builder. Reference feel: Linear · Vercel · Framer · Figma. Not a generic admin template.

## 1. Design tokens

### Color (dark mode default)
| Token | Value | Use |
|---|---|---|
| `--st-bg` | #0A0A0C | App canvas (base) |
| `--st-bg-1` | #101013 | Panels / sidebar |
| `--st-bg-2` | #161619 | Cards / elevated |
| `--st-bg-3` | #1D1D22 | Hover / active row |
| `--st-glass` | rgba(16,16,19,.72) + blur(14px) | Topbar, command palette, drawers |
| `--st-border` | rgba(255,255,255,.08) | Hairline borders |
| `--st-border-2` | rgba(255,255,255,.14) | Hover / focus border |
| `--st-text` | #F3F3F6 | Primary text |
| `--st-text-2` | #A2A2AD | Secondary |
| `--st-text-3` | #67676F | Muted / hints |
| `--st-accent` | #C9A86A | Brand champagne — single accent, used sparingly |
| `--st-accent-soft` | rgba(201,168,106,.14) | Accent fills/selection |
| `--st-live` | #4ADE80 | Live status |
| `--st-pending` | #E6B450 | Changes-pending status |
| `--st-draft` | #8A8A94 | Draft status |
| `--st-danger` | #F0726B | Destructive |

### Type — Inter (UI grotesk), JetBrains Mono (values)
- Display 22/600, H1 18/600, H2 15/600, Body 13.5/400, Label 12/500, Micro 11/500 uppercase .08em.
- Two weights in body: 400 / 500. 600 only for headings.

### Space / radius / motion
- Spacing scale: 4 · 8 · 12 · 16 · 24 · 32 · 48.
- Radius: sm 7 (controls) · md 10 (cards) · lg 14 (modals) · pill 999.
- Shadow: hairline `inset 0 1px 0 rgba(255,255,255,.04)`; overlay `0 16px 50px rgba(0,0,0,.5)`.
- Motion (Framer): enter `y:6,opacity:0 → 0`, 180ms `easeOut`; hover scale 1.02; press 0.98; stagger 24ms.

## 2. Layout hierarchy
```
StudioShell
├─ RailSidebar (60px, icon nav + tooltips)
├─ Main
│  ├─ Topbar (glass): Breadcrumbs · StatusPill · ⌘K Search · Avatar/actions
│  ├─ Content (per screen)
│  └─ BottomBar: Zoom · Device toggle · Autosave · Publish
├─ RightPanel (Properties — builder context only, 280px)
└─ Overlays: CommandPalette ⌘K · Toasts · Modal · Drawer · Tooltips
```

## 3. Component map
Shell: `RailSidebar` · `RailIcon` · `Topbar` · `Breadcrumbs` · `StatusPill` · `SearchTrigger` · `BottomBar` · `RightPanel` · `PropertyGroup` · `Control(slider|color|select|segmented|toggle)`.
Overlays: `CommandPalette` · `Toast/Toaster` · `Modal` · `Drawer` · `Tooltip`.
Data: `StatCard` · `MiniChart` · `ActivityFeed` · `DataTable` · `Skeleton` · `EmptyState`.
Builder: `Canvas` · `Ruler` · `Guide` · `SelectionBox` · `LayersPanel` · `LayerRow` · `DeviceFrame` · `BreakpointBar`.

## 4. Screens (15)
1. **Home** — analytics (KPIs, revenue chart, activity, publish status)
2. **Visual Builder** — canvas + layers + properties + breakpoints
3. **Pages** — page list / SEO status / draft·live
4. **Media Studio** — asset grid, focal-point, optimize
5. **Theme Studio** — tokens, palette gen, font pairing, scales
6. **Products** — catalog (candles/stickers), stock
7. **Events** · 8. **Tickets/QR** · 9. **Orders** · 10. **Customers**
11. **SEO Center** · 12. **Performance** · 13. **Security** · 14. **Settings** · 15. **Audit Log**

## 5. UI states (every data surface)
`loading` → skeleton · `empty` → premium empty state w/ CTA · `error` → inline retry · `ready` · `saving` → inline spinner + autosave chip · `success` → toast.

## 6. Core user flow
Login → Home (status: Live/Draft/Pending) → pick screen via rail or ⌘K → edit → autosave (draft) → "Changes pending" → Publish checklist → Live → Audit log entry.

## 7. Build order
Phase 1 (this pass): tokens + Shell + Command palette + Home (mock data). Phase 2: Builder canvas + Properties. Phase 3: remaining screens. Phase 4: wire to Supabase (replace mock).
