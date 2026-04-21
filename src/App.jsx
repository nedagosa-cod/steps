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
import './App.css'

// ── Features ──────────────────────────────────────────────────
import ScreenNode from './features/nodes/ScreenNode'
import AuthNode from './features/nodes/AuthNode'
import ResultNode from './features/nodes/ResultNode'
import RankingNode from './features/nodes/RankingNode'
import ButtonEdge from './features/nodes/ButtonEdge'

import ImageEditor from './features/editor/components/ImageEditor'
import ScrollImageBuilder from './features/editor/components/ScrollImageBuilder'
import ScrollImageLibrary from './features/editor/components/ScrollImageLibrary'

import PreviewMode from './features/view-modes/components/PreviewMode'
import FocusMode from './features/view-modes/components/FocusMode'

import { exportSimulator } from './features/export/exporter'
import { exportAsExe } from './features/export/exporterExe'
import ExportProgressDialog from './features/export/components/ExportProgressDialog'

// ── Shared ────────────────────────────────────────────────────
import { TRIGGER_COLORS } from './shared/utils/triggers'
import useHistory from './shared/hooks/useHistory'
import { defaultGlobalConfig, edgeDefaults } from './shared/constants/initialState'
import TopNavbar from './shared/components/TopNavbar'
import LeftSidebar from './shared/components/LeftSidebar'
import RightSidebar from './shared/components/RightSidebar'

import { Layers } from 'lucide-react'

// Must be stable — defined outside component
const nodeTypes = { screenNode: ScreenNode, authNode: AuthNode, resultNode: ResultNode, rankingNode: RankingNode }
const edgeTypes = { buttonEdge: ButtonEdge }

let nodeCounter = 1

function updateNodeCounter(nodesData) {
  let highest = 0
  nodesData.forEach(n => {
    const num = parseInt(n.id.replace('node-', ''))
    if (!isNaN(num) && num > highest) highest = num
  })
  nodeCounter = highest + 1
}

// ── App Orchestrator ───────────────────────────────────────────
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)

  // Modals & Modes State
  const [isPreview, setIsPreview] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingExe, setIsExportingExe] = useState(false)
  const [exeProgressMessages, setExeProgressMessages] = useState([])
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isEditingImage, setIsEditingImage] = useState(null) // null or index
  const [showImageBuilder, setShowImageBuilder] = useState(false)

  // Right Panel State
  const [configTab, setConfigTab] = useState('node') // 'node' | 'media' | 'triggers' | 'general'
  const [globalConfig, setGlobalConfig] = useState(defaultGlobalConfig)
  const [showScrollLibrary, setShowScrollLibrary] = useState(false)
  const [scrollLibraryCallback, setScrollLibraryCallback] = useState(null) // function(dataUrl)
  const [rightPanelWidth, setRightPanelWidth] = useState(280)

  const handleMouseDownResize = useCallback((e) => {
    e.preventDefault()
    document.body.style.cursor = 'col-resize'

    const startX = e.clientX
    const startWidth = rightPanelWidth

    const handleMouseMove = (mouseMoveEvent) => {
      const deltaX = startX - mouseMoveEvent.clientX
      const newWidth = Math.max(260, Math.min(800, startWidth + deltaX))
      setRightPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      document.body.style.cursor = 'default'
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [rightPanelWidth])

  const deleteEdge = useCallback((id) => {
    setEdges((eds) => eds.filter((e) => e.id !== id))
  }, [setEdges])

  // Undo / Redo — must be after deleteEdge so patchEdge can reference it
  const patchEdge = useCallback((edge) => ({
    ...edge,
    data: { ...edge.data, onDelete: deleteEdge },
  }), [deleteEdge])

  const { undo, redo, canUndo, canRedo } = useHistory(nodes, edges, setNodes, setEdges, { patchEdge })

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      ...edgeDefaults,
      data: { onDelete: deleteEdge }
    }, eds)),
    [setEdges, deleteEdge]
  )

  const handleExport = useCallback(async () => {
    if (nodes.length === 0) return
    setIsExporting(true)
    await exportSimulator(nodes, edges, globalConfig)
    setIsExporting(false)
  }, [nodes, edges, globalConfig])

  const handleExportExe = useCallback(async () => {
    if (nodes.length === 0) return
    setIsExportingExe(true)
    setExeProgressMessages([])

    const onProgress = (msg) => {
      setExeProgressMessages(prev => [...prev, msg])
    }

    const res = await exportAsExe(nodes, edges, globalConfig, onProgress)

    if (res || !res) {
      setTimeout(() => setIsExportingExe(false), 2000)
    }
  }, [nodes, edges, globalConfig])

  const handleSaveProject = useCallback(() => {
    const projectData = {
      nodes,
      edges,
      globalConfig
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "proyecto_simulador.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }, [nodes, edges, globalConfig])

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
            if (projectData.globalConfig) {
              setGlobalConfig(projectData.globalConfig)
            }
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
    const isFirstNode = nodes.length === 0;
    const n = {
      id,
      type: 'screenNode',
      position: { x: 120 + Math.random() * 280, y: 80 + Math.random() * 180 },
      data: {
        label: `Pantalla ${nodeCounter - 1}`,
        image: null,
        mediaType: 'image',
        isStartNode: isFirstNode,
        triggers: [],
      },
    }
    setNodes((nds) => [...nds, n])
    setSelectedNode(n)
  }, [nodes, setNodes])

  const addAuthNode = useCallback(() => {
    const id = `node-${nodeCounter++}`
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

  const addResultNode = useCallback(() => {
    const id = `node-${nodeCounter++}`
    const n = {
      id,
      type: 'resultNode',
      position: { x: 120 + Math.random() * 280, y: 80 + Math.random() * 180 },
      data: {
        label: `Resultado ${nodeCounter - 1}`,
        title: '¡Simulación Completada!',
        message: 'Has finalizado el recorrido con éxito.',
        timerEnd: true
      },
    }
    setNodes((nds) => [...nds, n])
    setSelectedNode(n)
  }, [setNodes])

  const addRankingNode = useCallback(() => {
    const id = `node-${nodeCounter++}`
    const n = {
      id,
      type: 'rankingNode',
      position: { x: 120 + Math.random() * 280, y: 80 + Math.random() * 180 },
      data: {
        label: `Ranking ${nodeCounter - 1}`,
        title: 'Tabla de Posiciones',
        timerEnd: true
      },
    }
    setNodes((nds) => [...nds, n])
    setSelectedNode(n)
  }, [setNodes])

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
            selectable: false,
            markerEnd: { type: MarkerType.ArrowClosed, color: colors.label },
            style: {
              stroke: colors.label,
              strokeWidth: 2,
              opacity: 0.85,
              strokeDasharray: '4 4'
            },
          })
        }
      })
    })
    const manualEdges = edges.map(e => ({
      ...e,
      data: { ...e.data, onDelete: deleteEdge }
    }))
    return [...manualEdges, ...computedEdges]
  }, [nodes, edges, deleteEdge])

  return (
    <div className="app-root">
      <ExportProgressDialog
        isOpen={isExportingExe}
        progressMessage={exeProgressMessages}
      />

      {isPreview && (
        <PreviewMode nodes={nodes} edges={edges} globalConfig={globalConfig} onExit={() => setIsPreview(false)} />
      )}

      {showImageBuilder && (
        <ScrollImageBuilder onClose={() => setShowImageBuilder(false)} />
      )}

      {isEditingImage !== null && selectedNode?.data?.image && (() => {
        const imageUrl = Array.isArray(selectedNode.data.image)
          ? selectedNode.data.image[isEditingImage]
          : selectedNode.data.image;

        // Final safety check: don't open editor if it looks like a video
        const isVideo = imageUrl?.startsWith('data:video/') || imageUrl?.endsWith('.mp4') || imageUrl?.endsWith('.webm');
        if (isVideo) {
          setTimeout(() => setIsEditingImage(null), 0);
          return null;
        }

        return (
          <ImageEditor
            imageUrl={imageUrl}
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
        );
      })()}

      {showScrollLibrary && (
        <ScrollImageLibrary
          onSelect={(dataUrl) => {
            if (scrollLibraryCallback) {
              scrollLibraryCallback(dataUrl)
              setScrollLibraryCallback(null)
            }
          }}
          onClose={() => {
            setShowScrollLibrary(false)
            setScrollLibraryCallback(null)
          }}
        />
      )}

      <LeftSidebar
        addAuthNode={addAuthNode}
        addScreenNode={addScreenNode}
        addResultNode={addResultNode}
        addRankingNode={addRankingNode}
        setShowScrollLibrary={setShowScrollLibrary}
        setScrollLibraryCallback={setScrollLibraryCallback}
        nodesCount={nodes.length}
        edgesCount={edges.length}
        selectedNode={selectedNode}
        deleteSelectedNode={deleteSelectedNode}
      />

      <main className="app-main">
        <TopNavbar
          nodesCount={nodes.length}
          canUndo={canUndo}
          canRedo={canRedo}
          undo={undo}
          redo={redo}
          selectedNode={selectedNode}
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode}
          setShowImageBuilder={setShowImageBuilder}
          addScreenNode={addScreenNode}
          handleLoadProject={handleLoadProject}
          handleSaveProject={handleSaveProject}
          handleExport={handleExport}
          handleExportExe={handleExportExe}
          isExporting={isExporting}
          isExportingExe={isExportingExe}
          setIsPreview={setIsPreview}
        />

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
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.35 }}
            defaultEdgeOptions={edgeDefaults}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.035)" />
            <Controls />
            <MiniMap nodeColor="rgba(124,92,252,0.5)" maskColor="rgba(10,13,18,0.82)" />
          </ReactFlow>

          {nodes.length === 0 && (
            <div className="app-empty-state">
              <div className="app-empty-icon">
                <Layers size={26} color="var(--color-brand)" />
              </div>
              <p className="app-empty-title">Canvas vacío</p>
              <p className="app-empty-hint">
                Haz clic en <strong style={{ color: 'var(--color-text-secondary)' }}>Nueva pantalla</strong> para comenzar
              </p>
            </div>
          )}
        </div>
      </main>

      <RightSidebar
        rightPanelWidth={rightPanelWidth}
        handleMouseDownResize={handleMouseDownResize}
        configTab={configTab}
        setConfigTab={setConfigTab}
        selectedNode={selectedNode}
        globalConfig={globalConfig}
        setGlobalConfig={setGlobalConfig}
        nodes={nodes}
        edges={edges}
        onUpdateNode={onUpdateNode}
        setIsEditingImage={setIsEditingImage}
        setShowScrollLibrary={setShowScrollLibrary}
        setScrollLibraryCallback={setScrollLibraryCallback}
      />
    </div>
  )
}
