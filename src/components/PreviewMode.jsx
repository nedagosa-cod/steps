import React, { useState, useCallback, useRef, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, GripHorizontal, ChevronDown, Maximize2, Minimize2 } from 'lucide-react'
import { normalizeTriggers, TRIGGER_COLORS } from '../utils/triggers'

function DraggableHUD({ children }) {
    const [pos, setPos] = useState({ x: 24, y: 24 })
    const isDragging = useRef(false)
    const dragStart = useRef({ x: 0, y: 0 })
    const initialPos = useRef({ x: 0, y: 0 })

    const onPointerDown = (e) => {
        isDragging.current = true
        dragStart.current = { x: e.clientX, y: e.clientY }
        initialPos.current = { ...pos }

        const onPointerMove = (ev) => {
            if (!isDragging.current) return
            const dx = ev.clientX - dragStart.current.x
            const dy = ev.clientY - dragStart.current.y

            setPos({
                x: Math.max(0, Math.min(window.innerWidth - 200, initialPos.current.x + dx)),
                y: Math.max(0, Math.min(window.innerHeight - 50, initialPos.current.y + dy))
            })
        }

        const onPointerUp = () => {
            isDragging.current = false
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
    }

    return (
        <div style={{
            position: 'absolute',
            left: pos.x, top: pos.y,
            zIndex: 100,
            display: 'flex', flexDirection: 'column', gap: 8,
            minWidth: 260,
            pointerEvents: 'none',
        }}>
            <div style={{
                background: 'rgba(10,13,18,0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset',
                padding: '12px 16px',
                pointerEvents: 'auto',
                display: 'flex', flexDirection: 'column',
            }}>
                <div
                    onPointerDown={onPointerDown}
                    style={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        height: 16, cursor: 'grab', color: 'var(--color-text-tertiary)',
                        marginBottom: 10, marginTop: -6,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
                >
                    <GripHorizontal size={14} />
                </div>
                {children}
            </div>
        </div>
    )
}

/* ── Overlay renderer — parallel model: all triggers completable in any order ── */
function renderTriggerOverlays(triggers, completedTriggers, handleClickTrigger, handleInputSubmit, handleInputChange, inputValues, setInputValues, inputRefs) {
    return triggers.map((trigger, idx) => {
        const hs = trigger.hotspot || { x: 30, y: 40, w: 20, h: 10 }
        const colors = TRIGGER_COLORS[trigger.type] || TRIGGER_COLORS.click
        const isDone = completedTriggers.has(trigger.id)
        const depsArray = Array.isArray(trigger.dependsOn)
            ? trigger.dependsOn
            : (trigger.dependsOn ? [trigger.dependsOn] : [])

        const isBlocked = depsArray.length > 0 && depsArray.some(depId => !completedTriggers.has(depId))

        if (trigger.type === 'click' || trigger.type === 'double_click') {
            const isClick = trigger.type === 'click'
            const isDbl = trigger.type === 'double_click'

            return (
                <button
                    key={trigger.id}
                    onClick={() => { if (isClick && !isDone && !isBlocked) handleClickTrigger(trigger) }}
                    onDoubleClick={() => { if (isDbl && !isDone && !isBlocked) handleClickTrigger(trigger) }}
                    disabled={isBlocked}
                    style={{
                        position: 'absolute',
                        left: `${hs.x}%`, top: `${hs.y}%`,
                        width: `${hs.w}%`, height: `${hs.h}%`,
                        borderRadius: 4,
                        border: trigger.hidden ? 'none' : (isDone
                            ? '1.5px solid rgba(46,165,103,0.5)'
                            : `1.5px solid ${colors.borderActive}`),
                        background: trigger.hidden ? 'transparent' : (isDone ? 'rgba(46,165,103,0.12)' : colors.bgActive),
                        cursor: isDone || isBlocked ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 200ms ease-out',
                        opacity: isBlocked ? 0.35 : 1,
                        pointerEvents: isBlocked ? 'none' : 'auto',
                    }}
                    onMouseEnter={e => {
                        if (!isDone && !isBlocked && !trigger.hidden) {
                            e.currentTarget.style.background = colors.bgActive
                            e.currentTarget.style.borderColor = colors.borderActive
                        }
                    }}
                    onMouseLeave={e => {
                        if (!isDone && !isBlocked && !trigger.hidden) e.currentTarget.style.background = colors.bgActive
                    }}
                >
                    {isDone && !trigger.hidden && <span style={{ fontSize: 14, color: '#5ac98a' }}>✓</span>}
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
                        border: trigger.hidden ? 'none' : (isDone
                            ? '1.5px solid rgba(46,165,103,0.6)'
                            : `1.5px solid ${colors.borderActive}`),
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center',
                        transition: 'all 200ms ease-out',
                        opacity: isBlocked ? 0.35 : 1,
                        pointerEvents: isBlocked ? 'none' : 'auto',
                    }}
                >
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <input
                            ref={el => inputRefs.current[trigger.id] = el}
                            type={trigger.isPassword ? "password" : "text"}
                            value={inputValues[trigger.id] || ''}
                            onChange={e => {
                                const val = e.target.value
                                setInputValues(prev => ({ ...prev, [trigger.id]: val }))
                                if (!isBlocked && !isDone) handleInputChange(trigger, val)
                            }}
                            onKeyDown={e => { if (e.key === 'Enter' && !isBlocked && !isDone) handleInputSubmit(trigger) }}
                            placeholder={trigger.placeholderText ?? (trigger.isPassword ? "••••••" : "Escribe aquí...")}
                            disabled={isBlocked || isDone}
                            style={{
                                width: '100%', height: '100%',
                                background: trigger.hidden ? 'transparent' : (isDone ? 'rgba(46,165,103,0.15)' : 'rgba(10,13,18,0.75)'),
                                border: 'none', outline: 'none',
                                color: trigger.hidden ? 'var(--color-text-primary)' : (isDone ? '#5ac98a' : '#e2eaf4'),
                                fontSize: trigger.fontSize ? `${trigger.fontSize}px` : 'clamp(11px, 1.3vw, 18px)',
                                padding: '0 6px',
                                fontFamily: 'inherit',
                                caretColor: colors.label,
                            }}
                        />
                        {isDone && !trigger.hidden && (
                            <div style={{
                                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                pointerEvents: 'none',
                            }}>
                                <span style={{ fontSize: 14, color: '#5ac98a' }}>✓</span>
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        if (trigger.type === 'dropdown') {
            const options = [...new Set((trigger.optionsText || '').split('\n').map(o => o.trim()).filter(Boolean))]
            const useNative = trigger.nativeStyles && !trigger.hidden
            return (
                <div
                    key={trigger.id}
                    style={{
                        position: 'absolute',
                        left: `${hs.x}%`, top: `${hs.y}%`,
                        width: `${hs.w}%`, height: `${hs.h}%`,
                        borderRadius: 4,
                        border: trigger.hidden ? 'none' : (isDone
                            ? '1.5px solid rgba(46,165,103,0.6)'
                            : (useNative ? 'none' : `1.5px solid ${colors.borderActive}`)),
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center',
                        transition: 'all 200ms ease-out',
                        opacity: isBlocked ? 0.35 : 1,
                        pointerEvents: isBlocked ? 'none' : 'auto',
                    }}
                >
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <select
                            value={inputValues[trigger.id] || ''}
                            onChange={e => {
                                const val = e.target.value
                                setInputValues(prev => ({ ...prev, [trigger.id]: val }))
                                if (!isBlocked && !isDone) {
                                    if (!trigger.validationValue || val === trigger.validationValue) {
                                        handleClickTrigger(trigger)
                                    }
                                }
                            }}
                            disabled={isBlocked}
                            style={{
                                width: '100%', height: '100%',
                                background: trigger.hidden ? 'transparent' : (
                                    trigger.bgColor ? trigger.bgColor : (
                                        isDone && !useNative ? 'rgba(46,165,103,0.15)' : (useNative ? '#ffffff' : 'rgba(10,13,18,0.75)')
                                    )
                                ),
                                border: useNative ? (isDone ? '2px solid #5ac98a' : '1px solid #ccc') : 'none',
                                borderRadius: useNative ? 4 : 0,
                                outline: 'none',
                                color: trigger.hidden ? 'var(--color-text-primary)' : (
                                    trigger.textColor ? trigger.textColor : (
                                        isDone && !useNative ? '#5ac98a' : (useNative ? '#000000' : '#e2eaf4')
                                    )
                                ),
                                fontSize: trigger.fontSize ? `${trigger.fontSize}px` : (useNative ? '14px' : 'clamp(11px, 1.3vw, 18px)'),
                                padding: useNative ? '0 8px' : '0 6px',
                                fontFamily: useNative ? 'system-ui, sans-serif' : 'inherit',
                                appearance: useNative ? 'auto' : 'none',
                            }}
                        >
                            <option value="" disabled>Selecciona...</option>
                            {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                        {!useNative && (
                            <div style={{
                                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
                            }}>
                                {isDone && !trigger.hidden ? (
                                    <span style={{ fontSize: 14, color: trigger.textColor || '#5ac98a' }}>✓</span>
                                ) : (
                                    !trigger.hidden && <ChevronDown size={14} style={{ color: trigger.textColor || '#e2eaf4' }} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        if (trigger.type === 'dependent_dropdown') {
            const rows = (trigger.optionsText || '').split('\n').filter(Boolean)
            const cMap = {}
            rows.forEach(r => {
                let parts = r.split(/\t/)
                if (parts.length < 2) parts = r.split(/ - /)
                if (parts.length < 2) parts = r.split(/;/)
                if (parts.length < 2) parts = r.split(/,/)
                if (parts.length < 2) parts = r.split(/ {2,}/)
                if (parts.length < 2 && r.includes('-')) {
                    const idx = r.indexOf('-')
                    parts = [r.substring(0, idx), r.substring(idx + 1)]
                }
                if (parts.length < 2 && r.includes(':')) {
                    const idx = r.indexOf(':')
                    parts = [r.substring(0, idx), r.substring(idx + 1)]
                }
                parts = parts.map(s => s.trim()).filter(Boolean)

                const colIdx = trigger.dataColumnIndex ? Math.max(2, parseInt(trigger.dataColumnIndex)) : 2
                let parentColIdx = colIdx - 2
                let childColIdx = colIdx - 1

                if (parts.length === 2 && colIdx > 2) {
                    parentColIdx = 0
                    childColIdx = 1
                }

                if (parts.length > parentColIdx && parts.length > childColIdx) {
                    const cat = parts[parentColIdx].toLowerCase()
                    const sub = parts[childColIdx]
                    if (!cMap[cat]) cMap[cat] = []
                    if (!cMap[cat].includes(sub)) {
                        cMap[cat].push(sub)
                    }
                }
            })
            const useNative = trigger.nativeStyles && !trigger.hidden

            const rawParentVal = inputValues[trigger.dependsOnTriggerId] || ''
            const parentVal = rawParentVal.toLowerCase().trim()
            const subcategories = cMap[parentVal] || []

            return (
                <div
                    key={trigger.id}
                    style={{
                        position: 'absolute',
                        left: `${hs.x}%`, top: `${hs.y}%`,
                        width: `${hs.w}%`, height: `${hs.h}%`,
                        borderRadius: 4,
                        border: trigger.hidden ? 'none' : (isDone
                            ? '1.5px solid rgba(46,165,103,0.6)'
                            : (useNative ? 'none' : `1.5px solid ${colors.borderActive}`)),
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center',
                        transition: 'all 200ms ease-out',
                        opacity: isBlocked || !parentVal ? 0.35 : 1,
                        pointerEvents: isBlocked || !parentVal ? 'none' : 'auto',
                    }}
                >
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <select
                            value={inputValues[trigger.id] || ''}
                            onChange={e => {
                                const val = e.target.value
                                setInputValues(prev => ({ ...prev, [trigger.id]: val }))
                                if (!isBlocked && !isDone) {
                                    if (!trigger.validationValue || val === trigger.validationValue) {
                                        handleClickTrigger(trigger)
                                    }
                                }
                            }}
                            disabled={isBlocked || !parentVal}
                            style={{
                                width: '100%', height: '100%',
                                background: trigger.hidden ? 'transparent' : (
                                    trigger.bgColor ? trigger.bgColor : (
                                        isDone && !useNative ? 'rgba(46,165,103,0.15)' : (useNative ? '#ffffff' : 'rgba(10,13,18,0.75)')
                                    )
                                ),
                                border: useNative ? (isDone ? '2px solid #5ac98a' : '1px solid #ccc') : 'none',
                                borderRadius: useNative ? 4 : 0,
                                outline: 'none',
                                color: trigger.hidden ? 'var(--color-text-primary)' : (
                                    trigger.textColor ? trigger.textColor : (
                                        isDone && !useNative ? '#5ac98a' : (useNative ? '#000000' : '#e2eaf4')
                                    )
                                ),
                                fontSize: trigger.fontSize ? `${trigger.fontSize}px` : (useNative ? '14px' : 'clamp(11px, 1.3vw, 18px)'),
                                padding: useNative ? '0 8px' : '0 6px',
                                fontFamily: useNative ? 'system-ui, sans-serif' : 'inherit',
                                appearance: useNative ? 'auto' : 'none',
                            }}
                        >
                            <option value="" disabled>Selecciona...</option>
                            {subcategories.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                        {!useNative && (
                            <div style={{
                                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
                            }}>
                                {isDone && !trigger.hidden ? (
                                    <span style={{ fontSize: 14, color: trigger.textColor || '#5ac98a' }}>✓</span>
                                ) : (
                                    !trigger.hidden && <ChevronDown size={14} style={{ color: trigger.textColor || '#e2eaf4' }} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        if (trigger.type === 'keypress') {
            return (
                <div
                    key={trigger.id}
                    style={{
                        position: 'absolute',
                        left: `${hs.x}%`, top: `${hs.y}%`,
                        width: `${hs.w}%`, height: `${hs.h}%`,
                        borderRadius: 4,
                        border: trigger.hidden ? 'none' : (isDone
                            ? '1.5px solid rgba(46,165,103,0.6)'
                            : `1.5px solid ${colors.borderActive}`),
                        background: trigger.hidden ? 'transparent' : (isDone ? 'rgba(46,165,103,0.12)' : colors.bgActive),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 200ms ease-out',
                        opacity: isBlocked ? 0.35 : 1,
                        pointerEvents: 'none', // just visual
                    }}
                >
                    {!trigger.hidden && (
                        isDone ? (
                            <span style={{ fontSize: 14, color: '#5ac98a' }}>✓</span>
                        ) : (
                            <span style={{
                                fontSize: 'clamp(10px, 1vw, 14px)',
                                fontWeight: 700, color: colors.label,
                                background: 'rgba(10,13,18,0.5)',
                                padding: '2px 6px', borderRadius: 4,
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                {trigger.keyCode || '?'}
                            </span>
                        )
                    )}
                </div>
            )
        }

        if (trigger.type === 'scroll_area') {
            return (
                <div
                    key={trigger.id}
                    style={{
                        position: 'absolute',
                        left: `${hs.x}%`, top: `${hs.y}%`,
                        width: `${hs.w}%`, height: `${hs.h}%`,
                        border: trigger.hidden ? 'none' : `1px dashed ${colors.border}`,
                        overflowY: 'auto', overflowX: 'hidden',
                        display: 'block',
                        opacity: isBlocked ? 0.35 : 1,
                        pointerEvents: isBlocked ? 'none' : 'auto',
                        // Optional: styling the scrollbar nicely if needed, but default is fine
                        background: 'transparent'
                    }}
                >
                    {trigger.contentImage ? (
                        <img src={trigger.contentImage} alt="Contenido scroll" style={{ width: '100%', height: 'auto', display: 'block' }} draggable={false} />
                    ) : (
                        !trigger.hidden && (
                            <div style={{ padding: 10, textAlign: 'center', color: colors.label, fontSize: 11, background: 'rgba(10,13,18,0.8)', minHeight: '100%' }}>
                                [Área de Scroll sin imagen]
                            </div>
                        )
                    )}
                </div>
            )
        }

        return null
    })
}

export default function PreviewMode({ nodes, edges, onExit }) {
    const startNode = nodes.find(n => n.data?.isStartNode === true)
        || nodes.find(n => !edges.some(e => e.target === n.id))
        || nodes[0]
    const [currentNodeId, setCurrentNodeId] = useState(startNode?.id)
    // Parallel model: Set of completed trigger IDs (any order)
    const [completedTriggers, setCompletedTriggers] = useState(new Set())
    const [inputValues, setInputValues] = useState({}) // keyed by trigger.id
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [transitioning, setTransitioning] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const containerRef = useRef(null)
    const imgWrapperRef = useRef(null)
    const inputRefs = useRef({})

    const currentNode = nodes.find(n => n.id === currentNodeId)

    // Compute linear node order following edges
    const nodeOrder = (() => {
        const order = []
        const initialNode = nodes.find(n => n.data?.isStartNode === true)
            || nodes.find(n => !edges.some(e => e.target === n.id))
            || nodes[0]
        let cursor = initialNode?.id
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

    // Called after each trigger completes — check if ALL are done, OR if this specific trigger has a branch
    const onTriggerComplete = useCallback((triggerId, allTriggers) => {
        setCompletedTriggers(prev => {
            const next = new Set(prev)
            next.add(triggerId)

            // Check for explicit navigation branching
            const completedTrigger = allTriggers.find(t => t.id === triggerId)
            if (completedTrigger && completedTrigger.navigateTarget) {
                // Ignore allDone check, branch immediately after a short delay
                setTimeout(() => navigate(completedTrigger.navigateTarget), 350)
                return next // the HUD will stick slightly then switch
            }

            // Normal progression: Check if every trigger in this node is now done
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

    // Global keydown listener for keypress triggers
    useEffect(() => {
        if (!currentNode || transitioning) return

        const handleGlobalKeyDown = (e) => {
            const currentTriggers = normalizeTriggers(currentNode.data)

            currentTriggers.forEach(t => {
                if (t.type !== 'keypress') return
                if (completedTriggers.has(t.id)) return // already done

                const isBlocked = t.dependsOn && !completedTriggers.has(t.dependsOn)
                if (isBlocked) return

                const expectedKey = t.keyCode || ''
                // Match key (e.g. "Enter" === "Enter", or "a" === "a", ignoring case for letters if wanted)
                const pressedKey = e.key === ' ' ? 'Space' : e.key

                if (pressedKey.toLowerCase() === expectedKey.toLowerCase()) {
                    // Prevent default if it's a structural key to avoid page jumping
                    if (['Space', 'Enter', 'ArrowUp', 'ArrowDown'].includes(pressedKey)) {
                        e.preventDefault()
                    }
                    onTriggerComplete(t.id, currentTriggers)
                }
            })
        }

        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [currentNode, completedTriggers, transitioning, onTriggerComplete])

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

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.warn(`Error al intentar pantalla completa: ${err.message}`)
            })
        } else {
            document.exitFullscreen()
        }
    }

    return (
        <div ref={containerRef} style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(10,13,18,0.97)',
            display: 'flex', flexDirection: 'column',
        }}>
            <DraggableHUD>
                {/* ── Top bar ── */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-brand)' }}>
                                Preview
                            </span>
                            <span style={{ color: 'var(--color-border)', fontSize: 10 }}>·</span>
                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {data.label || 'Sin nombre'}
                            </span>
                        </div>
                        {/* Screen step pills */}
                        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                            {nodeOrder.map((id, i) => (
                                <div key={id} style={{
                                    height: 3, borderRadius: 99,
                                    width: id === currentNodeId ? 14 : 4,
                                    background: i <= stepIndex ? 'var(--color-brand)' : 'var(--color-border)',
                                    transition: 'width 250ms ease-out, background 250ms ease-out',
                                }} />
                            ))}
                            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>
                                {stepIndex + 1}/{totalSteps}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            onClick={toggleFullscreen}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 26, height: 26, borderRadius: 6,
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--color-text-secondary)',
                                cursor: 'pointer', transition: 'all 150ms'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                                e.currentTarget.style.color = 'var(--color-text-primary)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                e.currentTarget.style.color = 'var(--color-text-secondary)'
                            }}
                            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                        >
                            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                        </button>
                        <button
                            onClick={onExit}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '4px 8px', borderRadius: 6,
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--color-text-secondary)', fontSize: 11, cursor: 'pointer',
                                transition: 'all 150ms'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                                e.currentTarget.style.color = 'var(--color-text-primary)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = 'var(--color-text-secondary)'
                            }}
                        >
                            <X size={12} /> Salir
                        </button>
                    </div>
                </div>

                {/* ── Trigger progress dots (when > 1 trigger) ── */}
                {triggers.length > 1 && (
                    <div style={{
                        display: 'flex', gap: 4, marginTop: 12, alignItems: 'center', flexWrap: 'wrap',
                        opacity: transitioning ? 0 : 1, transition: 'opacity 280ms ease-out',
                        paddingTop: 10, borderTop: '1px solid var(--color-border-subtle)'
                    }}>
                        {triggers.map((t) => {
                            const done = completedTriggers.has(t.id)
                            const colors = TRIGGER_COLORS[t.type] || TRIGGER_COLORS.click
                            return (
                                <div key={t.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '2px 7px', borderRadius: 20,
                                    border: `1px solid ${done ? 'rgba(46,165,103,0.35)' : colors.border}`,
                                    background: done ? 'rgba(46,165,103,0.08)' : colors.bg,
                                    transition: 'all 250ms ease-out',
                                }}>
                                    <span style={{ fontSize: 8, fontWeight: 700, color: done ? '#5ac98a' : colors.label }}>
                                        {done ? '✓' : '○'}
                                    </span>
                                    <span style={{ fontSize: 8, fontWeight: done ? 600 : 400, letterSpacing: '0.06em', textTransform: 'uppercase', color: done ? '#5ac98a' : colors.label }}>
                                        {t.type}
                                    </span>
                                </div>
                            )
                        })}
                        {/* Pending count */}
                        {completedTriggers.size < triggers.length && (
                            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', marginLeft: 2 }}>
                                {triggers.length - completedTriggers.size} res.
                            </span>
                        )}
                    </div>
                )}

                {/* ── Feedback ── */}
                {error && (
                    <div style={{
                        marginTop: 10, display: 'flex', alignItems: 'center', gap: 7,
                        padding: '6px 12px', borderRadius: 6,
                        border: '1px solid rgba(192,64,64,0.3)', background: 'rgba(192,64,64,0.1)',
                        fontSize: 11, color: '#d97979',
                    }}>
                        <AlertCircle size={12} />
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        marginTop: 10, display: 'flex', alignItems: 'center', gap: 7,
                        padding: '6px 14px', borderRadius: 6,
                        border: '1px solid rgba(46,165,103,0.3)', background: 'rgba(46,165,103,0.1)',
                        fontSize: 11, color: '#5ac98a',
                    }}>
                        <CheckCircle size={12} />
                        ¡Completado!
                    </div>
                )}
            </DraggableHUD>

            {/* ── Main image container ── */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: -1,
                display: 'flex', flexDirection: 'column', // align to top for scrolling
                backgroundColor: '#0a0d12',
                overflowY: 'auto', // enable scrolling
                overflowX: 'hidden',
                transition: 'opacity 280ms ease-out, transform 280ms ease-out, filter 280ms ease-out',
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? 'scale(0.98)' : 'scale(1)',
                filter: transitioning ? 'blur(3px)' : 'blur(0)',
            }}>
                {data.image ? (
                    <div ref={imgWrapperRef} style={{ position: 'relative', width: '100%', minHeight: '100dvh', margin: '0 auto' }}>
                        {data.mediaType === 'video' ? (
                            <video
                                src={Array.isArray(data.image) ? data.image[0] : data.image}
                                autoPlay
                                playsInline
                                onEnded={() => {
                                    const nextId = getNextNodeId()
                                    if (nextId) navigate(nextId)
                                    else setSuccess(true)
                                }}
                                style={{
                                    width: '100vw', height: '100dvh', display: 'block',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <div style={{ position: 'relative', width: '100%', maxWidth: '100%', margin: '0 auto' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    {(Array.isArray(data.image) ? data.image : [data.image]).map((src, idx) => (
                                        <img key={idx} src={src} alt={`screen-${idx}`} draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                    ))}
                                </div>
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                    {renderTriggerOverlays(triggers, completedTriggers, handleClickTrigger, handleInputSubmit, handleInputChange, inputValues, setInputValues, inputRefs)}
                                </div>
                            </div>
                        )}
                        {data.mediaType === 'video' && renderTriggerOverlays(triggers, completedTriggers, handleClickTrigger, handleInputSubmit, handleInputChange, inputValues, setInputValues, inputRefs)}
                    </div>
                ) : (
                    <div ref={imgWrapperRef} style={{ position: 'relative', width: '100vw', height: '100dvh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 14, color: 'var(--color-text-muted)', pointerEvents: 'none' }}>Sin imagen en este nodo</span>
                        {renderTriggerOverlays(triggers, completedTriggers, handleClickTrigger, handleInputSubmit, handleInputChange, inputValues, setInputValues, inputRefs)}
                    </div>
                )}
            </div>
        </div>
    )
}
