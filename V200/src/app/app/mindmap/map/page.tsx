'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useInternalNode,
  type Node,
  type Edge,
  type EdgeProps,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTheme } from '@/lib/theme'
import { AREAS, type AreaId } from '@/lib/mindmap-areas'
import type { SavedMap } from '@/lib/mindmap'
import { MindmapAreaCard } from '@/components/mindmap/MindmapAreaCard'

// Card sizes (used to convert center-points → top-left positions and to anchor arrows).
const SIZE: Record<string, { w: number; h: number }> = { hub: { w: 220, h: 64 }, area: { w: 331, h: 150 } }
const sizeFor = (id: string) => (id === 'hub' ? SIZE.hub : SIZE.area)

const HUB_LABEL = 'In 5 years…'

// Per-area milestone/action counts derived from the user's saved map.
type AreaCounts = Record<string, { milestones: number; actions: number }>
// A life area that's actually present on the saved map, + whether it's the primary focus.
type PresentArea = { id: AreaId; primary: boolean }

// Horizon label → the hub's framing phrase.
function hubLabelFor(horizonLabel: string | null): string {
  if (!horizonLabel) return HUB_LABEL
  const phrases: Record<string, string> = {
    'A month': 'In a month…',
    'A quarter': 'In a quarter…',
    'A year': 'In a year…',
    '5 years': 'In 5 years…',
  }
  return phrases[horizonLabel] ?? `By ${horizonLabel}…`
}

// ── Organic seeding ───────────────────────────────────────────────────────────
// Deterministic per-area hash → small position jitter + a tiny card tilt, so the
// layout reads hand-placed rather than CAD-perfect. Same id ⇒ same wobble, so
// nothing jumps between renders.
function seed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
function jitter(id: string, p: Pt): Pt {
  const h = seed(id)
  return { x: p.x + ((h % 37) - 18), y: p.y + (((h >> 5) % 27) - 13) }
}
function tiltFor(id: string): number {
  return ((seed(id) % 9) - 4) * 0.6 // ≈ −2.4°…+2.4°
}

// ── Layout ─────────────────────────────────────────────────────────────────-
// Hub (the time horizon) in the center. PRIMARY area above the hub. SUPPORTING
// areas spread along a row below the hub. Organic jitter keeps it from feeling rigid.
type Pt = { x: number; y: number }
const V_GAP = 250 // hub-center → row-center, vertically
const H_GAP = 372 // horizontal spacing between supporting cards (card 331 + gutter)

function layoutCenters(areas: PresentArea[]): Map<string, Pt> {
  const m = new Map<string, Pt>([['hub', { x: 0, y: 0 }]])
  const primary = areas.find(a => a.primary)
  const supporting = areas.filter(a => !a.primary)
  if (primary) m.set(primary.id, jitter(primary.id, { x: 0, y: -V_GAP }))
  const n = supporting.length
  supporting.forEach((a, i) => {
    const x = (i - (n - 1) / 2) * H_GAP
    m.set(a.id, jitter(a.id, { x, y: V_GAP }))
  })
  return m
}

function centersToNodes(
  centers: Map<string, Pt>,
  areas: PresentArea[],
  counts: AreaCounts,
  hubLabel: string
): Node[] {
  const tl = (id: string, c: Pt) => ({ x: c.x - sizeFor(id).w / 2, y: c.y - sizeFor(id).h / 2 })
  return [
    { id: 'hub', type: 'hub', position: tl('hub', centers.get('hub')!), data: { label: hubLabel }, draggable: true, zIndex: 1 },
    ...areas.map(a => ({
      id: a.id,
      type: 'area',
      position: tl(a.id, centers.get(a.id)!),
      data: {
        areaId: a.id,
        milestones: counts[a.id]?.milestones ?? 0,
        actions: counts[a.id]?.actions ?? 0,
        primary: a.primary,
        tilt: tiltFor(a.id),
      },
      zIndex: 2,
    })),
  ]
}

function buildEdges(areas: PresentArea[]): Edge[] {
  return areas.map(a => ({
    id: `e-${a.id}`,
    source: 'hub',
    target: a.id,
    type: 'sketchy',
    data: { seed: seed(a.id) },
  }))
}

// ── Custom nodes ────────────────────────────────────────────────────────────
function HubNode({ data }: NodeProps) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: '-0.5px',
        color: 'var(--green)',
        textAlign: 'center',
        width: SIZE.hub.w,
        userSelect: 'none',
      }}
    >
      {(data as { label?: string }).label ?? HUB_LABEL}
      <Handle type="source" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  )
}

function AreaNode({ data }: NodeProps) {
  const d = data as { areaId: AreaId; milestones?: number; actions?: number; primary?: boolean; tilt?: number }
  const area = AREAS.find(a => a.id === d.areaId)!
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {/* tilt wrapper is NOT overflow:hidden, so the card's --card-filter drop-shadow survives */}
      <div style={{ transform: `rotate(${d.tilt ?? 0}deg)` }}>
        <MindmapAreaCard
          area={area}
          milestones={d.milestones ?? 0}
          actions={d.actions ?? 0}
          selected={!!d.primary}
        />
      </div>
    </>
  )
}

// ── Sketchy (hand-drawn) edge ─────────────────────────────────────────────────
// A gently bowed bezier with a little wobble + an open, two-stroke arrowhead, so
// the connectors feel inked-by-hand for the notepad theme. Color comes straight
// from a token (resolves in the DOM), so all three themes coordinate for free.
function nodeCenter(n: ReturnType<typeof useInternalNode>): Pt {
  const node = n!
  const p = node.internals?.positionAbsolute ?? node.position
  const w = node.measured?.width ?? sizeFor(node.id).w
  const h = node.measured?.height ?? sizeFor(node.id).h
  return { x: p.x + w / 2, y: p.y + h / 2 }
}

// Point where a ray (from a box center, along ux/uy) crosses that box's border.
function boxBorder(c: Pt, hw: number, hh: number, ux: number, uy: number): Pt {
  const tx = hw / (Math.abs(ux) || 1e-6)
  const ty = hh / (Math.abs(uy) || 1e-6)
  const t = Math.min(tx, ty)
  return { x: c.x + ux * t, y: c.y + uy * t }
}

function SketchyEdge({ source, target, data }: EdgeProps) {
  const s = useInternalNode(source)
  const t = useInternalNode(target)
  if (!s || !t) return null

  const sc = nodeCenter(s)
  const tc = nodeCenter(t)
  const dx = tc.x - sc.x
  const dy = tc.y - sc.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len

  const sHalf = { w: (s.measured?.width ?? SIZE.hub.w) / 2, h: (s.measured?.height ?? SIZE.hub.h) / 2 }
  const tHalf = { w: (t.measured?.width ?? SIZE.area.w) / 2, h: (t.measured?.height ?? SIZE.area.h) / 2 }

  // Start just outside the hub; stop just shy of the card's near border.
  const sb = boxBorder(sc, sHalf.w, sHalf.h, ux, uy)
  const tb = boxBorder(tc, tHalf.w, tHalf.h, -ux, -uy)
  const sx = sb.x + ux * 4
  const sy = sb.y + uy * 4
  const ex = tb.x - ux * 8
  const ey = tb.y - uy * 8

  // Bowed bezier — perpendicular offset + a little asymmetric wobble.
  const sd = (data as { seed?: number })?.seed ?? 0
  const px = -uy
  const py = ux
  const bow = (sd % 2 ? 1 : -1) * Math.min(34, len * 0.13)
  const wob = ((sd >> 2) % 2 ? 1 : -1) * 7
  const c1x = sx + ux * len * 0.33 + px * (bow + wob)
  const c1y = sy + uy * len * 0.33 + py * (bow + wob)
  const c2x = sx + ux * len * 0.66 + px * (bow - wob)
  const c2y = sy + uy * len * 0.66 + py * (bow - wob)
  const line = `M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`

  // Arrowhead — aimed along the incoming tangent (end − last control point).
  const tax = ex - c2x
  const tay = ey - c2y
  const back = Math.atan2(-tay, -tax)
  const SP = 0.5 // barb spread (rad)
  const HL = 13 // barb length
  const h1 = `M ${ex},${ey} L ${ex + Math.cos(back + SP) * HL},${ey + Math.sin(back + SP) * HL}`
  const h2 = `M ${ex},${ey} L ${ex + Math.cos(back - SP) * HL},${ey + Math.sin(back - SP) * HL}`

  const stroke = 'var(--map-edge, var(--pink))'
  return (
    <g style={{ pointerEvents: 'none' }} fill="none" stroke={stroke} strokeWidth={2.25} strokeLinecap="round">
      <path d={line} />
      <path d={h1} />
      <path d={h2} />
    </g>
  )
}

const nodeTypes = { hub: HubNode, area: AreaNode }
const edgeTypes = { sketchy: SketchyEdge }

// ── Canvas ──────────────────────────────────────────────────────────────────
function Canvas({ areas, counts, hubLabel }: { areas: PresentArea[]; counts: AreaCounts; hubLabel: string }) {
  const [nodes, , onNodesChange] = useNodesState(centersToNodes(layoutCenters(areas), areas, counts, hubLabel))
  const [edges, , onEdgesChange] = useEdgesState(buildEdges(areas))

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.2}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
      style={{ background: 'var(--bg)' }}
    >
      <Background gap={28} size={1.4} color="var(--input-divider)" />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}

// Gentle empty state when the map has no goals yet.
function EmptyState() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 360,
          textAlign: 'center',
          background: 'var(--card-bg)',
          border: '1.5px solid var(--pink)',
          borderLeft: '4px solid var(--pink)',
          borderRadius: 'var(--card-radius)',
          filter: 'var(--card-filter, none)',
          padding: '28px 24px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.4px',
            color: 'var(--text-h1)',
            margin: '0 0 8px',
          }}
        >
          Your map is empty
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: '20px',
            color: 'var(--text-sub)',
            margin: '0 0 18px',
          }}
        >
          Pick a focus and a few supporting areas, and they’ll show up here as a map.
        </p>
        <Link
          href="/app/mindmap/new"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-btn)',
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--btn-color)',
            background: 'var(--btn-bg)',
            border: '1.5px solid var(--text-h1)',
            borderRadius: 'var(--btn-radius)',
            filter: 'var(--btn-filter, none)',
            padding: '9px 16px',
            textDecoration: 'none',
          }}
        >
          Start a map
        </Link>
      </div>
    </div>
  )
}

export default function MindmapMapPage() {
  const { setTheme } = useTheme()
  useEffect(() => {
    setTheme('notepad')
  }, [setTheme])

  // Pull the saved map → present areas (+ which is primary), per-area counts, hub framing.
  const [areas, setAreas] = useState<PresentArea[]>([])
  const [counts, setCounts] = useState<AreaCounts>({})
  const [hubLabel, setHubLabel] = useState<string>(HUB_LABEL)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/mindmap/maps')
      .then(r => (r.ok ? r.json() : { maps: [] }))
      .then((res: { maps?: SavedMap[] }) => {
        if (!active) return
        const map = res?.maps?.[0]
        const goals = map?.goals ?? []

        // counts per category
        const nextCounts: AreaCounts = {}
        for (const g of goals) {
          const cur = nextCounts[g.category] ?? { milestones: 0, actions: 0 }
          cur.milestones += g.milestones.length
          cur.actions += g.milestones.filter(ms => ms.firstAction).length
          nextCounts[g.category] = cur
        }

        // present areas, primary = the position-0 goal's category (fallback: first goal)
        const byPosition = [...goals].sort((a, b) => a.position - b.position)
        const primaryCat = (byPosition.find(g => g.position === 0) ?? byPosition[0])?.category
        const seen = new Set<AreaId>()
        const nextAreas: PresentArea[] = []
        for (const g of byPosition) {
          if (seen.has(g.category)) continue
          seen.add(g.category)
          nextAreas.push({ id: g.category, primary: g.category === primaryCat })
        }

        setCounts(nextCounts)
        setAreas(nextAreas)
        if (map) setHubLabel(hubLabelFor(map.horizonLabel))
        setLoaded(true)
      })
      .catch(() => {
        if (active) setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100dvh', position: 'relative' }}>
      <style>{`
        .react-flow__controls { border: 1.5px solid var(--pink); border-radius: 8px; overflow: hidden; box-shadow: none; }
        .react-flow__controls-button { background: var(--card-bg); border-bottom: 1px solid var(--input-divider); color: var(--text-body); width: 30px; height: 30px; }
        .react-flow__controls-button svg { fill: var(--text-body); }
      `}</style>
      <Link
        href="/app/mindmap"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--text-sub)',
          textDecoration: 'none',
          background: 'var(--card-bg)',
          border: '1.5px solid var(--pink)',
          borderRadius: 999,
          padding: '6px 12px',
        }}
      >
        ← Back
      </Link>
      {loaded && areas.length === 0 ? (
        <EmptyState />
      ) : (
        <ReactFlowProvider>
          <Canvas
            key={areas.map(a => a.id).join(',')}
            areas={areas}
            counts={counts}
            hubLabel={hubLabel}
          />
        </ReactFlowProvider>
      )}
    </div>
  )
}
