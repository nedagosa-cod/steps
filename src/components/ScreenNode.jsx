import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { ImageOff, MonitorPlay } from 'lucide-react'
import { normalizeTriggers, TRIGGER_COLORS, TRIGGER_LABELS } from '../utils/triggers'

const ScreenNode = memo(({ data, selected }) => {
    const { label, image } = data
    const triggers = normalizeTriggers(data)

    return (
        <div
            style={{
                width: 272,
                background: 'var(--color-raised)',
                borderRadius: 10,
                border: selected
                    ? '1px solid var(--color-border-stronger)'
                    : '1px solid var(--color-border)',
                boxShadow: selected
                    ? '0 0 0 3px var(--color-brand-dim), 0 8px 32px rgba(0,0,0,0.5)'
                    : '0 2px 16px rgba(0,0,0,0.35)',
                overflow: 'hidden',
                transition: 'border 150ms ease-out, box-shadow 150ms ease-out',
            }}
        >
            {/* ── Window chrome ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px',
                background: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border-subtle)',
            }}>
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#c04040', opacity: 0.8 }} />
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#c47b1a', opacity: 0.8 }} />
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#2ea567', opacity: 0.8 }} />
                </div>
                <MonitorPlay size={11} style={{ color: 'var(--color-brand)', flexShrink: 0, opacity: 0.7 }} />
                <span style={{
                    fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    letterSpacing: '0.01em',
                }}>
                    {label || 'Sin nombre'}
                </span>
                {/* Trigger count badge */}
                {triggers.length > 0 && (
                    <span style={{
                        fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)',
                        background: 'var(--color-canvas)', border: '1px solid var(--color-border)',
                        borderRadius: 4, padding: '1px 5px', flexShrink: 0, fontVariantNumeric: 'tabular-nums',
                    }}>
                        {triggers.length}
                    </span>
                )}
            </div>

            {/* ── Image area with trigger overlays ── */}
            <div style={{ position: 'relative', height: 176, background: 'var(--color-canvas)' }}>
                {/* Background: image or placeholder */}
                {image ? (
                    <img
                        src={image} alt="Screen" draggable={false}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 8,
                        pointerEvents: 'none',
                    }}>
                        <ImageOff size={22} style={{ color: 'var(--color-text-muted)' }} />
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.02em' }}>
                            Sin imagen
                        </span>
                    </div>
                )}
                {/* Trigger overlays — always rendered on top, regardless of image */}
                {triggers.map((t, i) => {
                    const hs = t.hotspot || { x: 40, y: 40, w: 20, h: 10 }
                    const colors = TRIGGER_COLORS[t.type] || TRIGGER_COLORS.click
                    return (
                        <div
                            key={t.id}
                            style={{
                                position: 'absolute',
                                left: `${hs.x}%`, top: `${hs.y}%`,
                                width: `${hs.w}%`, height: `${hs.h}%`,
                                border: `1.5px dashed ${colors.border}`,
                                background: colors.bg,
                                borderRadius: 3,
                                pointerEvents: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <span style={{
                                fontSize: 8, fontWeight: 700, color: colors.label,
                                background: 'rgba(10,13,18,0.7)',
                                borderRadius: 3, padding: '1px 4px', lineHeight: 1.2,
                            }}>
                                {i + 1}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* ── Trigger pills ── */}
            {triggers.length > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '5px 10px',
                    borderTop: '1px solid var(--color-border-subtle)',
                    background: 'var(--color-surface)',
                    flexWrap: 'wrap',
                }}>
                    {triggers.map((t, i) => {
                        const colors = TRIGGER_COLORS[t.type] || TRIGGER_COLORS.click
                        return (
                            <React.Fragment key={t.id}>
                                {i > 0 && (
                                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)', flexShrink: 0 }}>→</span>
                                )}
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 3,
                                    fontSize: 9, fontWeight: 600, letterSpacing: '0.05em',
                                    color: colors.label,
                                    background: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 4, padding: '2px 5px', flexShrink: 0,
                                }}>
                                    {i + 1} · {TRIGGER_LABELS[t.type]}
                                </span>
                            </React.Fragment>
                        )
                    })}
                </div>
            )}

            {/* ── Handles ── */}
            <Handle type="target" position={Position.Left} style={{ width: 10, height: 10, background: 'var(--color-canvas)', border: '2px solid var(--color-brand)', borderRadius: '50%', left: -5 }} />
            <Handle type="source" position={Position.Right} style={{ width: 10, height: 10, background: 'var(--color-canvas)', border: '2px solid var(--color-brand)', borderRadius: '50%', right: -5 }} />
        </div>
    )
})

export default ScreenNode
