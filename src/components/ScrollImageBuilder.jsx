import React, { useState, useRef, useEffect } from 'react'
import { X, Upload, Trash2, Save, GripVertical, Image as ImageIcon, Check } from 'lucide-react'
import ImageEditor from './ImageEditor'

export default function ScrollImageBuilder({ onClose }) {
    const [layers, setLayers] = useState([]) // { id, base64 }
    const [draggedIdx, setDraggedIdx] = useState(null)
    const [dragOverIdx, setDragOverIdx] = useState(null)
    const [editingLayerIdx, setEditingLayerIdx] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const fileInputRef = useRef(null)
    const canvasRef = useRef(null) // Offscreen canvas for merging

    // Handle multiple file upload
    const handleFiles = (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) return

        files.forEach(file => {
            const reader = new FileReader()
            reader.onload = (ev) => {
                setLayers(prev => [...prev, {
                    id: Math.random().toString(36).substr(2, 9),
                    base64: ev.target.result
                }])
            }
            reader.readAsDataURL(file)
        })
        e.target.value = '' // reset
    }

    const removeLayer = (idx) => {
        setLayers(prev => prev.filter((_, i) => i !== idx))
    }

    // Drag and Drop Logic
    const handleDragStart = (e, idx) => {
        setDraggedIdx(idx)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, idx) => {
        e.preventDefault()
        if (draggedIdx !== null && draggedIdx !== idx) {
            setDragOverIdx(idx)
        }
    }

    const handleDrop = (e, idx) => {
        e.preventDefault()
        if (draggedIdx !== null && draggedIdx !== idx) {
            const newLayers = [...layers]
            const [draggedItem] = newLayers.splice(draggedIdx, 1)
            newLayers.splice(idx, 0, draggedItem)
            setLayers(newLayers)
        }
        setDraggedIdx(null)
        setDragOverIdx(null)
    }

    // Merge logic
    const handleSave = async () => {
        if (layers.length === 0) return
        setIsSaving(true)

        try {
            // 1. Load all images to get their dimensions
            const loadedImages = await Promise.all(layers.map(layer => {
                return new Promise((resolve, reject) => {
                    const img = new Image()
                    img.crossOrigin = 'anonymous'
                    img.onload = () => resolve(img)
                    img.onerror = reject
                    img.src = layer.base64
                })
            }))

            // 2. Calculate final dimensions
            // Width will be the max width of all images
            const maxWidth = Math.max(...loadedImages.map(img => img.width))
            // Height will be the sum of all scaled heights (scaling them to match maxWidth)
            let totalHeight = 0
            const scaledDimensions = loadedImages.map(img => {
                const scale = maxWidth / img.width
                const scaledHeight = img.height * scale
                totalHeight += scaledHeight
                return { img, scale, scaledHeight }
            })

            // 3. Draw on offscreen canvas
            const canvas = canvasRef.current
            canvas.width = maxWidth
            canvas.height = totalHeight
            const ctx = canvas.getContext('2d')

            // Prevent transparent pixels from turning into dark artifacts 
            // against the simulator's dark background
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            let currentY = 0
            scaledDimensions.forEach(({ img, scale, scaledHeight }) => {
                // Draw scaled to fit the max width, maintaining aspect ratio
                ctx.drawImage(img, 0, currentY, maxWidth, scaledHeight)
                currentY += scaledHeight
            })

            // 4. Save to localStorage as high quality JPEG to prevent massive file sizes and quota errors
            const finalDataUrl = canvas.toDataURL('image/jpeg', 0.95)
            localStorage.setItem('simubuild_scroll_image', finalDataUrl)

            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)

        } catch (error) {
            console.error("Error uniendo imágenes:", error)
            alert("Hubo un error al unir las imágenes.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column'
        }}>
            {/* Header */}
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 50, padding: '0 20px', background: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={14} color="#fff" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Creador de Scroll
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', background: 'var(--color-control)', padding: '2px 8px', borderRadius: 4 }}>
                        Une múltiples imágenes verticalmente
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={handleSave}
                        disabled={layers.length === 0 || isSaving}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 14px', borderRadius: 6, border: 'none',
                            background: layers.length === 0 ? 'var(--color-raised)' : (saveSuccess ? '#10b981' : 'var(--color-brand)'),
                            color: layers.length === 0 ? 'var(--color-text-muted)' : '#fff',
                            fontSize: 12, fontWeight: 600, cursor: layers.length === 0 ? 'default' : 'pointer',
                            transition: 'all 150ms'
                        }}
                    >
                        {isSaving ? 'Generando...' : (saveSuccess ? <><Check size={14} /> Guardado</> : <><Save size={14} /> Guardar (LocalStorage)</>)}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            width: 30, height: 30, borderRadius: 6, background: 'var(--color-control)', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-secondary)'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Sidebar - Layers */}
                <div style={{
                    width: 320, background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)',
                    display: 'flex', flexDirection: 'column', padding: 20, gap: 16, overflowY: 'auto'
                }}>
                    <div>
                        <input
                            type="file" multiple accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFiles}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%', height: 44, border: '1px dashed var(--color-brand)',
                                borderRadius: 8, background: 'rgba(124,92,252,0.05)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                color: 'var(--color-brand)', fontSize: 13, fontWeight: 600,
                                transition: 'all 150ms'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,92,252,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,92,252,0.05)'}
                        >
                            <Upload size={16} /> Añadir Imágenes
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {layers.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12, padding: '20px 0' }}>
                                Aún no has añadido imágenes.
                            </div>
                        )}

                        {layers.map((layer, idx) => {
                            const isDragged = draggedIdx === idx
                            const isDragOver = dragOverIdx === idx

                            return (
                                <div
                                    key={layer.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null) }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: 8, borderRadius: 8, background: 'var(--color-control)',
                                        border: `1px solid ${isDragOver ? 'var(--color-brand)' : 'var(--color-border)'}`,
                                        opacity: isDragged ? 0.4 : 1,
                                        transform: isDragOver ? (draggedIdx < idx ? 'translateY(4px)' : 'translateY(-4px)') : 'none',
                                        transition: 'all 150ms', cursor: 'grab'
                                    }}
                                >
                                    <GripVertical size={14} color="var(--color-text-tertiary)" />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)' }}>{idx + 1}</span>

                                    <div style={{ width: 40, height: 40, borderRadius: 4, overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                                        <img src={layer.base64} alt={`capa-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                                    </div>

                                    <div style={{ flex: 1 }} />

                                    <button
                                        onClick={() => setEditingLayerIdx(idx)}
                                        style={{
                                            background: 'var(--color-brand)', border: 'none', borderRadius: 4,
                                            padding: '4px 8px', color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer'
                                        }}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => removeLayer(idx)}
                                        style={{
                                            background: 'transparent', border: 'none', color: 'var(--color-danger)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Main Preview */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        maxWidth: '100%', height: '100%', overflowY: 'auto', padding: '40px 20px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        {layers.length > 0 ? (
                            <div style={{
                                display: 'flex', flexDirection: 'column',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)', borderRadius: 4, overflow: 'hidden',
                                border: '1px solid var(--color-border)', width: 375 // simulating mobile width for preview
                            }}>
                                {layers.map((layer, idx) => (
                                    <img key={layer.id} src={layer.base64} alt={`p-${idx}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                                Vista previa de la composición final
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden canvas for combining images */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Image Editor Overlay for specific layer */}
            {editingLayerIdx !== null && (
                <ImageEditor
                    imageUrl={layers[editingLayerIdx].base64}
                    onSave={(newImgStr) => {
                        const newLayers = [...layers]
                        newLayers[editingLayerIdx].base64 = newImgStr
                        setLayers(newLayers)
                        setEditingLayerIdx(null)
                    }}
                    onCancel={() => setEditingLayerIdx(null)}
                />
            )}
        </div>
    )
}
