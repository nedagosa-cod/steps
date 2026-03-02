import React, { useState, useCallback } from 'react'
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
import FocusMode from './components/FocusMode'
import ImageEditor from './components/ImageEditor'
import ScrollImageBuilder from './components/ScrollImageBuilder'
import AuthNode from './components/AuthNode'

import { GitBranch, Plus, Play, Settings2, Trash2, Layers, Download, Maximize2, Save, Upload, Image as ImageIcon, UserCircle } from 'lucide-react'
import { exportSimulator } from './utils/exporter'
import { TRIGGER_COLORS } from './utils/triggers'

// Must be stable — defined outside component
const nodeTypes = { screenNode: ScreenNode, authNode: AuthNode }

const edgeDefaults = {
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, color: '#7c5cfc' },
  style: { stroke: '#7c5cfc', strokeWidth: 1.5, opacity: 0.6 },
}

let nodeCounter = 1

function updateNodeCounter(nodesData) {
  let highest = 0
  nodesData.forEach(n => {
    const num = parseInt(n.id.replace('node-', ''))
    if (!isNaN(num) && num > highest) highest = num
  })
  nodeCounter = highest + 1
}

// ── App ──────────────────────────────────────────────────────────
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [isPreview, setIsPreview] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isEditingImage, setIsEditingImage] = useState(null) // null or index
  const [showImageBuilder, setShowImageBuilder] = useState(false)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, ...edgeDefaults }, eds)),
    [setEdges]
  )

  const handleExport = useCallback(async () => {
    if (nodes.length === 0) return
    setIsExporting(true)
    await exportSimulator(nodes, edges)
    setIsExporting(false)
  }, [nodes, edges])

  const handleSaveProject = useCallback(() => {
    const projectData = {
      nodes,
      edges
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "proyecto_simulador.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }, [nodes, edges])

  const handleLoadProject = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = e => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const projectData = JSON.parse(event.target.result)
          if (projectData.nodes && projectData.edges) {
            setNodes(projectData.nodes)
            setEdges(projectData.edges)
            updateNodeCounter(projectData.nodes)
            setSelectedNode(null)
            setIsFocusMode(false)
            setIsEditingImage(false)
          } else {
            alert("El archivo no tiene el formato correcto (debe contener 'nodes' y 'edges').")
          }
        } catch (err) {
          alert("Error al leer el archivo del proyecto.")
          console.error(err)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [setNodes, setEdges])

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), [])
  const onPaneClick = useCallback(() => setSelectedNode(null), [])

  const addScreenNode = useCallback(() => {
    const id = `node-${nodeCounter++}`

    // Calculate if it's the first node being created when none exist
    const isFirstNode = nodes.length === 0;

    const n = {
      id,
      type: 'screenNode',
      position: { x: 120 + Math.random() * 280, y: 80 + Math.random() * 180 },
      data: {
        label: `Pantalla ${nodeCounter - 1}`,
        image: null,
        mediaType: 'image', // 'image' or 'video'
        isStartNode: isFirstNode,
        triggers: [], // multi-trigger array (empty = no advance)
      },
    }
    setNodes((nds) => [...nds, n])
    setSelectedNode(n)
  }, [nodes, setNodes])

  const addAuthNode = useCallback(() => {
    const id = `node-${nodeCounter++}`

    // Calculate if it's the first node being created when none exist
    const isFirstNode = nodes.length === 0;

    const n = {
      id,
      type: 'authNode',
      position: { x: 120 + Math.random() * 280, y: 80 + Math.random() * 180 },
      data: {
        label: `Login ${nodeCounter - 1}`,
        title: 'Control de Accesos',
        objective: 'Bienvenido al simulador. Ingresa tus datos para continuar.',
        showPractice: true,
        showScores: true,
        isStartNode: isFirstNode
      },
    }
    setNodes((nds) => [...nds, n])
    setSelectedNode(n)
  }, [nodes, setNodes])

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    )
    setSelectedNode(null)
    setIsFocusMode(false)
  }, [selectedNode, setNodes, setEdges])

  const onUpdateNode = useCallback((id, patch) => {
    setNodes((nds) => {
      // If setting a new start node, clear the old one
      if (patch.isStartNode === true) {
        return nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, ...patch } }
            : { ...n, data: { ...n.data, isStartNode: false } }
        )
      }
      return nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)
    })
    setSelectedNode((prev) =>
      prev?.id === id ? { ...prev, data: { ...prev.data, ...patch } } : prev
    )
  }, [setNodes])

  // Combine drawn edges with dynamic trigger edges
  const combinedEdges = React.useMemo(() => {
    const computedEdges = []
    nodes.forEach(node => {
      const triggers = node.data?.triggers || []
      triggers.forEach(t => {
        if (t.navigateTarget && nodes.some(n => n.id === t.navigateTarget)) {
          const colors = TRIGGER_COLORS[t.type] || TRIGGER_COLORS.click
          computedEdges.push({
            id: `edge-${node.id}-${t.id}-${t.navigateTarget}`,
            source: node.id,
            sourceHandle: `trigger-${t.id}`,
            target: t.navigateTarget,
            type: 'smoothstep',
            animated: true,
            deletable: false,
            selectable: false, // Prevent user interaction to avoid confusion
            markerEnd: { type: MarkerType.ArrowClosed, color: colors.label },
            style: {
              stroke: colors.label,
              strokeWidth: 2,
              opacity: 0.85,
              strokeDasharray: '4 4' // Dashed to differentiate from normal flow
            },
          })
        }
      })
    })
    return [...edges, ...computedEdges]
  }, [nodes, edges])

  // ── Styles ──────────────────────────────────────────────────────
  const S = styles

  return (
    <div style={S.root}>
      {isPreview && (
        <PreviewMode nodes={nodes} edges={edges} onExit={() => setIsPreview(false)} />
      )}

      {showImageBuilder && (
        <ScrollImageBuilder onClose={() => setShowImageBuilder(false)} />
      )}

      {isEditingImage !== null && selectedNode?.data?.image && (
        <ImageEditor
          imageUrl={
            Array.isArray(selectedNode.data.image)
              ? selectedNode.data.image[isEditingImage]
              : selectedNode.data.image
          }
          onSave={(newImageStr) => {
            if (Array.isArray(selectedNode.data.image)) {
              const newArr = [...selectedNode.data.image]
              newArr[isEditingImage] = newImageStr
              onUpdateNode(selectedNode.id, { image: newArr })
            } else {
              onUpdateNode(selectedNode.id, { image: newImageStr })
            }
            setIsEditingImage(null)
          }}
          onCancel={() => setIsEditingImage(null)}
        />
      )}

      {/* ── LEFT TOOLBAR ─────────────────────────────────────── */}
      <aside style={S.leftBar}>
        {/* Logo */}
        <div style={S.logo}>
          <GitBranch size={15} color="#fff" />
        </div>

        {/* Separator */}
        <div style={S.sep} />

        {/* Add auth node */}
        <ToolBtn
          title="Menú de Inicio / Login"
          onClick={addAuthNode}
        >
          <UserCircle size={16} />
        </ToolBtn>

        {/* Add node */}
        <ToolBtn
          title="Añadir pantalla (N)"
          onClick={addScreenNode}
        >
          <Plus size={16} />
        </ToolBtn>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Counters */}
        <div style={S.counter}>
          <span style={S.counterNum}>{nodes.length}</span>
          <span style={S.counterLabel}>nodos</span>
        </div>
        <div style={{ ...S.counter, marginBottom: 8 }}>
          <span style={S.counterNum}>{edges.length}</span>
          <span style={S.counterLabel}>links</span>
        </div>

        {/* Delete selected */}
        {selectedNode && (
          <>
            <div style={S.sep} />
            <ToolBtn title="Eliminar nodo" onClick={deleteSelectedNode} danger>
              <Trash2 size={15} />
            </ToolBtn>
          </>
        )}
      </aside>

      {/* ── MAIN CANVAS ──────────────────────────────────────── */}
      <main style={S.main}>
        {/* Header */}
        <header style={S.header}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={S.brandName}>SimuBuild</span>
            <span style={S.editorBadge}>Editor</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {nodes.length === 0 && (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 4 }}>
                Añade una pantalla para empezar
              </span>
            )}

            {selectedNode && !isFocusMode && (
              <GhostBtn onClick={() => setIsFocusMode(true)}>
                <Maximize2 size={12} style={{ marginRight: 5 }} />
                Enfocar nodo
              </GhostBtn>
            )}

            <GhostBtn onClick={() => setShowImageBuilder(true)}>
              <ImageIcon size={12} style={{ marginRight: 5 }} />
              Creador de Scroll
            </GhostBtn>

            <GhostBtn onClick={addScreenNode}>
              <Plus size={12} style={{ marginRight: 5 }} />
              Nueva pantalla
            </GhostBtn>

            <GhostBtn onClick={handleLoadProject}>
              <Upload size={12} style={{ marginRight: 5 }} />
              Cargar
            </GhostBtn>

            <GhostBtn onClick={handleSaveProject} disabled={nodes.length === 0}>
              <Save size={12} style={{ marginRight: 5 }} />
              Guardar
            </GhostBtn>

            <GhostBtn onClick={handleExport} disabled={nodes.length === 0 || isExporting}>
              <Download size={12} style={{ marginRight: 5 }} />
              {isExporting ? 'Exportando...' : 'Exportar'}
            </GhostBtn>

            <PrimaryBtn
              onClick={() => nodes.length > 0 && setIsPreview(true)}
              disabled={nodes.length === 0}
            >
              <Play size={12} style={{ marginRight: 5 }} />
              Preview
            </PrimaryBtn>
          </div>
        </header>

        {/* Canvas / Focus Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          {isFocusMode && selectedNode ? (
            <FocusMode node={selectedNode} onUpdateNode={onUpdateNode} onExit={() => setIsFocusMode(false)} />
          ) : null}

          <ReactFlow
            nodes={nodes}
            edges={combinedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.35 }}
            defaultEdgeOptions={edgeDefaults}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="rgba(255,255,255,0.035)"
            />
            <Controls />
            <MiniMap
              nodeColor="rgba(124,92,252,0.5)"
              maskColor="rgba(10,13,18,0.82)"
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>
                <Layers size={26} color="var(--color-brand)" />
              </div>
              <p style={S.emptyTitle}>Canvas vacío</p>
              <p style={S.emptyHint}>
                Haz clic en <strong style={{ color: 'var(--color-text-secondary)' }}>Nueva pantalla</strong> para comenzar
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ── RIGHT CONFIG PANEL ────────────────────────────────── */}
      <aside style={S.rightPanel}>
        <div style={S.rightPanelHeader}>
          <Settings2 size={13} color="var(--color-brand)" />
          <span style={S.rightPanelTitle}>Configuración</span>
          {selectedNode && (
            <span style={S.nodeIdBadge}>{selectedNode.id}</span>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <NodeConfigPanel
            node={selectedNode}
            onUpdateNode={onUpdateNode}
            nodes={nodes}
            onEditImage={(idx) => setIsEditingImage(idx)}
          />
        </div>
      </aside>
    </div>
  )
}

// ── Style objects (stable references) ─────────────────────────────
const styles = {
  root: {
    display: 'flex',
    height: '100dvh',
    width: '100vw',
    overflow: 'hidden',
    background: 'var(--color-canvas)',
    fontFamily: "'Inter', system-ui, sans-serif",
  },

  // Left toolbar
  leftBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 56,
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border-subtle)',
    padding: '12px 0',
    flexShrink: 0,
    zIndex: 10,
    gap: 4,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'var(--color-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    flexShrink: 0,
  },
  sep: {
    width: 28,
    height: 1,
    background: 'var(--color-border-subtle)',
    margin: '4px 0',
  },
  counter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  counterNum: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  counterLabel: {
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    padding: '0 16px',
    borderBottom: '1px solid var(--color-border-subtle)',
    background: 'var(--color-surface)',
    flexShrink: 0,
    zIndex: 10,
  },
  brandName: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    color: 'var(--color-text-primary)',
  },
  editorBadge: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.04em',
    padding: '2px 7px',
    borderRadius: 4,
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-tertiary)',
  },

  // Main
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    background: 'var(--color-canvas)',
  },

  // Empty state
  emptyState: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: 'var(--color-raised)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  emptyHint: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
  },

  // Right panel
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    width: 264,
    background: 'var(--color-surface)',
    borderLeft: '1px solid var(--color-border-subtle)',
    flexShrink: 0,
    zIndex: 10,
  },
  rightPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '10px 14px',
    borderBottom: '1px solid var(--color-border-subtle)',
    flexShrink: 0,
  },
  rightPanelTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.02em',
    flex: 1,
  },
  nodeIdBadge: {
    fontSize: 9,
    fontVariantNumeric: 'tabular-nums',
    padding: '2px 6px',
    borderRadius: 4,
    background: 'var(--color-raised)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)',
  },
}

// ── Sub-components ────────────────────────────────────────────────

function ToolBtn({ onClick, title, children, danger = false }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 34, height: 34,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 7, border: 'none', cursor: 'pointer',
        color: danger
          ? (hovered ? 'var(--color-danger)' : 'var(--color-text-muted)')
          : (hovered ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)'),
        background: hovered
          ? (danger ? 'rgba(192,64,64,0.1)' : 'var(--color-raised)')
          : 'transparent',
        transition: 'all 150ms ease-out',
      }}
    >
      {children}
    </button>
  )
}

function GhostBtn({ onClick, children, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '5px 11px', borderRadius: 6,
        border: `1px solid ${hovered ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
        background: hovered ? 'var(--color-raised)' : 'transparent',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
        fontSize: 11, fontWeight: 500, cursor: disabled ? 'default' : 'pointer',
        transition: 'all 150ms ease-out',
      }}
    >
      {children}
    </button>
  )
}

function PrimaryBtn({ onClick, children, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '5px 14px', borderRadius: 6, border: 'none',
        background: disabled
          ? 'var(--color-raised)'
          : (hovered ? 'var(--color-brand-hover)' : 'var(--color-brand)'),
        boxShadow: (!disabled && hovered) ? '0 0 16px var(--color-brand-glow)' : 'none',
        color: disabled ? 'var(--color-text-muted)' : '#fff',
        fontSize: 11, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
        transition: 'all 150ms ease-out',
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </button>
  )
}
