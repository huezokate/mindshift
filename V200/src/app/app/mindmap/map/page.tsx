'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
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
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/lib/theme'
import { AREAS, AREA_BY_ID, type AreaId } from '@/lib/mindmap-areas'
import { MindmapAreaCard, type AreaDetail, type Milestone } from '@/components/mindmap/MindmapAreaCard'

const SIZE: Record<string, { w: number; h: number }> = { hub: { w: 220, h: 64 }, area: { w: 331, h: 200 } }
const sizeFor = (id: string) => (id === 'hub' ? SIZE.hub : SIZE.area)
const HUB_LABEL = 'In 5 years…'

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
  const R = 380
  const m = new Map<string, Pt>([['hub', { x: 0, y: 0 }]])
  AREAS.forEach((a, i) => {
    const ang = -Math.PI / 2 + i * ((2 * Math.PI) / AREAS.length)
    m.set(a.id, { x: Math.cos(ang) * R, y: Math.sin(ang) * R })
  })
  return m
}
function buildNodes(): Node[] {
  const c = radialCenters()
  const tl = (id: string, p: Pt) => ({ x: p.x - sizeFor(id).w / 2, y: p.y - sizeFor(id).h / 2 })
  return [
    { id: 'hub', type: 'hub', position: tl('hub', c.get('hub')!), data: {}, draggable: false },
    ...AREAS.map(a => ({ id: a.id, type: 'area', position: tl(a.id, c.get(a.id)!), data: { areaId: a.id }, draggable: false })),
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
  const id = (data as { areaId: AreaId }).areaId
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <MindmapAreaCard area={AREA_BY_ID[id]} detail={detailFor(id)} />
    </>
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

const nodeTypes = { hub: HubNode, area: AreaNode }
const edgeTypes = { floating: FloatingEdge }

// ── Canvas ───────────────────────────────────────────────────────────────────
function Canvas({ onOpen }: { onOpen: (id: AreaId) => void }) {
  const [edgeColor, setEdgeColor] = useState('#c0605a')
  const [nodes, , onNodesChange] = useNodesState(buildNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges('#c0605a'))

  useEffect(() => {
    const cs = getComputedStyle(document.documentElement)
    const c = (cs.getPropertyValue('--map-edge') || cs.getPropertyValue('--pink')).trim()
    if (c) { setEdgeColor(c); setEdges(buildEdges(c)) }
  }, [setEdges])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_, node) => { if (node.type === 'area') onOpen((node.data as { areaId: AreaId }).areaId) }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnPinch
      panOnDrag
      fitView
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      style={{ background: 'var(--bg)' }}
    >
      <Background gap={28} size={1.4} color="var(--input-divider)" />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable nodeColor={() => edgeColor} maskColor="rgba(0,0,0,0.06)" />
    </ReactFlow>
  )
}

// ── Tap-to-open detail overlay ───────────────────────────────────────────────
function DetailOverlay({ areaId, onClose }: { areaId: AreaId; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(30,30,64,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 18, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: -14, right: -10, zIndex: 1, width: 34, height: 34, borderRadius: '50%', background: 'var(--card-bg)', border: '1.5px solid var(--pink)', color: 'var(--pink)', cursor: 'pointer', fontSize: 18, lineHeight: 1, filter: 'drop-shadow(2px 3px 0 #d4cbbf)' }}
        >
          ×
        </button>
        <MindmapAreaCard area={AREA_BY_ID[areaId]} detail={detailFor(areaId)} unfolded />
      </motion.div>
    </motion.div>
  )
}

export default function MindmapMapPage() {
  const { setTheme } = useTheme()
  const [openArea, setOpenArea] = useState<AreaId | null>(null)
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div style={{ width: '100%', height: '100dvh', position: 'relative' }}>
      <style>{`
        .react-flow__controls { box-shadow: 3px 4px 0 #d4cbbf; border: 1.5px solid var(--pink); border-radius: 8px; overflow: hidden; }
        .react-flow__controls-button { background: var(--card-bg); border-bottom: 1px solid var(--input-divider); color: var(--text-body); width: 30px; height: 30px; }
        .react-flow__controls-button:hover { background: #f3ede2; }
        .react-flow__controls-button svg { fill: var(--text-body); }
        .react-flow__minimap { border: 1.5px solid var(--pink); border-radius: 8px; box-shadow: 3px 4px 0 #d4cbbf; }
        .react-flow__node { cursor: pointer; }
        .react-flow__attribution { display: none; }
      `}</style>

      <Link
        href="/app/mindmap"
        style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-sub)', textDecoration: 'none', background: 'var(--card-bg)', border: '1.5px solid var(--pink)', borderRadius: 999, padding: '6px 12px', filter: 'drop-shadow(2px 3px 0 #d4cbbf)' }}
      >
        ← Back
      </Link>
      <p style={{ position: 'absolute', top: 18, left: 16, zIndex: 10, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-meta)', margin: 0, maxWidth: 180 }}>
        Tap an area to open it · pinch to zoom
      </p>

      <ReactFlowProvider>
        <Canvas onOpen={setOpenArea} />
      </ReactFlowProvider>

      <AnimatePresence>
        {openArea && <DetailOverlay areaId={openArea} onClose={() => setOpenArea(null)} />}
      </AnimatePresence>
    </div>
  )
}
