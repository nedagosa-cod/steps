import React, { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

import ScreenNode from './components/ScreenNode'
import NodeConfigPanel from './components/NodeConfigPanel'
import PreviewMode from './components/PreviewMode'

import { Monitor, Play, Plus, Layers, Settings2, Trash2, GitBranch } from 'lucide-react'

// ------------------------------------------------------------------
// Node type registry (must be stable — defined outside component)
// ------------------------------------------------------------------
const nodeTypes = { screenNode: ScreenNode }

// ------------------------------------------------------------------
// Edge defaults
// ------------------------------------------------------------------
const edgeDefaults = {
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, color: '#6e40c9' },
  style: { stroke: '#6e40c9', strokeWidth: 2.5 },
}

// ------------------------------------------------------------------
// App
// ------------------------------------------------------------------
let nodeCounter = 1

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [isPreview, setIsPreview] = useState(false)

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, ...edgeDefaults }, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const addScreenNode = useCallback(() => {
    const id = `node-${nodeCounter++}`
    const newNode = {
      id,
      type: 'screenNode',
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: {
        label: `Pantalla ${nodeCounter - 1}`,
        image: null,
        triggerType: 'click',
        validationValue: '',
        hotspot: { x: 40, y: 40, w: 20, h: 20 },
      },
    }
    setNodes((nds) => [...nds, newNode])
    setSelectedNode(newNode)
  }, [setNodes])

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    )
    setSelectedNode(null)
  }, [selectedNode, setNodes, setEdges])

  const onUpdateNode = useCallback((id, patch) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
      )
    )
    // Keep selectedNode in sync
    setSelectedNode((prev) =>
      prev?.id === id ? { ...prev, data: { ...prev.data, ...patch } } : prev
    )
  }, [setNodes])

  // When nodes change externally (drag, etc.) keep selectedNode reference fresh
  const onNodesChangeWrapped = useCallback((changes) => {
    onNodesChange(changes)
    // If position changed for the selected node, update its data reference slightly
    // (no-op — ReactFlow keeps the data stable so node config still applies)
  }, [onNodesChange])

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d1117] font-sans">
      {/* Preview overlay */}
      {isPreview && (
        <PreviewMode
          nodes={nodes}
          edges={edges}
          onExit={() => setIsPreview(false)}
        />
      )}

      {/* ── LEFT TOOLBAR ── */}
      <aside className="flex flex-col gap-3 w-[68px] bg-[#161b22] border-r border-[#30363d] items-center py-4 z-10 shrink-0">
        {/* Logo */}
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#6e40c9] to-[#7c3aed] shadow-lg mb-4">
          <GitBranch size={18} className="text-white" />
        </div>

        <Divider />

        {/* Add node */}
        <ToolButton
          onClick={addScreenNode}
          title="Añadir pantalla"
          icon={<Plus size={18} />}
          active={false}
        />

        <Divider />

        {/* Stats: node count */}
        <div className="flex flex-col items-center gap-0.5 mt-1">
          <span className="text-xs font-bold text-[#e6edf3]">{nodes.length}</span>
          <span className="text-[9px] text-[#484f58] uppercase tracking-wider">nodos</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-bold text-[#e6edf3]">{edges.length}</span>
          <span className="text-[9px] text-[#484f58] uppercase tracking-wider">links</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Delete selected */}
        {selectedNode && (
          <ToolButton
            onClick={deleteSelectedNode}
            title="Eliminar nodo seleccionado"
            icon={<Trash2 size={18} />}
            danger
          />
        )}
      </aside>

      {/* ── MAIN CANVAS ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 h-12 border-b border-[#30363d] bg-[#161b22] shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-tight text-[#e6edf3]">SimuBuild</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#6e40c9]/20 text-[#a78bfa] border border-[#6e40c9]/30">
              Editor
            </span>
          </div>

          <div className="flex items-center gap-2">
            {nodes.length === 0 && (
              <span className="text-xs text-[#484f58]">Añade una pantalla para empezar →</span>
            )}
            <button
              onClick={addScreenNode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:border-[#484f58] transition-all"
            >
              <Plus size={13} />
              Nueva pantalla
            </button>

            <button
              onClick={() => nodes.length > 0 && setIsPreview(true)}
              disabled={nodes.length === 0}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${nodes.length > 0
                  ? 'bg-[#6e40c9] hover:bg-[#7c3aed] text-white shadow-[0_0_14px_rgba(110,64,201,0.4)]'
                  : 'bg-[#21262d] text-[#484f58] cursor-not-allowed'
                }`}
            >
              <Play size={13} />
              Preview
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWrapped}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            defaultEdgeOptions={edgeDefaults}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="#21262d"
            />
            <Controls />
            <MiniMap
              nodeColor="#6e40c9"
              maskColor="rgba(13,17,23,0.8)"
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#6e40c9]/20 to-[#7c3aed]/5 border border-[#30363d] flex items-center justify-center">
                <Layers size={32} className="text-[#6e40c9]" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-[#e6edf3]">Tu canvas está vacío</p>
                <p className="text-sm text-[#8b949e] mt-1">Haz clic en <strong className="text-[#a78bfa]">Nueva pantalla</strong> para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── RIGHT CONFIG PANEL ── */}
      <aside className="w-[280px] bg-[#161b22] border-l border-[#30363d] flex flex-col shrink-0 z-10">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d]">
          <Settings2 size={14} className="text-[#6e40c9]" />
          <span className="text-xs font-semibold text-[#e6edf3]">Configuración</span>
          {selectedNode && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
              {selectedNode.id}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <NodeConfigPanel
            node={selectedNode}
            onUpdateNode={onUpdateNode}
          />
        </div>
      </aside>
    </div>
  )
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function ToolButton({ onClick, icon, title, active = false, danger = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${danger
          ? 'text-red-400 hover:bg-red-500/15 hover:text-red-300'
          : active
            ? 'bg-[#6e40c9]/20 text-[#a78bfa]'
            : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]'
        }`}
    >
      {icon}
    </button>
  )
}

function Divider() {
  return <div className="w-8 h-px bg-[#30363d] my-1" />
}
