import React, { useRef } from 'react'
import { ArrowLeft, ImageOff } from 'lucide-react'
import { normalizeTriggers } from '../../../shared/utils/triggers'
import { InteractiveTrigger } from './InteractiveTrigger'

export default function FocusMode({ node, onExit, onUpdateNode }) {
    const containerRef = useRef(null)

    if (!node) return null
    const { data } = node
    const triggers = normalizeTriggers(data)

    const updateTrigger = (idx, patch) => {
        const newTriggers = triggers.map((t, i) => i === idx ? { ...t, ...patch } : t)
        onUpdateNode(node.id, { triggers: newTriggers })
    }

    const updateChildTrigger = (parentIdx, childIdx, patch) => {
        const parent = triggers[parentIdx]
        const newChildren = parent.triggers.map((c, i) => i === childIdx ? { ...c, ...patch } : c)
        updateTrigger(parentIdx, { triggers: newChildren })
    }

    const childRefs = useRef({})
    const getInnerRef = (id) => {
        if (!childRefs.current[id]) {
            childRefs.current[id] = { current: null }
        }
        return childRefs.current[id]
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
                flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                overflow: 'auto', padding: 40, background: '#000'
            }}>
                {data.image ? (
                    <div ref={containerRef} style={{ position: 'relative', width: 'auto', maxWidth: '100%', display: 'inline-block', boxShadow: '0 20px 80px rgba(0,0,0,0.6)' }}>
                        {data.mediaType === 'video' ? (
                            <video
                                src={Array.isArray(data.image) ? data.image[0] : data.image}
                                autoPlay muted loop playsInline
                                style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: 2 }}
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                {(Array.isArray(data.image) ? data.image : [data.image]).map((src, idx) => (
                                    <img
                                        key={idx} src={src} alt={`Enfoque de pantalla ${idx}`} draggable={false}
                                        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 2 }}
                                    />
                                ))}
                            </div>
                        )}
                        {triggers.map((t, i) => {
                            const innerRef = t.type === 'scroll_area' ? getInnerRef(t.id) : null;
                            return (
                                <InteractiveTrigger
                                    key={t.id}
                                    trigger={t}
                                    index={i}
                                    onUpdate={patch => updateTrigger(i, patch)}
                                    containerRef={containerRef}
                                    innerRef={innerRef}
                                >
                                    {t.type === 'scroll_area' && t.triggers && t.triggers.length > 0 && t.triggers.map((child, childIdx) => (
                                        <InteractiveTrigger
                                            key={child.id}
                                            trigger={child}
                                            index={childIdx}
                                            onUpdate={patch => updateChildTrigger(i, childIdx, patch)}
                                            containerRef={innerRef}
                                        />
                                    ))}
                                </InteractiveTrigger>
                            )
                        })}
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
