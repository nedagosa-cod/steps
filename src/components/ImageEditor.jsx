import React, { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric'
import { X, Save, Type, Square, Circle, PenTool, Trash2, Maximize2, Minimize2, Undo2, Redo2, Pipette, Crop, Check } from 'lucide-react'

export default function ImageEditor({ imageUrl, onSave, onCancel }) {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const [fabricCanvas, setFabricCanvas] = useState(null)
    const [color, setColor] = useState('#ff3b30') // Default red
    const [fillColor, setFillColor] = useState('transparent') // Default transparent
    const [isFillMode, setIsFillMode] = useState(false)
    const [brushSize, setBrushSize] = useState(5)

    // Tools: 'select', 'draw', 'text', 'rect', 'circle', 'crop'
    const [activeTool, setActiveTool] = useState('select')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const cropRectRef = useRef(null)

    // History stack for Undo/Redo
    const [history, setHistory] = useState([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const isHistoryUpdating = useRef(false)

    const COLORS = ['#ffffff', '#000000', '#ff3b30', '#ff9500', '#ffcc00', '#4cd964', '#5ac8fa', '#007aff', '#5856d6', 'transparent']

    // 1. Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return

        const container = containerRef.current
        const c = new fabric.Canvas(canvasRef.current)

        c.setDimensions({
            width: container.clientWidth,
            height: container.clientHeight - 60
        })

        c.selection = true
        c.preserveObjectStacking = true
        c.isDrawingMode = false

        setFabricCanvas(c)

        const resizeObserver = new ResizeObserver(() => {
            if (!c) return
            c.setDimensions({
                width: container.clientWidth,
                height: container.clientHeight - 60
            })
            c.renderAll()
        })
        resizeObserver.observe(container)

        // Load background image
        if (imageUrl) {
            fabric.Image.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
                // Scale image to fit canvas proportionally
                const scaleX = c.width / img.width
                const scaleY = c.height / img.height
                const scale = Math.min(scaleX, scaleY, 1) // don't upscale beyond original

                img.scale(scale)

                // Center the image
                img.set({
                    originX: 'center',
                    originY: 'center',
                    left: c.width / 2,
                    top: c.height / 2
                })
                c.backgroundImage = img
                c.renderAll()

                // Initialize history after loading image
                saveHistoryState(c)
            }).catch(err => {
                console.error("Error loading image in Fabric:", err)
            })
        } else {
            c.backgroundColor = '#ffffff'
            c.renderAll()
            saveHistoryState(c)
        }

        return () => {
            resizeObserver.disconnect()
            c.dispose()
        }
    }, [imageUrl])

    // History Tracking logic
    const saveHistoryState = (canvasObj = fabricCanvas) => {
        if (!canvasObj || isHistoryUpdating.current) return

        const json = JSON.stringify(canvasObj.toJSON())

        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1)
            newHistory.push(json)
            setHistoryIndex(newHistory.length - 1)
            return newHistory
        })
    }

    // Attach canvas events to autosave history
    useEffect(() => {
        if (!fabricCanvas) return

        const handleModify = () => saveHistoryState()

        fabricCanvas.on('object:added', handleModify)
        fabricCanvas.on('object:modified', handleModify)
        fabricCanvas.on('object:removed', handleModify)
        fabricCanvas.on('path:created', handleModify)

        return () => {
            fabricCanvas.off('object:added', handleModify)
            fabricCanvas.off('object:modified', handleModify)
            fabricCanvas.off('object:removed', handleModify)
            fabricCanvas.off('path:created', handleModify)
        }
    }, [fabricCanvas, historyIndex]) // Re-bind when historyIndex changes to slice correctly


    // 2. Toolbar Actions
    const handleUndo = () => {
        if (!fabricCanvas || historyIndex <= 0) return

        isHistoryUpdating.current = true
        const prevIndex = historyIndex - 1
        const json = history[prevIndex]

        fabricCanvas.loadFromJSON(json, () => {
            fabricCanvas.renderAll()
            setHistoryIndex(prevIndex)
            isHistoryUpdating.current = false
        })
    }

    const handleRedo = () => {
        if (!fabricCanvas || historyIndex >= history.length - 1) return

        isHistoryUpdating.current = true
        const nextIndex = historyIndex + 1
        const json = history[nextIndex]

        fabricCanvas.loadFromJSON(json, () => {
            fabricCanvas.renderAll()
            setHistoryIndex(nextIndex)
            isHistoryUpdating.current = false
        })
    }

    const handleClear = () => {
        if (!fabricCanvas) return
        if (window.confirm('¿Borrar todos los dibujos y figuras?')) {
            // we clear objects but keep background
            fabricCanvas.clear()
            if (imageUrl) {
                fabric.Image.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
                    const scaleX = fabricCanvas.width / img.width
                    const scaleY = fabricCanvas.height / img.height
                    const scale = Math.min(scaleX, scaleY, 1)
                    img.scale(scale)
                    img.set({
                        originX: 'center', originY: 'center',
                        left: fabricCanvas.width / 2, top: fabricCanvas.height / 2
                    })
                    fabricCanvas.backgroundImage = img
                    fabricCanvas.renderAll()
                    saveHistoryState()
                })
            } else {
                fabricCanvas.backgroundColor = '#ffffff'
                fabricCanvas.renderAll()
                saveHistoryState()
            }
        }
    }

    const addText = () => {
        if (!fabricCanvas) return
        setActiveTool('select') // Switch back to select after adding
        fabricCanvas.isDrawingMode = false

        const text = new fabric.IText('Texto nuevo', {
            left: fabricCanvas.width / 2,
            top: fabricCanvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Inter',
            fill: color,
            fontSize: 24,
            fontWeight: 'bold'
        })
        fabricCanvas.add(text)
        fabricCanvas.setActiveObject(text)
        text.enterEditing()
        text.selectAll()
        fabricCanvas.renderAll()
    }

    const addRect = () => {
        if (!fabricCanvas) return
        setActiveTool('select')
        fabricCanvas.isDrawingMode = false

        const rect = new fabric.Rect({
            left: fabricCanvas.width / 2,
            top: fabricCanvas.height / 2,
            originX: 'center',
            originY: 'center',
            fill: fillColor,
            stroke: color === 'transparent' ? null : color,
            strokeWidth: color === 'transparent' ? 0 : brushSize,
            width: 100,
            height: 100
        })
        fabricCanvas.add(rect)
        fabricCanvas.setActiveObject(rect)
        fabricCanvas.renderAll()
    }

    const addCircle = () => {
        if (!fabricCanvas) return
        setActiveTool('select')
        fabricCanvas.isDrawingMode = false

        const circle = new fabric.Circle({
            left: fabricCanvas.width / 2,
            top: fabricCanvas.height / 2,
            originX: 'center',
            originY: 'center',
            fill: fillColor,
            stroke: color === 'transparent' ? null : color,
            strokeWidth: color === 'transparent' ? 0 : brushSize,
            radius: 50
        })
        fabricCanvas.add(circle)
        fabricCanvas.setActiveObject(circle)
        fabricCanvas.renderAll()
    }

    // 3. Tool State Sync & Crop Overlay
    useEffect(() => {
        if (!fabricCanvas) return

        // Remove previous crop rect if exists and we are not cropping
        if (activeTool !== 'crop' && cropRectRef.current) {
            fabricCanvas.remove(cropRectRef.current)
            cropRectRef.current = null
            fabricCanvas.renderAll()
        }

        if (activeTool === 'draw') {
            fabricCanvas.isDrawingMode = true

            // In Fabric v6, freeDrawingBrush might not be initialized by default
            if (!fabricCanvas.freeDrawingBrush) {
                fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas)
            }

            fabricCanvas.freeDrawingBrush.color = color
            fabricCanvas.freeDrawingBrush.width = brushSize

            // Deactivate objects
            fabricCanvas.discardActiveObject()

        } else if (activeTool === 'crop') {
            fabricCanvas.isDrawingMode = false

            // Add crop rectangle overlay
            const bg = fabricCanvas.backgroundImage
            if (bg && !cropRectRef.current) {
                const rect = new fabric.Rect({
                    left: bg.left,
                    top: bg.top,
                    originX: 'center',
                    originY: 'center',
                    width: bg.width * bg.scaleX * 0.8,
                    height: bg.height * bg.scaleY * 0.8,
                    fill: 'rgba(0,0,0,0.3)',
                    stroke: '#fff',
                    strokeDashArray: [5, 5],
                    strokeWidth: 2,
                    cornerColor: '#fff',
                    cornerStrokeColor: '#000',
                    transparentCorners: false,
                    cornerStyle: 'circle',
                    hasRotatingPoint: false,
                    lockRotation: true
                })
                cropRectRef.current = rect
                fabricCanvas.add(rect)
                fabricCanvas.setActiveObject(rect)
            }
        } else {
            fabricCanvas.isDrawingMode = false
        }

    }, [activeTool, color, brushSize, fabricCanvas])

    const applyCrop = () => {
        const cropRect = cropRectRef.current

        // Hide the crop rectangle so it doesn't get baked into the export
        cropRect.set({ visible: false })
        fabricCanvas.renderAll()

        // We export the cropped area as a dataUrl, then reload it as the new background
        const dataUrl = fabricCanvas.toDataURL({
            format: 'jpeg',
            quality: 0.95,
            left: cropRect.left - (cropRect.width * cropRect.scaleX) / 2,
            top: cropRect.top - (cropRect.height * cropRect.scaleY) / 2,
            width: cropRect.width * cropRect.scaleX,
            height: cropRect.height * cropRect.scaleY
        })

        // Remove everything (we flatten the cropped result into the new background)
        fabricCanvas.clear()
        cropRectRef.current = null
        setActiveTool('select')

        fabric.Image.fromURL(dataUrl, { crossOrigin: 'anonymous' }).then((img) => {
            // Center the new cropped image
            img.set({
                originX: 'center', originY: 'center',
                left: fabricCanvas.width / 2, top: fabricCanvas.height / 2
            })
            fabricCanvas.backgroundImage = img
            fabricCanvas.renderAll()
            saveHistoryState()
        })
    }

    // Update active object colors
    useEffect(() => {
        if (!fabricCanvas) return
        const activeObj = fabricCanvas.getActiveObject()
        if (activeObj && activeTool === 'select') {
            if (activeObj.type === 'i-text') {
                activeObj.set('fill', color)
            } else {
                activeObj.set('stroke', color === 'transparent' ? null : color)
                activeObj.set('strokeWidth', color === 'transparent' ? 0 : brushSize)
                activeObj.set('fill', fillColor)
            }
            fabricCanvas.renderAll()
            saveHistoryState()
        }
    }, [color, fillColor, brushSize])

    // Delete handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                if (!fabricCanvas) return
                const activeObj = fabricCanvas.getActiveObject()
                // Don't delete if we are actively editing text
                if (activeObj && !activeObj.isEditing) {
                    fabricCanvas.remove(activeObj)
                    fabricCanvas.discardActiveObject()
                    fabricCanvas.renderAll()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [fabricCanvas])

    // 4. Save Image
    const handleSave = () => {
        if (!fabricCanvas) return
        // Discard active object so selection handles don't get saved
        fabricCanvas.discardActiveObject()
        fabricCanvas.renderAll()

        // Export only the bounding box of the background image, or the whole canvas if none
        const bg = fabricCanvas.backgroundImage
        let dataUrl

        if (bg) {
            dataUrl = fabricCanvas.toDataURL({
                format: 'png',
                quality: 1,
                left: bg.left - (bg.width * bg.scaleX) / 2,
                top: bg.top - (bg.height * bg.scaleY) / 2,
                width: bg.width * bg.scaleX,
                height: bg.height * bg.scaleY,
                multiplier: 1 / bg.scaleX // Save at original scale loosely
            })
        } else {
            dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1 })
        }

        onSave(dataUrl)
    }

    // Fullscreen toggle
    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', handleFsChange)
        return () => document.removeEventListener('fullscreenchange', handleFsChange)
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(() => { })
        } else {
            document.exitFullscreen()
        }
    }

    const openEyeDropper = async () => {
        if (!window.EyeDropper) {
            alert('Tu navegador no soporta la herramienta cuentagotas.')
            return
        }
        try {
            const eyeDropper = new window.EyeDropper()
            const result = await eyeDropper.open()
            if (isFillMode) setFillColor(result.sRGBHex)
            else setColor(result.sRGBHex)
        } catch (e) {
            // User aborted
        }
    }

    return (
        <div ref={containerRef} style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column'
        }}>
            {/* Toolbar */}
            <div style={{
                height: 60, flexShrink: 0, borderBottom: '1px solid var(--color-border)',
                background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px'
            }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>✏️ Editor de Imagen</span>

                    <div style={{ width: 1, height: 24, background: 'var(--color-border)' }} />

                    {/* Tools */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        <ToolBtn active={activeTool === 'select'} onClick={() => setActiveTool('select')} icon={<Maximize2 size={16} />} title="Seleccionar/Mover" />
                        <ToolBtn active={activeTool === 'draw'} onClick={() => setActiveTool('draw')} icon={<PenTool size={16} />} title="Dibujar libremente" />
                        <ToolBtn onClick={addText} icon={<Type size={16} />} title="Agregar texto" />
                        <ToolBtn onClick={addRect} icon={<Square size={16} />} title="Agregar cuadrado" />
                        <ToolBtn onClick={addCircle} icon={<Circle size={16} />} title="Agregar círculo" />
                        <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 4px' }} />
                        <ToolBtn
                            active={activeTool === 'crop'}
                            onClick={() => setActiveTool(activeTool === 'crop' ? 'select' : 'crop')}
                            icon={<Crop size={16} />}
                            title="Recortar imagen"
                        />
                        {activeTool === 'crop' && (
                            <button
                                onClick={applyCrop}
                                title="Aplicar recorte"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    padding: '0 10px', height: 32, borderRadius: 6,
                                    background: 'var(--color-brand)', color: 'white',
                                    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                                    marginLeft: 6
                                }}
                            >
                                <Check size={14} /> Aplicar
                            </button>
                        )}
                    </div>

                    <div style={{ width: 1, height: 24, background: 'var(--color-border)' }} />

                    {/* Colors & Fill Mode */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {/* Fill / Stroke Selector */}
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 2, marginRight: 8 }}>
                            <button
                                onClick={() => setIsFillMode(false)}
                                title="Editar color del borde"
                                style={{
                                    padding: '4px 8px', fontSize: 11, border: 'none', background: !isFillMode ? 'var(--color-surface)' : 'transparent',
                                    color: !isFillMode ? 'white' : 'var(--color-text-secondary)', borderRadius: 10, cursor: 'pointer',
                                    fontWeight: !isFillMode ? 600 : 400
                                }}
                            >Borde</button>
                            <button
                                onClick={() => setIsFillMode(true)}
                                title="Editar color de fondo"
                                style={{
                                    padding: '4px 8px', fontSize: 11, border: 'none', background: isFillMode ? 'var(--color-surface)' : 'transparent',
                                    color: isFillMode ? 'white' : 'var(--color-text-secondary)', borderRadius: 10, cursor: 'pointer',
                                    fontWeight: isFillMode ? 600 : 400
                                }}
                            >Fondo</button>
                        </div>

                        {COLORS.map(c => {
                            const isSelected = isFillMode ? fillColor === c : color === c
                            return (
                                <button
                                    key={c}
                                    onClick={() => isFillMode ? setFillColor(c) : setColor(c)}
                                    style={{
                                        width: 20, height: 20, borderRadius: '50%',
                                        background: c === 'transparent' ? 'repeating-linear-gradient(45deg, transparent, transparent 4px, #ff3b30 4px, #ff3b30 6px)' : c,
                                        border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                                        cursor: 'pointer', outline: isSelected ? '2px solid var(--color-brand)' : 'none',
                                        outlineOffset: 1
                                    }}
                                    title={c === 'transparent' ? 'Transparente' : c}
                                />
                            )
                        })}
                        <button
                            onClick={openEyeDropper}
                            title="Cuentagotas (Seleccionar color de pantalla)"
                            style={{
                                width: 24, height: 24, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                                color: 'var(--color-text-secondary)', cursor: 'pointer',
                                marginLeft: 4
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                        >
                            <Pipette size={14} />
                        </button>
                    </div>

                    <div style={{ width: 1, height: 24, background: 'var(--color-border)' }} />

                    {/* History */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        <ToolBtn onClick={handleUndo} disabled={historyIndex <= 0} icon={<Undo2 size={16} />} title="Deshacer" />
                        <ToolBtn onClick={handleRedo} disabled={historyIndex >= history.length - 1} icon={<Redo2 size={16} />} title="Rehacer" />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <ToolBtn onClick={handleClear} icon={<Trash2 size={16} />} title="Limpiar lienzo" style={{ color: '#ff3b30' }} />
                    <ToolBtn onClick={toggleFullscreen} icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />} title="Pantalla completa" />

                    <button onClick={onCancel} style={{
                        padding: '6px 14px', borderRadius: 6,
                        background: 'transparent', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer'
                    }}>Cancelar</button>

                    <button onClick={handleSave} style={{
                        padding: '6px 14px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
                        background: 'var(--color-brand)', border: 'none', fontWeight: 600,
                        color: 'white', fontSize: 13, cursor: 'pointer'
                    }}>
                        <Save size={14} /> Aplicar
                    </button>
                </div>
            </div>

            {/* Canvas Container */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    )
}

function ToolBtn({ icon, title, active, onClick, disabled, style }) {
    return (
        <button
            title={title}
            onClick={onClick}
            disabled={disabled}
            style={{
                width: 32, height: 32, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: '1px solid',
                borderColor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: active ? 'white' : 'var(--color-text-secondary)',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.3 : 1,
                ...style
            }}
            onMouseEnter={e => { if (!active && !disabled) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--color-text-primary)' } }}
            onMouseLeave={e => { if (!active && !disabled) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)' } }}
        >
            {icon}
        </button>
    )
}
