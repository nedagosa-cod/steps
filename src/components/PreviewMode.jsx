import React, { useState, useCallback, useRef, useEffect } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { normalizeTriggers, TRIGGER_COLORS } from '../utils/triggers'

/* ── Overlay renderer — parallel model: all triggers completable in any order ── */
function renderTriggerOverlays(triggers, completedTriggers, handleClickTrigger, handleInputSubmit, handleInputChange, inputValues, setInputValues, inputRefs) {
    return triggers.map((trigger, idx) => {
        const hs = trigger.hotspot || { x: 30, y: 40, w: 20, h: 10 }
        const colors = TRIGGER_COLORS[trigger.type] || TRIGGER_COLORS.click
        const isDone = completedTriggers.has(trigger.id)
        const isBlocked = trigger.dependsOn && !completedTriggers.has(trigger.dependsOn)

        if (trigger.type === 'click') {
            return (
                <button
                    key={trigger.id}
                    onClick={() => !isDone && !isBlocked && handleClickTrigger(trigger)}
                    disabled={isBlocked}
                    style={{
                        position: 'absolute',
                        left: `${hs.x}%`, top: `${hs.y}%`,
                        width: `${hs.w}%`, height: `${hs.h}%`,
                        borderRadius: 4,
                        border: isDone
                            ? '1.5px solid rgba(46,165,103,0.5)'
                            : `1.5px solid ${colors.borderActive}`,
                        background: isDone ? 'rgba(46,165,103,0.12)' : colors.bgActive,
                        cursor: isDone || isBlocked ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 200ms ease-out',
                        opacity: isBlocked ? 0.35 : 1,
                        pointerEvents: isBlocked ? 'none' : 'auto',
                    }}
                    onMouseEnter={e => {
                        if (!isDone && !isBlocked) {
                            e.currentTarget.style.background = colors.bgActive
                            e.currentTarget.style.borderColor = colors.borderActive
                        }
                    }}
                    onMouseLeave={e => {
                        if (!isDone && !isBlocked) e.currentTarget.style.background = colors.bgActive
                    }}
                >
                    {isDone && <span style={{ fontSize: 14, color: '#5ac98a' }}>✓</span>}
                </button>
            )
        }

        if (trigger.type === 'input') {
            return (
                <div
                    key={trigger.id}
                    style={{
                        position: 'absolute',
                        left: `${hs.x}%`, top: `${hs.y}%`,
                        width: `${hs.w}%`, height: `${hs.h}%`,
                        borderRadius: 4,
                        border: isDone
                            ? '1.5px solid rgba(46,165,103,0.6)'
                            : `1.5px solid ${colors.borderActive}`,
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center',
                        transition: 'all 200ms ease-out',
                        opacity: isBlocked ? 0.35 : 1,
                        pointerEvents: isBlocked ? 'none' : 'auto',
                    }}
                >
                    {isDone ? (
                        <div style={{ width: '100%', height: '100%', background: 'rgba(46,165,103,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 14, color: '#5ac98a' }}>✓</span>
                        </div>
                    ) : (
                        <input
                            ref={el => inputRefs.current[trigger.id] = el}
                            type="text"
                            value={inputValues[trigger.id] || ''}
                            onChange={e => {
                                const val = e.target.value
                                setInputValues(prev => ({ ...prev, [trigger.id]: val }))
                                if (!isBlocked) handleInputChange(trigger, val)
                            }}
                            onKeyDown={e => { if (e.key === 'Enter' && !isBlocked) handleInputSubmit(trigger) }}
                            placeholder={trigger.validationValue ? `"${trigger.validationValue}"` : '…'}
                            disabled={isBlocked}
                            style={{
                                width: '100%', height: '100%',
                                background: 'rgba(10,13,18,0.75)',
                                border: 'none', outline: 'none',
                                color: '#e2eaf4',
                                fontSize: 'clamp(11px, 1.3vw, 18px)',
                                padding: '0 6px',
                                fontFamily: 'inherit',
                                caretColor: colors.label,
                            }}
                        />
                    )}
                </div>
            )
        }

        return null
    })
}

export default function PreviewMode({ nodes, edges, onExit }) {
    const startNode = nodes.find(n => !edges.some(e => e.target === n.id)) || nodes[0]
    const [currentNodeId, setCurrentNodeId] = useState(startNode?.id)
    // Parallel model: Set of completed trigger IDs (any order)
    const [completedTriggers, setCompletedTriggers] = useState(new Set())
    const [inputValues, setInputValues] = useState({}) // keyed by trigger.id
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [transitioning, setTransitioning] = useState(false)

    const imgWrapperRef = useRef(null)
    const inputRefs = useRef({})

    const currentNode = nodes.find(n => n.id === currentNodeId)

    // Compute linear node order following edges
    const nodeOrder = (() => {
        const order = []
        let cursor = nodes.find(n => !edges.some(e => e.target === n.id))?.id
        const visited = new Set()
        while (cursor && !visited.has(cursor)) {
            order.push(cursor)
            visited.add(cursor)
            cursor = edges.find(e => e.source === cursor)?.target
        }
        return order
    })()

    const stepIndex = nodeOrder.indexOf(currentNodeId)
    const totalSteps = nodeOrder.length

    const getNextNodeId = useCallback(() =>
        edges.find(e => e.source === currentNodeId)?.target
        , [currentNodeId, edges])

    const navigate = useCallback((targetId) => {
        setTransitioning(true)
        setError('')
        setSuccess(false)
        setInputValues({})
        setCompletedTriggers(new Set())
        setTimeout(() => {
            setCurrentNodeId(targetId)
            setTransitioning(false)
        }, 280)
    }, [])

    // Called after each trigger completes — check if ALL are done
    const onTriggerComplete = useCallback((triggerId, allTriggers) => {
        setCompletedTriggers(prev => {
            const next = new Set(prev)
            next.add(triggerId)
            // Check if every trigger in this node is now done
            const allDone = allTriggers.every(t => next.has(t.id))
            if (allDone) {
                const nextId = getNextNodeId()
                if (nextId) {
                    // Navigate with a slight delay so the ✓ is visible
                    setTimeout(() => navigate(nextId), 350)
                } else {
                    setSuccess(true)
                }
            }
            return next
        })
    }, [getNextNodeId, navigate])

    if (!currentNode) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'var(--color-canvas)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>No hay nodos.</p>
            </div>
        )
    }

    const { data } = currentNode
    const triggers = normalizeTriggers(data)

    const handleClickTrigger = (trigger) => {
        if (completedTriggers.has(trigger.id)) return
        onTriggerComplete(trigger.id, triggers)
    }

    const handleInputChange = (trigger, newValue) => {
        if (completedTriggers.has(trigger.id)) return
        const inputVal = (newValue || '').trim()
        const expected = (trigger.validationValue || '').trim()
        // Auto-complete as you type if there is a required expected value
        if (expected && inputVal === expected) {
            setError('')
            onTriggerComplete(trigger.id, triggers)
        }
    }

    const handleInputSubmit = (trigger) => {
        if (completedTriggers.has(trigger.id)) return
        const inputVal = (inputValues[trigger.id] || '').trim()
        const expected = (trigger.validationValue || '').trim()
        if (!expected || inputVal === expected) {
            setError('')
            onTriggerComplete(trigger.id, triggers)
        } else {
            setError('Texto incorrecto. Intenta de nuevo.')
            setTimeout(() => setError(''), 2200)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(10,13,18,0.97)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
        }}>
            {/* ── Top bar ── */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 24px',
                borderBottom: '1px solid var(--color-border-subtle)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-brand)' }}>
                        Preview
                    </span>
                    <span style={{ color: 'var(--color-border)', fontSize: 12 }}>·</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {data.label || 'Sin nombre'}
                    </span>
                </div>

                {/* Screen step pills */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {nodeOrder.map((id, i) => (
                        <div key={id} style={{
                            height: 3, borderRadius: 99,
                            width: id === currentNodeId ? 18 : 5,
                            background: i <= stepIndex ? 'var(--color-brand)' : 'var(--color-border)',
                            transition: 'width 250ms ease-out, background 250ms ease-out',
                        }} />
                    ))}
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 6, fontVariantNumeric: 'tabular-nums' }}>
                        {stepIndex + 1}/{totalSteps}
                    </span>
                </div>

                <button
                    onClick={onExit}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 6,
                        border: '1px solid var(--color-border)', background: 'transparent',
                        cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 500,
                        transition: 'all 150ms ease-out',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                >
                    <X size={12} />
                    Salir
                </button>
            </div>

            {/* ── Main image container ── */}
            <div style={{
                maxWidth: 920, width: '88vw',
                borderRadius: 12, border: '1px solid var(--color-border)',
                overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
                transition: 'opacity 280ms ease-out, transform 280ms ease-out, filter 280ms ease-out',
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? 'scale(0.98) translateY(6px)' : 'scale(1) translateY(0)',
                filter: transitioning ? 'blur(3px)' : 'blur(0)',
                position: 'relative',
            }}>
                {data.image ? (
                    <div ref={imgWrapperRef} style={{ position: 'relative', lineHeight: 0 }}>
                        <img
                            src={data.image}
                            alt="screen"
                            draggable={false}
                            style={{ width: '100%', height: '60vh', objectFit: 'cover', display: 'block' }}
                        />
                        {renderTriggerOverlays(triggers, completedTriggers, handleClickTrigger, handleInputSubmit, handleInputChange, inputValues, setInputValues, inputRefs)}
                    </div>
                ) : (
                    <div ref={imgWrapperRef} style={{ position: 'relative', height: '60vh', background: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 13, color: 'var(--color-text-muted)', pointerEvents: 'none' }}>Sin imagen en este nodo</span>
                        {renderTriggerOverlays(triggers, completedTriggers, handleClickTrigger, handleInputSubmit, handleInputChange, inputValues, setInputValues, inputRefs)}
                    </div>
                )}
            </div>

            {/* ── Trigger progress dots (when > 1 trigger) ── */}
            {triggers.length > 1 && (
                <div style={{
                    display: 'flex', gap: 5, marginTop: 14, alignItems: 'center',
                    opacity: transitioning ? 0 : 1,
                    transition: 'opacity 280ms ease-out',
                }}>
                    {triggers.map((t) => {
                        const done = completedTriggers.has(t.id)
                        const colors = TRIGGER_COLORS[t.type] || TRIGGER_COLORS.click
                        return (
                            <div key={t.id} style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '3px 9px', borderRadius: 20,
                                border: `1px solid ${done ? 'rgba(46,165,103,0.35)' : colors.border}`,
                                background: done ? 'rgba(46,165,103,0.08)' : colors.bg,
                                transition: 'all 250ms ease-out',
                            }}>
                                <span style={{
                                    fontSize: 8, fontWeight: 700,
                                    color: done ? '#5ac98a' : colors.label,
                                }}>
                                    {done ? '✓' : '○'}
                                </span>
                                <span style={{
                                    fontSize: 9, fontWeight: done ? 600 : 400,
                                    letterSpacing: '0.06em', textTransform: 'uppercase',
                                    color: done ? '#5ac98a' : colors.label,
                                }}>
                                    {t.type}
                                </span>
                            </div>
                        )
                    })}
                    {/* Pending count */}
                    {completedTriggers.size < triggers.length && (
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 2 }}>
                            {triggers.length - completedTriggers.size} restante{triggers.length - completedTriggers.size !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

            {/* ── Feedback ── */}
            {error && (
                <div style={{
                    marginTop: 12, display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 14px', borderRadius: 7,
                    border: '1px solid rgba(192,64,64,0.3)', background: 'rgba(192,64,64,0.1)',
                    fontSize: 12, color: '#d97979',
                }}>
                    <AlertCircle size={13} />
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    marginTop: 12, display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 18px', borderRadius: 7,
                    border: '1px solid rgba(46,165,103,0.3)', background: 'rgba(46,165,103,0.1)',
                    fontSize: 12, color: '#5ac98a',
                }}>
                    <CheckCircle size={13} />
                    ¡Simulación completada!
                </div>
            )}
        </div>
    )
}
