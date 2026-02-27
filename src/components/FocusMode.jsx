import React, { useRef, useState, useEffect } from 'react'
import { ArrowLeft, ImageOff } from 'lucide-react'
import { normalizeTriggers, TRIGGER_COLORS, TRIGGER_LABELS } from '../utils/triggers'

function InteractiveTrigger({ trigger, index, onUpdate, containerRef }) {
    const hs = trigger.hotspot || { x: 40, y: 40, w: 20, h: 10 }
    const colors = TRIGGER_COLORS[trigger.type] || TRIGGER_COLORS.click

    const [localHs, setLocalHs] = useState(hs)
    const localHsRef = useRef(hs)
    const actionRef = useRef(null) // 'drag' | 'resize' | null

    useEffect(() => {
        if (!actionRef.current) {
            setLocalHs(hs)
            localHsRef.current = hs
        }
    }, [hs])

    const onPointerDown = (e, type) => {
        e.stopPropagation()
        e.preventDefault() // prevent native image dragging if clicked
        if (!containerRef.current) return

        actionRef.current = type
        const rect = containerRef.current.getBoundingClientRect()
        const startX = e.clientX
        const startY = e.clientY
        const startHs = { ...localHsRef.current }

        const onPointerMove = (ev) => {
            const dx = ev.clientX - startX
            const dy = ev.clientY - startY
            const dpX = parseFloat(((dx / rect.width) * 100).toFixed(2))
            const dpY = parseFloat(((dy / rect.height) * 100).toFixed(2))

            let nextHs = { ...startHs }

            if (type === 'resize') {
                nextHs.w = Math.max(2, startHs.w + dpX)
                nextHs.h = Math.max(2, startHs.h + dpY)
            } else {
                nextHs.x = Math.min(100 - startHs.w, Math.max(0, startHs.x + dpX))
                nextHs.y = Math.min(100 - startHs.h, Math.max(0, startHs.y + dpY))
            }

            setLocalHs(nextHs)
            localHsRef.current = nextHs
        }

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
            actionRef.current = null
            onUpdate({ hotspot: localHsRef.current })
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
    }

    return (
        <div
            onPointerDown={e => onPointerDown(e, 'drag')}
            style={{
                position: 'absolute',
                left: `${localHs.x}%`, top: `${localHs.y}%`,
                width: `${localHs.w}%`, height: `${localHs.h}%`,
                border: `1.5px dashed ${colors.border}`,
                background: colors.bg,
                borderRadius: 3,
                cursor: 'move',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: actionRef.current ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
                zIndex: actionRef.current ? 10 : 1, // bring to front while interacting
            }}
        >
            {/* The label */}
            <span style={{
                fontSize: 10, fontWeight: 700, color: colors.label,
                background: 'rgba(10,13,18,0.7)',
                borderRadius: 3, padding: '2px 6px', lineHeight: 1.2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                pointerEvents: 'none', // ignore mouse on text
            }}>
                {index + 1} · {TRIGGER_LABELS[trigger.type]}
            </span>

            {/* The resize handle bottom-right */}
            <div
                onPointerDown={e => onPointerDown(e, 'resize')}
                style={{
                    position: 'absolute', right: -4, bottom: -4,
                    width: 14, height: 14, background: colors.label,
                    border: '2px solid #fff', borderRadius: '50%',
                    cursor: 'se-resize',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
            />
        </div>
    )
}

export default function FocusMode({ node, onExit, onUpdateNode }) {
    const containerRef = useRef(null)

    if (!node) return null
    const { data } = node
    const triggers = normalizeTriggers(data)

    const updateTrigger = (idx, patch) => {
        const newTriggers = triggers.map((t, i) => i === idx ? { ...t, ...patch } : t)
        onUpdateNode(node.id, { triggers: newTriggers })
    }

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#0a0d12',
            display: 'flex', flexDirection: 'column',
            zIndex: 5,
        }}>
            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                borderBottom: '1px solid var(--color-border-subtle)',
                background: 'var(--color-surface)',
            }}>
                <button
                    onClick={onExit}
                    title="Volver a la vista de nodos"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 500,
                        padding: '4px 8px', borderRadius: 4,
                        transition: 'background 150ms ease, color 150ms ease'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--color-raised)'
                        e.currentTarget.style.color = 'var(--color-text-primary)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--color-text-secondary)'
                    }}
                >
                    <ArrowLeft size={16} />
                    <span>Volver a nodos</span>
                </button>

                <div style={{ width: 1, height: 16, background: 'var(--color-border)' }} />

                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 4,
                        background: 'var(--color-raised)', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)'
                    }}>
                        Editando
                    </span>
                    {data.label || 'Pantalla sin nombre'}
                </span>
            </div>

            {/* ── Main Canvas ── */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'auto', padding: 40, background: '#000'
            }}>
                {data.image ? (
                    <div ref={containerRef} style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'inline-block', boxShadow: '0 20px 80px rgba(0,0,0,0.6)' }}>
                        <img
                            src={data.image} alt="Enfoque de pantalla" draggable={false}
                            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 120px)', display: 'block', borderRadius: 2 }}
                        />
                        {triggers.map((t, i) => (
                            <InteractiveTrigger
                                key={t.id}
                                trigger={t}
                                index={i}
                                onUpdate={patch => updateTrigger(i, patch)}
                                containerRef={containerRef}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--color-text-muted)' }}>
                        <ImageOff size={48} opacity={0.5} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>No hay imagen en este nodo</span>
                        <span style={{ fontSize: 11 }}>Sube una desde el panel de configuración (a la derecha) para poder posicionar los triggers.</span>
                    </div>
                )}
            </div>
        </div>
    )
}
