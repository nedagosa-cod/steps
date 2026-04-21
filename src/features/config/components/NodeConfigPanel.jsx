import React, { useRef, useState } from 'react'
import { Info, Image, Video, Trash2, GripVertical, ChevronDown, ChevronUp, TextCursorInput, List, ListTree, MousePointer, Keyboard, CircleDot, CheckSquare, CalendarDays, Undo2, Settings2, Upload, Plus, AppWindow, Table } from 'lucide-react'
import { TRIGGER_COLORS, TRIGGER_LABELS } from '../../../shared/utils/triggers'
import { FieldLabel } from '../../../shared/components/FieldLabel'
import { Divider } from '../../../shared/components/Divider'
import { TextInput } from '../../../shared/components/TextInput'
import { NumericInput } from '../../../shared/components/NumericInput'
import useNodeConfig from '../hooks/useNodeConfig'
import { TriggerCard, AddBtn } from './TriggerCard'


/* ── Main component ── */
export default function NodeConfigPanel({ node, onUpdateNode, nodes, onEditImage, activeTab = 'node', onOpenScrollLibrary }) {
    const fileInputRef = useRef(null)
    const [expandedState, setExpandedState] = useState({})
    const [editingTriggerId, setEditingTriggerId] = useState(null)

    const {
        triggers, update, updateTrigger, deleteTrigger, addTrigger, dragProps
    } = useNodeConfig(node, onUpdateNode, setEditingTriggerId)

    if (!node) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 12, padding: '0 24px', textAlign: 'center',
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'var(--color-raised)', border: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Info size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
                    Selecciona un nodo para configurarlo
                </p>
            </div>
        )
    }

    const { data } = node

    const handleMediaUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const isVideo = file.type.startsWith('video/')
        const reader = new FileReader()
        reader.onload = ev => {
            if (isVideo) {
                // Video replaces entirely
                update({ image: ev.target.result, mediaType: 'video' })
            } else {
                // Image allows stacking
                let currentImages = data.image ? (Array.isArray(data.image) ? data.image : [data.image]) : []
                // If it was a video before, we overwrite it
                if (data.mediaType === 'video') currentImages = []

                const newImages = [...currentImages, ev.target.result]
                update({ image: newImages, mediaType: 'image' })
            }
            // Reset input so the same file can be uploaded again if needed
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
        reader.readAsDataURL(file)
    }

    const removeImageSegment = (indexToRemove) => {
        if (!Array.isArray(data.image)) {
            update({ image: null })
            return
        }
        const newImages = data.image.filter((_, idx) => idx !== indexToRemove)
        update({ image: newImages.length > 0 ? newImages : null })
    }

    // Helper to get array of images
    const imageSegments = data.image ? (Array.isArray(data.image) ? data.image : [data.image]) : []

    const isResult = node.type === 'resultNode' || data.type === 'resultNode'

    if (node.type === 'authNode') {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', gap: 12,
                padding: 14, height: '100%', overflowY: 'auto',
            }}>
                {/* Set as Start Node */}
                <button
                    onClick={() => update({ isStartNode: true })}
                    disabled={data.isStartNode}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        width: '100%', padding: '8px 12px', borderRadius: 7,
                        border: data.isStartNode ? '1px solid rgba(46, 165, 103, 0.4)' : '1px solid var(--color-border)',
                        background: data.isStartNode ? 'rgba(46, 165, 103, 0.15)' : 'transparent',
                        color: data.isStartNode ? '#5ac98a' : 'var(--color-text-secondary)',
                        fontSize: 11, fontWeight: data.isStartNode ? 700 : 500,
                        cursor: data.isStartNode ? 'default' : 'pointer',
                        transition: 'all 150ms ease-out',
                    }}
                >
                    <div style={{
                        width: 14, height: 14, borderRadius: '50%',
                        background: data.isStartNode ? '#5ac98a' : 'transparent',
                        border: data.isStartNode ? 'none' : '1px solid var(--color-border-strong)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {data.isStartNode && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    {data.isStartNode ? 'Pantalla Inicial' : 'Establecer como inicial'}
                </button>

                {/* Name */}
                <div>
                    <FieldLabel>Nombre interno</FieldLabel>
                    <TextInput
                        value={data.label || ''}
                        onChange={e => update({ label: e.target.value })}
                        placeholder="Login 1"
                    />
                </div>

                <Divider label="Contenido del Menú" />

                <div>
                    <FieldLabel>Título Principal</FieldLabel>
                    <TextInput
                        value={data.title || ''}
                        onChange={e => update({ title: e.target.value })}
                        placeholder="Control de Accesos"
                    />
                </div>
                <div>
                    <FieldLabel>Objetivo / Instrucciones</FieldLabel>
                    <textarea
                        value={data.objective || ''}
                        onChange={e => update({ objective: e.target.value })}
                        placeholder="Bienvenido al simulador..."
                        style={{
                            width: '100%', height: 60,
                            background: 'var(--color-control)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 6, padding: '6px 10px',
                            fontSize: 12, resize: 'vertical',
                            color: 'var(--color-text-primary)', outline: 'none',
                        }}
                    />
                </div>

                <Divider label="Botones Visibles" />

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={data.showPractice !== false}
                        onChange={(e) => update({ showPractice: e.target.checked })}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-brand)' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>Modo Práctica (Estático)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.6 }}>
                    <input type="checkbox" checked={true} readOnly style={{ accentColor: 'var(--color-brand)' }} />
                    <span style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>Evaluación (Navegará al flujo)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={data.showScores !== false}
                        onChange={(e) => update({ showScores: e.target.checked })}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-brand)' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>Puntajes (Estático)</span>
                </label>
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 12,
            padding: 14, height: '100%', overflowY: 'auto',
        }}>
            {activeTab === 'node' && (<>
                {/* Set as Start Node */}
                <button
                    onClick={() => update({ isStartNode: true })}
                    disabled={data.isStartNode}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        width: '100%', padding: '8px 12px', borderRadius: 7,
                        border: data.isStartNode ? '1px solid rgba(46, 165, 103, 0.4)' : '1px solid var(--color-border)',
                        background: data.isStartNode ? 'rgba(46, 165, 103, 0.15)' : 'transparent',
                        color: data.isStartNode ? '#5ac98a' : 'var(--color-text-secondary)',
                        fontSize: 11, fontWeight: data.isStartNode ? 700 : 500,
                        cursor: data.isStartNode ? 'default' : 'pointer',
                        transition: 'all 150ms ease-out',
                    }}
                >
                    <div style={{
                        width: 14, height: 14, borderRadius: '50%',
                        background: data.isStartNode ? '#5ac98a' : 'transparent',
                        border: data.isStartNode ? 'none' : '1px solid var(--color-border-strong)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {data.isStartNode && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    {data.isStartNode ? 'Pantalla Inicial' : 'Establecer como inicial'}
                </button>

                {/* Name */}
                <div>
                    <FieldLabel>Nombre</FieldLabel>
                    <TextInput
                        value={data.label || ''}
                        onChange={e => update({ label: e.target.value })}
                        placeholder="Pantalla sin nombre"
                    />
                </div>

                <Divider label="Temporizador Global" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={data.timerStart || false}
                            onChange={(e) => update({ timerStart: e.target.checked, timerEnd: e.target.checked ? false : data.timerEnd })}
                            style={{ cursor: 'pointer', accentColor: 'var(--color-brand)' }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>Iniciar Temporizador Aquí</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={data.timerEnd || false}
                            onChange={(e) => update({ timerEnd: e.target.checked, timerStart: e.target.checked ? false : data.timerStart })}
                            style={{ cursor: 'pointer', accentColor: 'var(--color-brand)' }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>Detener Temporizador Aquí</span>
                    </label>
                </div>

                {(node.type === 'rankingNode' || data.type === 'rankingNode') && (
                    <>
                        <Divider label="Diseño del Ranking" />
                        <div>
                            <FieldLabel>Título de la Tabla</FieldLabel>
                            <TextInput
                                value={data.title ?? 'Tabla de Posiciones'}
                                onChange={e => update({ title: e.target.value })}
                                placeholder="Tabla de Posiciones"
                            />
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <FieldLabel>Mensaje de Felicidad</FieldLabel>
                            <TextInput
                                value={data.message ?? '¡Buen trabajo! Este es tu puntaje final.'}
                                onChange={e => update({ message: e.target.value })}
                                placeholder="¡Buen trabajo!..."
                            />
                        </div>
                    </>
                )}

                {isResult && (
                    <>
                        <Divider label="Diseño" />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <FieldLabel>Color Primario</FieldLabel>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="color"
                                        value={data.certColorPrimary || '#1E3A8A'}
                                        onChange={e => update({ certColorPrimary: e.target.value })}
                                        style={{ width: 32, height: 32, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                                    />
                                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{data.certColorPrimary || '#1E3A8A'}</span>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <FieldLabel>Color Secundario</FieldLabel>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="color"
                                        value={data.certColorAccent || '#EAB308'}
                                        onChange={e => update({ certColorAccent: e.target.value })}
                                        style={{ width: 32, height: 32, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                                    />
                                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{data.certColorAccent || '#EAB308'}</span>
                                </div>
                            </div>
                        </div>

                        <Divider label="Textos del Certificado" />
                        <div>
                            <FieldLabel>Título Principal</FieldLabel>
                            <TextInput
                                value={data.certTitle ?? 'CERTIFICADO'}
                                onChange={e => update({ certTitle: e.target.value })}
                                placeholder="CERTIFICADO"
                            />
                        </div>
                        <div>
                            <FieldLabel>Subtítulo</FieldLabel>
                            <TextInput
                                value={data.certSubtitle ?? 'DE RECONOCIMIENTO'}
                                onChange={e => update({ certSubtitle: e.target.value })}
                                placeholder="DE RECONOCIMIENTO"
                            />
                        </div>
                        <div>
                            <FieldLabel>Aclaración previa al nombre</FieldLabel>
                            <TextInput
                                value={data.certPreName ?? 'OTORGADO A:'}
                                onChange={e => update({ certPreName: e.target.value })}
                                placeholder="OTORGADO A:"
                            />
                        </div>
                        <div>
                            <FieldLabel>Descripción / Razón</FieldLabel>
                            <textarea
                                value={data.certDescription ?? 'Por haber completado satisfactoriamente 120 horas del Diplomado...'}
                                onChange={e => update({ certDescription: e.target.value })}
                                placeholder="Por haber completado..."
                                style={{
                                    width: '100%', height: 60,
                                    background: 'var(--color-control)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 6, padding: '6px 10px',
                                    fontSize: 12, resize: 'vertical',
                                    color: 'var(--color-text-primary)', outline: 'none',
                                }}
                            />
                        </div>

                        <Divider label="Firmas" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <FieldLabel>Firma 1 (Izquierda)</FieldLabel>
                                <TextInput
                                    value={data.signature1Name ?? 'LIC. HORACIO OLIVO'}
                                    onChange={e => update({ signature1Name: e.target.value })}
                                    placeholder="Nombre"
                                />
                                <TextInput
                                    value={data.signature1Title ?? 'Director de Administración'}
                                    onChange={e => update({ signature1Title: e.target.value })}
                                    placeholder="Cargo"
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <FieldLabel>Firma 2 (Derecha)</FieldLabel>
                                <TextInput
                                    value={data.signature2Name ?? 'LIC. CARLA RODRÍGUEZ'}
                                    onChange={e => update({ signature2Name: e.target.value })}
                                    placeholder="Nombre"
                                />
                                <TextInput
                                    value={data.signature2Title ?? 'Directora de Negocios'}
                                    onChange={e => update({ signature2Title: e.target.value })}
                                    placeholder="Cargo"
                                />
                            </div>
                        </div>
                    </>
                )}
            </>)}

            {activeTab === 'media' && (<>
                <Divider label="Fondo (Imagen / Video)" />

                {/* Media upload */}
                <input ref={fileInputRef} type="file" accept="image/*,video/mp4,video/webm"
                    style={{ display: 'none' }} onChange={handleMediaUpload} />

                {data.image ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* Render Video or Stacked Images */}
                        {data.mediaType === 'video' ? (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        position: 'relative', borderRadius: 7, overflow: 'hidden',
                                        border: '1px solid var(--color-border)', cursor: 'pointer',
                                        display: 'block', width: '100%', background: '#000', padding: 0,
                                    }}
                                >
                                    <video src={Array.isArray(data.image) ? data.image[0] : data.image} style={{ width: '100%', height: 160, objectFit: 'contain', display: 'block' }} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                                    <div
                                        style={{
                                            position: 'absolute', inset: 0, background: 'rgba(10,13,18,0.65)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                            opacity: 0, transition: 'opacity 150ms ease-out',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                    >
                                        <Video size={14} style={{ color: '#e2eaf4' }} />
                                        <span style={{ fontSize: 11, fontWeight: 500, color: '#e2eaf4' }}>Cambiar Video</span>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {/* Stacked Images List */}
                                {imageSegments.map((src, idx) => (
                                    <div key={idx} style={{ position: 'relative', borderRadius: 7, overflow: 'hidden', border: '1px solid var(--color-border)', background: '#000' }}>
                                        <img src={src} alt={`segment-${idx}`} style={{ width: '100%', height: imageSegments.length > 1 ? 100 : 160, objectFit: 'cover', display: 'block', opacity: 0.8 }} />

                                        {/* Edit Button - Hide if it is a video even if mediaType is image */}
                                        {!src.startsWith('data:video/') && !src.endsWith('.mp4') && !src.endsWith('.webm') && (
                                            <button
                                                onClick={() => onEditImage(idx)}
                                                style={{
                                                    position: 'absolute', top: 8, left: 8,
                                                    background: 'var(--color-brand)', border: 'none',
                                                    borderRadius: 4, padding: '4px 8px',
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    color: 'white', fontSize: 11, fontWeight: 600,
                                                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                                    zIndex: 2
                                                }}
                                            >
                                                ✏️ Editar {imageSegments.length > 1 ? `Tramo ${idx + 1}` : ''}
                                            </button>
                                        )}

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => removeImageSegment(idx)}
                                            style={{
                                                position: 'absolute', top: 8, right: 8,
                                                background: 'rgba(239, 68, 68, 0.9)', border: 'none',
                                                borderRadius: 4, padding: '4px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                                zIndex: 2
                                            }}
                                            title="Eliminar este tramo"
                                        >
                                            <Trash2 size={12} />
                                        </button>

                                        <div style={{
                                            position: 'absolute', bottom: 6, right: 8,
                                            background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: 4,
                                            fontSize: 10, color: '#fff', fontWeight: 600
                                        }}>
                                            Tramo {idx + 1}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Image Below Button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        width: '100%', height: 42, border: '1px dashed var(--color-border)',
                                        borderRadius: 7, background: 'var(--color-surface)', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        transition: 'all 150ms ease-out', marginTop: 4,
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                                        e.currentTarget.style.background = 'var(--color-raised)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--color-border)'
                                        e.currentTarget.style.background = 'var(--color-surface)'
                                    }}
                                >
                                    <Plus size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Añadir imagen debajo</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            width: '100%', height: 84, border: '1px dashed var(--color-border)',
                            borderRadius: 7, background: 'transparent', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: 7, transition: 'all 150ms ease-out',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                            e.currentTarget.style.background = 'var(--color-brand-dim)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--color-border)'
                            e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        <Upload size={16} style={{ color: 'var(--color-text-muted)' }} />
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Subir imagen o video</span>
                    </button>
                )}
            </>)}

            {activeTab === 'triggers' && (<>
                {/* Triggers Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                        {editingTriggerId ? 'Configuración de Trigger' : `Triggers · ${triggers.length}`}
                    </div>
                </div>

                {!editingTriggerId ? (
                    // LIST VIEW
                    <>
                        {triggers.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                                {triggers.map((trigger, idx) => {
                                    const isDragged = dragProps.draggedIdx === idx
                                    const isDragOver = dragProps.dragOverIdx === idx
                                    let hint = trigger.hint
                                    if (!hint) {
                                        switch (trigger.type) {
                                            case 'click': hint = "Hacer clic en la zona"; break;
                                            case 'double_click': hint = "Doble clic en la zona"; break;
                                            case 'input': hint = "Llenar campo de texto"; break;
                                            case 'dropdown': hint = "Elegir opción"; break;
                                            case 'dependent_dropdown': hint = "Elegir subcategoría"; break;
                                            case 'keypress': hint = `Presionar ${trigger.keyCode || 'tecla'}`; break;
                                            case 'scroll_area': hint = "Desplazar área"; break;
                                            case 'radio': hint = "Seleccionar radio"; break;
                                            case 'checkbox': hint = "Marcar checkbox"; break;
                                            case 'input_date': hint = "Ingresar fecha"; break;
                                            default: hint = "Acción requerida";
                                        }
                                    }

                                    const draggableProps = {
                                        draggable: true,
                                        onDragStart: (e) => dragProps.onDragStart(e, idx),
                                        onDragOver: (e) => dragProps.onDragOver(e, idx),
                                        onDragLeave: dragProps.onDragLeave,
                                        onDrop: (e) => dragProps.onDrop(e, idx),
                                        onDragEnd: dragProps.onDragEnd,
                                        style: {
                                            opacity: isDragged ? 0.4 : 1,
                                            outline: isDragOver ? '2px solid var(--color-brand)' : 'none',
                                            outlineOffset: 1,
                                            transform: isDragOver ? (dragProps.draggedIdx < idx ? 'translateY(2px)' : 'translateY(-2px)') : 'none',
                                            transition: 'all 150ms ease',
                                        }
                                    }

                                    return (
                                        <div
                                            key={trigger.id}
                                            {...draggableProps}
                                            style={{
                                                ...draggableProps.style,
                                                display: 'flex', alignItems: 'center', padding: '10px',
                                                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                                borderRadius: 6, cursor: 'grab', gap: 10
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 700, padding: '2px 6px', letterSpacing: '0.04em', textTransform: 'uppercase',
                                                        borderRadius: 4, background: TRIGGER_COLORS[trigger.type]?.bgActive || 'var(--color-raised)',
                                                        color: TRIGGER_COLORS[trigger.type]?.label || 'var(--color-text-primary)'
                                                    }}>
                                                        {TRIGGER_LABELS[trigger.type] || trigger.type}
                                                    </span>
                                                    {trigger.isOptional && <span style={{ fontSize: 9, color: 'var(--color-text-tertiary)' }}>(OpcIONAL)</span>}
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {hint}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditingTriggerId(trigger.id)}
                                                style={{ background: 'var(--color-control)', border: '1px solid var(--color-border)', borderRadius: 4, cursor: 'pointer', color: 'var(--color-text-primary)', padding: 6, display: 'flex', alignItems: 'center' }}
                                                title="Editar"
                                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-brand)'}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                            >
                                                <Settings2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteTrigger(idx)}
                                                style={{ background: 'var(--color-control)', border: '1px solid var(--color-border)', borderRadius: 4, cursor: 'pointer', color: 'var(--color-danger)', padding: 6, display: 'flex', alignItems: 'center' }}
                                                title="Eliminar"
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,50,50,0.1)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-control)'}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '10px 0 20px 0' }}>
                                Sin triggers — añade uno abajo
                            </p>
                        )}

                        {/* Add trigger buttons */}
                        <div style={{
                            position: 'sticky', bottom: -16, margin: '10px -20px -16px -20px', padding: '16px 20px',
                            background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)',
                            zIndex: 10
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                <AddBtn onClick={() => addTrigger('click')} icon={MousePointer} label="+ Click" color={TRIGGER_COLORS.click.label} />
                                <AddBtn onClick={() => addTrigger('double_click')} icon={MousePointer} label="+ Doble Clic" color={TRIGGER_COLORS.double_click.label} />
                                <AddBtn onClick={() => addTrigger('keypress')} icon={Keyboard} label="+ Tecla" color={TRIGGER_COLORS.keypress.label} />
                                <AddBtn onClick={() => addTrigger('input')} icon={TextCursorInput} label="+ Input" color={TRIGGER_COLORS.input.label} />
                                <AddBtn onClick={() => addTrigger('dropdown')} icon={List} label="+ Lista" color={TRIGGER_COLORS.dropdown.label} />
                                <AddBtn onClick={() => addTrigger('dependent_dropdown')} icon={ListTree} label="+ Lista Doble" color={TRIGGER_COLORS.dependent_dropdown.label} />
                                <AddBtn onClick={() => addTrigger('scroll_area')} icon={GripVertical} label="+ Área Scroll" color={TRIGGER_COLORS.scroll_area.label} />
                                <AddBtn onClick={() => addTrigger('floating_window')} icon={AppWindow} label="+ Ventana Flot." color={TRIGGER_COLORS.floating_window.label} />
                                <AddBtn onClick={() => addTrigger('table_grid')} icon={Table} label="+ Grid/Tabla" color={TRIGGER_COLORS.table_grid.label} />
                                <AddBtn onClick={() => addTrigger('radio')} icon={CircleDot} label="+ Radio" color={TRIGGER_COLORS.radio.label} />
                                <AddBtn onClick={() => addTrigger('checkbox')} icon={CheckSquare} label="+ Checkbox" color={TRIGGER_COLORS.checkbox.label} />
                                <AddBtn onClick={() => addTrigger('input_date')} icon={CalendarDays} label="+ Calendario" color={TRIGGER_COLORS.input_date.label} />
                            </div>
                        </div>
                    </>
                ) : (
                    // EDIT VIEW
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>
                        <button
                            onClick={() => setEditingTriggerId(null)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                color: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 600,
                                padding: '4px 0', alignSelf: 'flex-start', transition: 'color 150ms ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                        >
                            <Undo2 size={14} /> Volver a la lista
                        </button>

                        {(() => {
                            const idx = triggers.findIndex(t => t.id === editingTriggerId)
                            if (idx === -1) {
                                // Just in case it gets deleted externally
                                setTimeout(() => setEditingTriggerId(null), 0)
                                return null
                            }
                            return (
                                <TriggerCard
                                    trigger={triggers[idx]}
                                    index={idx}
                                    allTriggers={triggers}
                                    nodes={nodes}
                                    onUpdate={patch => updateTrigger(idx, patch)}
                                    onDelete={() => {
                                        deleteTrigger(idx)
                                        setEditingTriggerId(null)
                                    }}
                                    isExpanded={true}
                                    onToggleExpand={() => { }}
                                    draggableProps={{}}
                                    onOpenScrollLibrary={onOpenScrollLibrary}
                                />
                            )
                        })()}
                    </div>
                )}
            </>)}
        </div>
    )
}
