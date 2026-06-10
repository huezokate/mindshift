'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide } from 'd3-force'
import { useTheme } from '@/lib/theme'
import { AREAS, type AreaId } from '@/lib/mindmap-areas'
import { MindmapAreaCard } from '@/components/mindmap/MindmapAreaCard'

// Card sizes (used to convert center-points → top-left positions and to anchor edges).
const SIZE: Record<string, { w: number; h: number }> = { hub: { w: 220, h: 64 }, area: { w: 331, h: 150 } }
const sizeFor = (id: string) => (id === 'hub' ? SIZE.hub : SIZE.area)

// Demo data — milestone/action counts per area (Supabase later).
const STUB = { milestones: 7, actions: 21 }
const HUB_LABEL = 'In 5 years…'

// ── Layout strategies ───────────────────────────────────────────────────────
type Pt = { x: number; y: number }

function radialCenters(): Map<string, Pt> {
  const R = 360
  const m = new Map<string, Pt>([['hub', { x: 0, y: 0 }]])
  AREAS.forEach((a, i) => {
    const ang = -Math.PI / 2 + i * ((2 * Math.PI) / AREAS.length)
    m.set(a.id, { x: Math.cos(ang) * R, y: Math.sin(ang) * R })
  })
  return m
}

// Run the force sim headless (no animation) to get organic starting positions.
function organicCenters(): Map<string, Pt> {
  const nodes: any[] = [{ id: 'hub' }, ...AREAS.map(a => ({ id: a.id }))]
  const links: any[] = AREAS.map(a => ({ source: 'hub', target: a.id }))
  const sim = forceSimulation(nodes)
    .force('charge', forceManyBody().strength(-2600))
    .force('link', forceLink(links).id((d: any) => d.id).distance(340).strength(0.5))
    .force('center', forceCenter(0, 0))
    .force('collide', forceCollide(200))
    .stop()
  sim.tick(300)
  return new Map(nodes.map(n => [n.id, { x: n.x, y: n.y }]))
}

function centersToNodes(centers: Map<string, Pt>): Node[] {
  const tl = (id: string, c: Pt) => ({ x: c.x - sizeFor(id).w / 2, y: c.y - sizeFor(id).h / 2 })
  return [
    { id: 'hub', type: 'hub', position: tl('hub', centers.get('hub')!), data: {}, draggable: true },
    ...AREAS.map(a => ({
      id: a.id,
      type: 'area',
      position: tl(a.id, centers.get(a.id)!),
      data: { areaId: a.id },
    })),
  ]
}

function buildEdges(color: string): Edge[] {
  return AREAS.map(a => ({
    id: `e-${a.id}`,
    source: 'hub',
    target: a.id,
    type: 'floating',
    style: { stroke: color, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
  }))
}

// ── Custom nodes ────────────────────────────────────────────────────────────
function HubNode(_: NodeProps) {
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
      {HUB_LABEL}
      <Handle type="source" position={Position.Top} style={{ opacity: 0 }} />
    </div>
  )
}

function AreaNode({ data }: NodeProps) {
  const area = AREAS.find(a => a.id === (data as { areaId: AreaId }).areaId)!
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <MindmapAreaCard area={area} milestones={STUB.milestones} actions={STUB.actions} />
    </>
  )
}

// ── Floating edge (center-to-center, trimmed so the arrow lands at the card) ──
function nodeCenter(n: any): Pt {
  const p = n.internals?.positionAbsolute ?? n.position
  const w = n.measured?.width ?? sizeFor(n.id).w
  const h = n.measured?.height ?? sizeFor(n.id).h
  return { x: p.x + w / 2, y: p.y + h / 2 }
}

function FloatingEdge({ id, source, target, markerEnd, style }: EdgeProps) {
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
  // start just outside the hub text, stop near the card's near edge
  const [path] = getStraightPath({
    sourceX: sc.x + ux * 60,
    sourceY: sc.y + uy * 30,
    targetX: tc.x - ux * 95,
    targetY: tc.y - uy * 55,
  })
  return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
}

const nodeTypes = { hub: HubNode, area: AreaNode }
const edgeTypes = { floating: FloatingEdge }

// ── Canvas ──────────────────────────────────────────────────────────────────
function Canvas() {
  const [organic, setOrganic] = useState(false)
  const [edgeColor, setEdgeColor] = useState('#c0605a')
  const [nodes, setNodes, onNodesChange] = useNodesState(centersToNodes(radialCenters()))
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges('#c0605a'))

  // Read the themed connector color once mounted (token, so themes coordinate).
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement)
    const c = (cs.getPropertyValue('--map-edge') || cs.getPropertyValue('--pink')).trim()
    if (c) {
      setEdgeColor(c)
      setEdges(buildEdges(c))
    }
  }, [setEdges])

  const applyLayout = useCallback(
    (useOrganic: boolean) => {
      setOrganic(useOrganic)
      const centers = useOrganic ? organicCenters() : radialCenters()
      const next = centersToNodes(centers)
      const byId = new Map(next.map(n => [n.id, n.position]))
      setNodes(ns => ns.map(n => ({ ...n, position: byId.get(n.id) ?? n.position })))
    },
    [setNodes]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      minZoom={0.2}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
      style={{ background: 'var(--bg)' }}
    >
      <Background gap={28} size={1.4} color="var(--input-divider)" />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable nodeColor={() => edgeColor} maskColor="rgba(0,0,0,0.06)" />
      <LayoutToggle organic={organic} onChange={applyLayout} />
    </ReactFlow>
  )
}

function LayoutToggle({ organic, onChange }: { organic: boolean; onChange: (o: boolean) => void }) {
  const btn = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.3,
    padding: '8px 14px',
    borderRadius: 999,
    border: '1.5px solid var(--pink)',
    cursor: 'pointer',
    background: active ? 'var(--pink)' : 'var(--card-bg)',
    color: active ? '#fff' : 'var(--text-body)',
    boxShadow: active ? 'none' : '2px 3px 0 #d4cbbf',
    transition: 'background 0.15s, box-shadow 0.15s',
  })
  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: 14,
        zIndex: 10,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <button style={btn(!organic)} onClick={() => onChange(false)}>
        Radial
      </button>
      <button style={btn(organic)} onClick={() => onChange(true)}>
        Organic
      </button>
    </div>
  )
}

export default function MindmapMapPage() {
  const { setTheme } = useTheme()
  useEffect(() => {
    setTheme('notepad')
  }, [setTheme])

  return (
    <div style={{ width: '100%', height: '100dvh', position: 'relative' }}>
      <style>{`
        /* Smooth the Radial <-> Organic relayout; instant while dragging. */
        .react-flow__node { transition: transform 0.5s cubic-bezier(0.22,1,0.36,1); }
        .react-flow__node.dragging { transition: none; }
        .react-flow__node:active { cursor: grabbing; }
        /* Notepad-themed controls + minimap */
        .react-flow__controls { box-shadow: 3px 4px 0 #d4cbbf; border: 1.5px solid var(--pink); border-radius: 8px; overflow: hidden; }
        .react-flow__controls-button {
          background: var(--card-bg); border-bottom: 1px solid var(--input-divider);
          color: var(--text-body); width: 30px; height: 30px;
        }
        .react-flow__controls-button:hover { background: #f3ede2; }
        .react-flow__controls-button svg { fill: var(--text-body); }
        .react-flow__minimap { border: 1.5px solid var(--pink); border-radius: 8px; box-shadow: 3px 4px 0 #d4cbbf; }
        .react-flow__edge-path { stroke-linecap: round; }
        .react-flow__attribution { display: none; }
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
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  )
}
