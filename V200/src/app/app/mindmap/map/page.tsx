'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  useReactFlow,
  Handle,
  Position,
  BaseEdge,
  getStraightPath,
  useNodesState,
  useEdgesState,
  useInternalNode,
  MarkerType,
  type Node,
  type Edge,
  type EdgeProps,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/lib/theme'
import { AREAS, AREA_BY_ID, type AreaId } from '@/lib/mindmap-areas'
import { MindmapAreaCard, type AreaDetail, type Milestone } from '@/components/mindmap/MindmapAreaCard'

const SIZE: Record<string, { w: number; h: number }> = { hub: { w: 220, h: 64 }, area: { w: 331, h: 200 } }
const sizeFor = (id: string) => (id === 'hub' ? SIZE.hub : SIZE.area)
const HUB_LABEL = 'In 5 years…'
const R = 380
const MAP_W = 2 * R + SIZE.area.w
const MAP_H = 2 * R + SIZE.area.h
const MARGIN = 16

// ── Sample detail data (Supabase later) ─────────────────────────────────────
const SAMPLE_MILESTONES: Milestone[] = [
  { title: 'Become someone who maps systems they touch', actions: ['Document the workflows you discuss', 'Understand the difference between user flow and user journey', 'Adapt user journeys into your day-to-day work'] },
  { title: 'Become someone who talks to users every week', actions: ['DM one user each week with one open question', 'Observe a real user workflow end to end'] },
  { title: 'Become someone who ships in public', actions: ['Post one small build note each week', 'Ask for one piece of feedback every time'] },
  { title: 'Become someone who reflects on Sundays', actions: ['Write three lines on what moved', 'Pick the one thing for next week'] },
]
const PROGRESS: Record<AreaId, { done: number; total: number; n: number }> = {
  career: { done: 5, total: 12, n: 4 },
  health: { done: 8, total: 20, n: 3 },
  relationship: { done: 3, total: 10, n: 2 },
  personal: { done: 6, total: 16, n: 3 },
  finance: { done: 2, total: 12, n: 2 },
}
function detailFor(id: AreaId): AreaDetail {
  const p = PROGRESS[id]
  return { description: AREA_BY_ID[id].prompt, done: p.done, total: p.total, milestones: SAMPLE_MILESTONES.slice(0, p.n) }
}

// ── Radial layout ────────────────────────────────────────────────────────────
type Pt = { x: number; y: number }
function radialCenters(): Map<string, Pt> {
  const m = new Map<string, Pt>([['hub', { x: 0, y: 0 }]])
  AREAS.forEach((a, i) => {
    const ang = -Math.PI / 2 + i * ((2 * Math.PI) / AREAS.length)
    m.set(a.id, { x: Math.cos(ang) * R, y: Math.sin(ang) * R })
  })
  return m
}
// Hand-drawn arrows (Kate's), one per spoke, rotated to point outward.
// `nat` = each arrow's natural head angle (deg, 0=right, -90=up).
const ARROWS = [
  { src: '/mindmap/arrows/arrow1.svg', nat: -90, len: 118 }, // career — up
  { src: '/mindmap/arrows/arrow3.svg', nat: 0, len: 150 },   // health — swirly right
  { src: '/mindmap/arrows/arrow4.svg', nat: -45, len: 138 }, // relationship — up-right
  { src: '/mindmap/arrows/arrow5.svg', nat: 180, len: 138 }, // personal — left
  { src: '/mindmap/arrows/arrow2.svg', nat: -90, len: 118 }, // finance — up
]
const ARROW_BOX = 200
// Deterministic small tilt per area (sticker/hand-made vibe).
const TILT = [-2, 1.5, -1.5, 2, -1]

function buildNodes(): Node[] {
  const c = radialCenters()
  const tl = (id: string, p: Pt) => ({ x: p.x - sizeFor(id).w / 2, y: p.y - sizeFor(id).h / 2 })
  const arrows: Node[] = AREAS.map((a, i) => {
    const rad = ((-90 + i * 72) * Math.PI) / 180
    const r = 0.58 * R
    return {
      id: `arrow-${a.id}`, type: 'arrow',
      position: { x: Math.cos(rad) * r - ARROW_BOX / 2, y: Math.sin(rad) * r - ARROW_BOX / 2 },
      data: { src: ARROWS[i].src, rot: -90 + i * 72 - ARROWS[i].nat, len: ARROWS[i].len },
      draggable: false, selectable: false, zIndex: 0,
    }
  })
  return [
    ...arrows,
    { id: 'hub', type: 'hub', position: tl('hub', c.get('hub')!), data: {}, draggable: false, zIndex: 1 },
    ...AREAS.map((a, i) => ({ id: a.id, type: 'area', position: tl(a.id, c.get(a.id)!), data: { areaId: a.id, focused: false, maxH: 600, tilt: TILT[i] }, draggable: false, zIndex: 2 })),
  ]
}
function buildEdges(color: string): Edge[] {
  return AREAS.map(a => ({
    id: `e-${a.id}`, source: 'hub', target: a.id, type: 'floating',
    style: { stroke: color, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
  }))
}

// ── Nodes ────────────────────────────────────────────────────────────────────
function HubNode(_: NodeProps) {
  return (
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.5px', color: 'var(--green)', textAlign: 'center', width: SIZE.hub.w, userSelect: 'none' }}>
      {HUB_LABEL}
      <Handle type="source" position={Position.Top} style={{ opacity: 0 }} />
    </div>
  )
}
function AreaNode({ data }: NodeProps) {
  const d = data as { areaId: AreaId; focused?: boolean; maxH?: number; tilt?: number }
  const card = <MindmapAreaCard area={AREA_BY_ID[d.areaId]} detail={detailFor(d.areaId)} unfolded={!!d.focused} />
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {d.focused ? (
        <div className="nowheel nopan" style={{ width: 331, maxHeight: d.maxH ?? 600, overflowY: 'auto', borderRadius: 8 }}>
          {card}
        </div>
      ) : (
        <div style={{ transform: `rotate(${d.tilt ?? 0}deg)`, transition: 'transform 0.3s ease' }}>{card}</div>
      )}
    </>
  )
}

function ArrowNode({ data }: NodeProps) {
  const d = data as { src: string; rot: number; len: number }
  return (
    <div style={{ width: ARROW_BOX, height: ARROW_BOX, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.src} alt="" style={{ maxWidth: d.len, maxHeight: d.len, transform: `rotate(${d.rot}deg)`, opacity: 0.85 }} />
    </div>
  )
}

function nodeCenter(n: any): Pt {
  const p = n.internals?.positionAbsolute ?? n.position
  return { x: p.x + (n.measured?.width ?? sizeFor(n.id).w) / 2, y: p.y + (n.measured?.height ?? sizeFor(n.id).h) / 2 }
}
function FloatingEdge({ id, source, target, markerEnd, style }: EdgeProps) {
  const s = useInternalNode(source)
  const t = useInternalNode(target)
  if (!s || !t) return null
  const sc = nodeCenter(s), tc = nodeCenter(t)
  const dx = tc.x - sc.x, dy = tc.y - sc.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len, uy = dy / len
  const [path] = getStraightPath({ sourceX: sc.x + ux * 60, sourceY: sc.y + uy * 30, targetX: tc.x - ux * 110, targetY: tc.y - uy * 70 })
  return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
}

const nodeTypes = { hub: HubNode, area: AreaNode, arrow: ArrowNode }
const edgeTypes = { floating: FloatingEdge }

// ── Canvas ───────────────────────────────────────────────────────────────────
function Canvas({ focused, setFocused }: { focused: AreaId | null; setFocused: (id: AreaId | null) => void }) {
  const rf = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes())
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]) // hand-drawn arrows replace edges
  const [zoom, setZoom] = useState({ min: 0.3, max: 1.4 })

  // Zoom bounds: whole-map +16px (out) ↔ one card +16px (in).
  useEffect(() => {
    const recompute = () => {
      const vw = window.innerWidth, vh = window.innerHeight
      // zoom-in = one card + 16px each side (capped so desktop doesn't go huge)
      const max = Math.min((vw - 2 * MARGIN) / SIZE.area.w, 2)
      // zoom-out = whole map + 16px, but never upscale the map past native (≤1×)
      const fit = Math.min((vw - 2 * MARGIN) / MAP_W, (vh - 2 * MARGIN) / MAP_H)
      const min = Math.min(fit, 1)
      setZoom({ min: Math.min(min, max), max })
    }
    recompute()
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [])

  // Focus mode — fade siblings, unfold the tapped card, zoom to it.
  useEffect(() => {
    const vh = window.innerHeight
    const focusZoom = Math.min(zoom.max, 1.3)
    const maxH = (vh * 0.82) / focusZoom
    setNodes(ns => ns.map(n => {
      const isF = n.type === 'area' && (n.data as { areaId: AreaId }).areaId === focused
      const faded = focused != null && !isF
      return {
        ...n,
        data: n.type === 'area' ? { ...n.data, focused: isF, maxH } : n.data,
        style: { ...(n.style || {}), opacity: faded ? 0 : 1, transition: 'opacity 0.35s ease', pointerEvents: faded ? 'none' : 'auto' },
      }
    }))
    if (focused) {
      const c = radialCenters().get(focused)!
      rf.setCenter(c.x, c.y - SIZE.area.h / 2 + maxH / 2, { zoom: focusZoom, duration: 450 })
    } else {
      rf.fitView({ padding: 0.04, minZoom: zoom.min, maxZoom: zoom.max, duration: 450 })
    }
  }, [focused, zoom, rf, setNodes])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_, node) => { if (!focused && node.type === 'area') setFocused((node.data as { areaId: AreaId }).areaId) }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnPinch={!focused}
      panOnDrag={!focused}
      zoomOnDoubleClick={false}
      fitView
      fitViewOptions={{ padding: 0.04 }}
      minZoom={zoom.min}
      maxZoom={zoom.max}
      proOptions={{ hideAttribution: true }}
      style={{
        backgroundColor: '#faf7f2',
        // Notepad ruled-paper texture (fixed to the viewport).
        backgroundImage: 'repeating-linear-gradient(180deg, transparent 0, transparent 27px, rgba(58,111,168,0.10) 27px, rgba(58,111,168,0.10) 28px)',
      }}
    >
      {!focused && <Controls showInteractive={false} />}
    </ReactFlow>
  )
}

export default function MindmapMapPage() {
  const { setTheme } = useTheme()
  const [focused, setFocused] = useState<AreaId | null>(null)
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div style={{ width: '100%', height: '100dvh', position: 'relative' }}>
      <style>{`
        .react-flow__controls { box-shadow: 3px 4px 0 #d4cbbf; border: 1.5px solid var(--pink); border-radius: 8px; overflow: hidden; }
        .react-flow__controls-button { background: var(--card-bg); border-bottom: 1px solid var(--input-divider); color: var(--text-body); width: 30px; height: 30px; }
        .react-flow__controls-button:hover { background: #f3ede2; }
        .react-flow__controls-button svg { fill: var(--text-body); }
        .react-flow__node { cursor: pointer; }
        .react-flow__attribution { display: none; }
      `}</style>

      {/* Top-left: hint (map) / back (focus) */}
      {focused ? (
        <button
          onClick={() => setFocused(null)}
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 20, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--pink)', background: 'var(--card-bg)', border: '1.5px solid var(--pink)', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', filter: 'drop-shadow(2px 3px 0 #d4cbbf)' }}
        >
          ← Back to map
        </button>
      ) : (
        <p style={{ position: 'absolute', top: 18, left: 16, zIndex: 10, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-meta)', margin: 0, maxWidth: 180 }}>
          Tap an area to open it · pinch to zoom
        </p>
      )}

      <AnimatePresence>
        {!focused && (
          <motion.div initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="back">
            <Link
              href="/app/mindmap"
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-sub)', textDecoration: 'none', background: 'var(--card-bg)', border: '1.5px solid var(--pink)', borderRadius: 999, padding: '6px 12px', filter: 'drop-shadow(2px 3px 0 #d4cbbf)' }}
            >
              ← Back
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <ReactFlowProvider>
        <Canvas focused={focused} setFocused={setFocused} />
      </ReactFlowProvider>
    </div>
  )
}
