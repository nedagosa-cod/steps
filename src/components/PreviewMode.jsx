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

        if (trigger.type === 'input_date') {
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
                            type="date"
                            value={inputValues[trigger.id] || ''}
                            onChange={e => {
                                const val = e.target.value
                                setInputValues(prev => ({ ...prev, [trigger.id]: val }))
                                if (!isBlocked && !isDone) {
                                    // Comprobar validacion de fecha
                                    if (!trigger.validationValue || val === trigger.validationValue) {
                                        handleClickTrigger(trigger)
                                    } else if (trigger.validationValue && val !== trigger.validationValue) {
                                        setError('Fecha incorrecta. Inténtalo de nuevo.')
                                    }
                                }
                            }}
                            disabled={isBlocked}
                            style={{
                                width: '100%', height: '100%',
                                background: trigger.hidden ? 'transparent' : (isDone ? 'rgba(46,165,103,0.15)' : 'rgba(10,13,18,0.75)'),
                                border: 'none', outline: 'none',
                                color: trigger.hidden ? 'var(--color-text-primary)' : (isDone ? '#5ac98a' : '#e2eaf4'),
                                fontSize: trigger.fontSize ? `${trigger.fontSize}px` : 'clamp(11px, 1.3vw, 16px)',
                                padding: '0 6px',
                                fontFamily: 'inherit',
                                colorScheme: 'dark' // Helps display native calendar icon nicely in dark mode
                            }}
                        />
                        {isDone && !trigger.hidden && (
                            <div style={{
                                position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)',
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

        if (trigger.type === 'radio') {
            const groupName = trigger.radioGroup || trigger.id
            const isSelectedInGroup = inputValues[`_radioGroup_${groupName}`] === trigger.id
            return (
                <div
                    key={trigger.id}
                    onClick={() => {
                        if (isDone || isBlocked) return
                        setInputValues(prev => ({ ...prev, [`_radioGroup_${groupName}`]: trigger.id }))
                        if (trigger.isCorrectOption) {
                            handleClickTrigger(trigger)
                        }
                    }}
                    style={{
                        position: 'absolute',
                        left: `${hs.x}%`, top: `${hs.y}%`,
                        width: `${hs.w}%`, height: `${hs.h}%`,
                        borderRadius: 4,
                        border: trigger.hidden ? 'none' : (isDone
                            ? '1.5px solid rgba(46,165,103,0.6)'
                            : `1.5px solid ${colors.borderActive}`),
                        display: 'flex', alignItems: 'center',
                        gap: 6, padding: '0 8px',
                        background: trigger.hidden ? 'transparent' : (isDone ? 'rgba(46,165,103,0.12)' : 'rgba(10,13,18,0.75)'),
                        transition: 'all 200ms ease-out',
                        cursor: isDone ? 'default' : 'pointer',
                        opacity: isBlocked ? 0.35 : 1,
                        pointerEvents: isBlocked ? 'none' : 'auto',
                    }}
                >
                    <span style={{
                        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isSelectedInGroup ? (isDone ? '#5ac98a' : colors.label) : 'rgba(255,255,255,0.3)'}`,
                        background: isSelectedInGroup ? (isDone ? '#5ac98a' : colors.label) : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 150ms',
                    }}>
                        {isSelectedInGroup && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                    </span>
                    <span style={{
                        fontSize: trigger.fontSize ? `${trigger.fontSize}px` : 'clamp(10px, 1.2vw, 14px)',
                        color: trigger.hidden ? 'var(--color-text-primary)' : (isDone ? '#5ac98a' : '#e2eaf4'),
                    }}>
                        {trigger.radioLabel || 'Opción'}
                    </span>
                </div>
            )
        }

        if (trigger.type === 'checkbox') {
            const isChecked = !!inputValues[`_checkbox_${trigger.id}`]
            return (
                <div
                    key={trigger.id}
                    onClick={() => {
                        if (isDone || isBlocked) return
                        const newChecked = !isChecked
                        setInputValues(prev => ({ ...prev, [`_checkbox_${trigger.id}`]: newChecked }))
                        if (newChecked && trigger.isCorrectOption) {
                            handleClickTrigger(trigger)
                        } else if (!newChecked && isDone) {
                            // unchecking: can't undo a completed trigger in this model
                        }
                    }}
                    style={{
                        position: 'absolute',
                        left: `${hs.x}%`, top: `${hs.y}%`,
                        width: `${hs.w}%`, height: `${hs.h}%`,
                        borderRadius: 4,
                        border: trigger.hidden ? 'none' : (isDone
                            ? '1.5px solid rgba(46,165,103,0.6)'
                            : `1.5px solid ${colors.borderActive}`),
                        display: 'flex', alignItems: 'center',
                        gap: 6, padding: '0 8px',
                        background: trigger.hidden ? 'transparent' : (isDone ? 'rgba(46,165,103,0.12)' : 'rgba(10,13,18,0.75)'),
                        transition: 'all 200ms ease-out',
                        cursor: isDone ? 'default' : 'pointer',
                        opacity: isBlocked ? 0.35 : 1,
                        pointerEvents: isBlocked ? 'none' : 'auto',
                    }}
                >
                    {/* Checkbox square */}
                    <span style={{
                        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                        border: `2px solid ${(isChecked || isDone) ? (isDone ? '#5ac98a' : colors.label) : 'rgba(255,255,255,0.3)'}`,
                        background: (isChecked || isDone) ? (isDone ? '#5ac98a' : colors.label) : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 150ms',
                        fontSize: 10, color: '#fff', fontWeight: 700,
                    }}>
                        {(isChecked || isDone) && '✓'}
                    </span>
                    <span style={{
                        fontSize: trigger.fontSize ? `${trigger.fontSize}px` : 'clamp(10px, 1.2vw, 14px)',
                        color: trigger.hidden ? 'var(--color-text-primary)' : (isDone ? '#5ac98a' : '#e2eaf4'),
                    }}>
                        {trigger.checkboxLabel || 'Opción'}
                    </span>
                </div>
            )
        }

        return null
    })
}

export default function PreviewMode({ nodes, edges, globalConfig = {}, onExit }) {
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
    const [timeRemaining, setTimeRemaining] = useState(null)
    const timerRef = useRef(null)
    const hasTimerStarted = useRef(false)

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
        setInputValues(prev => ({ auth_name: prev['auth_name'] || '' }))
        setCompletedTriggers(new Set())
        setTimeout(() => {
            setCurrentNodeId(targetId)
            setTransitioning(false)
        }, 280)
    }, [])

    // Called after each trigger completes — check if ALL are done, OR if this specific trigger has a branch
    const onTriggerComplete = useCallback((triggerId, allTriggers, silent = false) => {
        setCompletedTriggers(prev => {
            const next = new Set(prev)
            next.add(triggerId)

            // Silent mode: just mark as done, no navigation (used for radio group siblings)
            if (silent) return next

            // Check for explicit navigation branching
            const completedTrigger = allTriggers.find(t => t.id === triggerId)
            if (completedTrigger && completedTrigger.navigateTarget) {
                // Ignore allDone check, branch immediately after a short delay
                setTimeout(() => navigate(completedTrigger.navigateTarget), 350)
                return next // the HUD will stick slightly then switch
            }

            // Normal progression: Check if every required trigger in this node is now done
            const allDone = allTriggers.every(t => t.isOptional || next.has(t.id))
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

    // Lógica del Temporizador Global persistente (controlado por nodos)
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    useEffect(() => {
        if (!currentNode) return

        const { timerMin, timerMax } = globalConfig
        if ((!timerMin || timerMin <= 0) && (!timerMax || timerMax <= 0)) {
            if (timerRef.current) clearInterval(timerRef.current)
            timerRef.current = null
            setTimeRemaining(null)
            hasTimerStarted.current = false
            return
        }

        if (currentNode.data?.timerEnd) {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        } else if (currentNode.data?.timerStart && !hasTimerStarted.current) {
            hasTimerStarted.current = true
            let timeToSet = 0
            if (timerMin > 0 && timerMax > 0 && timerMax >= timerMin) {
                timeToSet = Math.floor(Math.random() * (timerMax - timerMin + 1)) + timerMin
            } else if (timerMax > 0) {
                timeToSet = timerMax
            } else if (timerMin > 0) {
                timeToSet = timerMin
            }

            setTimeRemaining(timeToSet)

            if (timeToSet > 0) {
                if (timerRef.current) clearInterval(timerRef.current)
                timerRef.current = setInterval(() => {
                    setTimeRemaining((prev) => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current)
                            timerRef.current = null
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
            }
        }
    }, [currentNodeId, currentNode, globalConfig])

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
        // If this is a correct radio, also complete all siblings in the same group
        if (trigger.type === 'radio' && trigger.radioGroup) {
            triggers.forEach(t => {
                if (t.type === 'radio' && t.radioGroup === trigger.radioGroup && t.id !== trigger.id) {
                    onTriggerComplete(t.id, triggers, true) // silent complete
                }
            })
        }
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

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {timeRemaining !== null && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '4px 10px', borderRadius: 12,
                                background: timeRemaining <= 5 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                                border: timeRemaining <= 5 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                                color: timeRemaining <= 5 ? '#ef4444' : 'var(--color-text-primary)',
                                fontWeight: timeRemaining <= 5 ? 700 : 500,
                                fontSize: 13, transition: 'all 200ms ease-out',
                                fontVariantNumeric: 'tabular-nums', marginRight: 8
                            }}>
                                <span style={{ fontSize: 11, color: timeRemaining <= 5 ? '#ef4444' : 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Tiempo:
                                </span>
                                {timeRemaining}s
                            </div>
                        )}
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
                        {(() => {
                            const reqTriggers = triggers.filter(t => !t.isOptional);
                            const reqCompleted = reqTriggers.filter(t => completedTriggers.has(t.id)).length;
                            if (reqCompleted < reqTriggers.length) {
                                return (
                                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)', marginLeft: 2 }}>
                                        {reqTriggers.length - reqCompleted} res.
                                    </span>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}

                {/* ── Practice Mode Guide ── */}
                {sessionStorage.getItem('isPracticeMode') === 'true' && currentNode.type !== 'authNode' && (
                    <div style={{
                        marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8,
                        paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-brand)', textTransform: 'uppercase' }}>
                            Guía de Práctica
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(() => {
                                const guideTriggers = triggers.filter(t => !t.isOptional);
                                if (guideTriggers.length === 0) {
                                    return <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No hay acciones obligatorias en esta pantalla.</div>;
                                }
                                return guideTriggers.map((t, index) => {
                                    const done = completedTriggers.has(t.id);

                                    // Fallback hints if empty
                                    let autoHint = t.hint;
                                    if (!autoHint) {
                                        switch (t.type) {
                                            case 'click': autoHint = "Haz clic en la zona indicada."; break;
                                            case 'double_click': autoHint = "Haz doble clic en la zona indicada."; break;
                                            case 'input': autoHint = "Completa el campo de texto."; break;
                                            case 'dropdown': autoHint = "Selecciona la opción correcta en la lista."; break;
                                            case 'dependent_dropdown': autoHint = "Selecciona la subcategoría correcta."; break;
                                            case 'keypress': autoHint = `Presiona la tecla ${t.keyCode}.`; break;
                                            case 'scroll_area': autoHint = "Desplaza el contenido hacia abajo."; break;
                                            default: autoHint = "Realiza la acción requerida.";
                                        }
                                    }

                                    return (
                                        <div key={t.id} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 8,
                                            opacity: done ? 0.4 : 1,
                                            transition: 'all 300ms ease',
                                        }}>
                                            <div style={{
                                                marginTop: 2, width: 14, height: 14, borderRadius: '50%',
                                                border: `1px solid ${done ? '#5ac98a' : 'var(--color-border-strong)'}`,
                                                background: done ? 'rgba(90, 201, 138, 0.2)' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                {done && <span style={{ color: '#5ac98a', fontSize: 10 }}>✓</span>}
                                            </div>
                                            <div style={{
                                                fontSize: 12, color: done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                                                textDecoration: done ? 'line-through' : 'none', lineHeight: 1.4
                                            }}>
                                                <span style={{ fontWeight: 600, marginRight: 4 }}>Paso {index + 1}:</span>
                                                {autoHint}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )
                }

                {/* ── Feedback ── */}
                {
                    error && (
                        <div style={{
                            marginTop: 10, display: 'flex', alignItems: 'center', gap: 7,
                            padding: '6px 12px', borderRadius: 6,
                            border: '1px solid rgba(192,64,64,0.3)', background: 'rgba(192,64,64,0.1)',
                            fontSize: 11, color: '#d97979',
                        }}>
                            <AlertCircle size={12} />
                            {error}
                        </div>
                    )
                }

                {
                    success && (
                        <div style={{
                            marginTop: 10, display: 'flex', alignItems: 'center', gap: 7,
                            padding: '6px 14px', borderRadius: 6,
                            border: '1px solid rgba(46,165,103,0.3)', background: 'rgba(46,165,103,0.1)',
                            fontSize: 11, color: '#5ac98a',
                        }}>
                            <CheckCircle size={12} />
                            ¡Completado!
                        </div>
                    )
                }
            </DraggableHUD>

            {/* ── Visual Result Node (Certificado) ── */}
            {currentNode.type === 'resultNode' && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,13,18,0.85)', backdropFilter: 'blur(12px)',
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    {sessionStorage.getItem('isPracticeMode') === 'true' ? (
                        <div style={{
                            background: '#ffffff', borderRadius: 12, padding: '40px 60px',
                            maxWidth: 500, width: '90%', textAlign: 'center',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                        }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(46,165,103,0.1)', color: '#2ea567', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                <CheckCircle size={32} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111' }}>Práctica Completada</h2>
                            <p style={{ margin: 0, fontSize: 15, color: '#555', lineHeight: 1.5 }}>
                                Has finalizado este escenario en Modo Práctica. Esta sesión es formativa y no genera evaluación ni certificado.
                            </p>
                            <button
                                onClick={onExit}
                                style={{
                                    marginTop: 20, padding: '10px 24px', borderRadius: 8, background: '#111',
                                    color: 'white', fontWeight: 600, fontSize: 14, border: 'none',
                                    cursor: 'pointer', transition: 'transform 150ms'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Finalizar y Volver
                            </button>
                        </div>
                    ) : (
                        /* Certificate Card */
                        <div style={{
                            background: '#ffffff',
                            borderRadius: 12, padding: '30px 60px', /* Reduced padding top/bottom */
                            width: '94%', maxWidth: 900,
                            minHeight: 'min(90vh, 600px)', /* Force landscape aspect ratio when possible */
                            textAlign: 'center', margin: 'auto',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, /* Reduced gap */
                            position: 'relative', overflow: 'hidden',
                            color: '#1a1a1a'
                        }}>
                            {/* Decorative corners (SVG) */}
                            <svg style={{ position: 'absolute', top: 0, left: 0, width: 250, height: 250, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 0 L100 0 C50 20 20 50 0 100 Z" fill="#EAB308" opacity="0.9" />
                                <path d="M0 0 L80 0 C40 15 15 40 0 80 Z" fill="#1E3A8A" />
                            </svg>
                            <svg style={{ position: 'absolute', bottom: 0, right: 0, width: 250, height: 250, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M100 100 L0 100 C50 80 80 50 100 0 Z" fill="#EAB308" opacity="0.9" />
                                <path d="M100 100 L20 100 C60 85 85 60 100 20 Z" fill="#1E3A8A" />
                            </svg>
                            {/* Ribbon top right */}
                            <svg style={{ position: 'absolute', top: 0, right: 40, width: 50, height: 80, pointerEvents: 'none' }} viewBox="0 0 50 80" preserveAspectRatio="none">
                                <path d="M0 0 L50 0 L50 80 L25 60 L0 80 Z" fill="#EAB308" />
                            </svg>

                            {/* Seal / Badge */}
                            <div style={{
                                position: 'absolute', right: 60, top: '45%', transform: 'translateY(-50%)',
                                width: 110, height: 110, borderRadius: '50%', background: '#1E3A8A',
                                display: 'none', /* Hidden on mobile by default, shown via media query if needed or just kept flex */
                                border: '3px solid #EAB308', color: '#EAB308',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }} className="cert-seal">
                                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', padding: 12 }}>
                                    <path id="curve" d="M 20 50 A 30 30 0 1 1 80 50 A 30 30 0 1 1 20 50" fill="transparent" />
                                    <text fontSize="10" fontWeight="bold" fill="#EAB308" letterSpacing="2">
                                        <textPath href="#curve" startOffset="50%" textAnchor="middle">
                                            SELLO DE EXCELENCIA
                                        </textPath>
                                    </text>
                                    {/* Inner star/logo */}
                                    <polygon points="50,30 55,40 65,42 58,50 60,60 50,55 40,60 42,50 35,42 45,40" fill="#EAB308" />
                                </svg>
                            </div>

                            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                                <h1 style={{
                                    margin: 0, fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 900,
                                    color: '#000000', letterSpacing: '0.05em', textTransform: 'uppercase'
                                }}>
                                    {data.certTitle ?? 'CERTIFICADO'}
                                </h1>
                                <h2 style={{
                                    margin: 0, fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 700,
                                    color: '#1E3A8A', letterSpacing: '0.1em', textTransform: 'uppercase'
                                }}>
                                    {data.certSubtitle ?? 'DE RECONOCIMIENTO'}
                                </h2>
                            </div>

                            <div style={{ zIndex: 1, marginTop: 20 }}>
                                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {data.certPreName ?? 'OTORGADO A:'}
                                </p>
                            </div>

                            {/* Participant Name */}
                            <div style={{ zIndex: 1, width: '85%', padding: '5px 0', borderBottom: '2px solid #1a1a1a', margin: '0 0 10px 0' }}>
                                <h3 style={{
                                    margin: 0, fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 400,
                                    color: '#000000', fontFamily: '"Great Vibes", "Brush Script MT", "Alex Brush", cursive',
                                    lineHeight: 1.2
                                }}>
                                    {inputValues['auth_name'] ? inputValues['auth_name'].trim() : 'Nombre del Participante'}
                                </h3>
                            </div>

                            <div style={{ zIndex: 1, maxWidth: 700 }}>
                                <p style={{
                                    margin: 0, fontSize: 'clamp(15px, 2vw, 18px)', color: '#374151',
                                    lineHeight: 1.6, fontWeight: 500
                                }}>
                                    {data.certDescription ?? 'Por haber completado satisfactoriamente 120 horas del Diplomado...'}
                                </p>
                            </div>

                            {/* Signatures */}
                            <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 20, gap: 20, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: '70%', height: 1, background: '#1a1a1a' }} />
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#000', textTransform: 'uppercase' }}>{data.signature1Name ?? 'LIC. HORACIO OLIVO'}</p>
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#4b5563', fontStyle: 'italic' }}>{data.signature1Title ?? 'Director de Administración'}</p>
                                </div>
                                <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: '70%', height: 1, background: '#1a1a1a' }} />
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#000', textTransform: 'uppercase' }}>{data.signature2Name ?? 'LIC. CARLA RODRÍGUEZ'}</p>
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#4b5563', fontStyle: 'italic' }}>{data.signature2Title ?? 'Directora de Negocios'}</p>
                                </div>
                            </div>

                            <button
                                onClick={onExit}
                                style={{
                                    marginTop: 30, padding: '12px 32px', borderRadius: 8, background: '#1E3A8A',
                                    color: 'white', fontWeight: 600, fontSize: 15, border: 'none',
                                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(30, 58, 138, 0.4)',
                                    transition: 'transform 150ms, box-shadow 150ms', zIndex: 1
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 58, 138, 0.6)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(30, 58, 138, 0.4)' }}
                            >
                                Finalizar y Volver
                            </button>

                            <style>{`
                                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                                @media (min-width: 768px) {
                                    .cert-seal { display: flex !important; }
                                }
                            `}</style>
                        </div>
                    )}
                </div>
            )}

            {
                currentNode.type === 'authNode' ? (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: -1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#0a0d12',
                        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(124, 92, 252, 0.15) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(46, 165, 103, 0.1) 0%, transparent 50%)',
                        transition: 'opacity 280ms ease-out, transform 280ms ease-out, filter 280ms ease-out',
                        opacity: transitioning ? 0 : 1,
                        transform: transitioning ? 'scale(0.98)' : 'scale(1)',
                        filter: transitioning ? 'blur(3px)' : 'blur(0)',
                    }}>
                        <div style={{
                            width: 420, maxWidth: '90%', padding: 40,
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 24,
                            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
                            display: 'flex', flexDirection: 'column', gap: 24,
                            textAlign: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                                    {data.title || 'Control de Accesos'}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    {data.objective || 'Bienvenido al simulador. Ingresa tus datos para continuar.'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Tu Nombre..."
                                        value={inputValues['auth_name'] || ''}
                                        onChange={e => {
                                            setInputValues(prev => ({ ...prev, auth_name: e.target.value }))
                                            setError('')
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                const name = (inputValues['auth_name'] || '').trim()
                                                if (!name) setError('Por favor, ingresa tu nombre para continuar.')
                                                else {
                                                    const nextId = getNextNodeId()
                                                    if (nextId) navigate(nextId)
                                                }
                                            }
                                        }}
                                        style={{
                                            width: '100%', padding: '14px 16px',
                                            background: 'rgba(0,0,0,0.4)',
                                            border: error ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: 12, color: 'white', fontSize: 14,
                                            outline: 'none', transition: 'border-color 200ms',
                                            textAlign: 'center'
                                        }}
                                    />
                                    {error && <div style={{ position: 'absolute', top: -24, left: 0, right: 0, color: '#ef4444', fontSize: 11, fontWeight: 500 }}>{error}</div>}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {data.showPractice !== false && (
                                        <button
                                            onClick={() => {
                                                const name = (inputValues['auth_name'] || '').trim()
                                                if (!name) {
                                                    setError('Por favor, ingresa tu nombre para continuar.')
                                                    return
                                                }
                                                sessionStorage.setItem('isPracticeMode', 'true')
                                                const nextId = getNextNodeId()
                                                if (nextId) navigate(nextId)
                                            }}
                                            style={{
                                                padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.15)', color: 'white',
                                                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        >
                                            MODO PRÁCTICA
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            const name = (inputValues['auth_name'] || '').trim()
                                            if (!name) {
                                                setError('Por favor, ingresa tu nombre para continuar.')
                                                return
                                            }
                                            sessionStorage.setItem('isPracticeMode', 'false')
                                            const nextId = getNextNodeId()
                                            if (nextId) navigate(nextId)
                                        }}
                                        style={{
                                            padding: '14px', borderRadius: 12, background: 'var(--color-brand)',
                                            border: 'none', color: 'white', fontSize: 13, fontWeight: 700,
                                            cursor: 'pointer', transition: 'transform 100ms, filter 150ms, box-shadow 150ms',
                                            boxShadow: '0 4px 14px rgba(124, 92, 252, 0.4)'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 92, 252, 0.6)' }}
                                        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124, 92, 252, 0.4)' }}
                                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        EVALUACIÓN
                                    </button>

                                    {data.showScores !== false && (
                                        <button disabled style={{
                                            padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)',
                                            fontSize: 13, fontWeight: 600, cursor: 'not-allowed'
                                        }}>
                                            PUNTAJES
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── Main image container ── */
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: -1,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: (globalConfig.bgType === 'color' && globalConfig.bgValue) ? globalConfig.bgValue : (globalConfig.bgType === 'transparent' ? 'transparent' : '#0a0d12'),
                        backgroundImage: (globalConfig.bgType === 'image' && globalConfig.bgValue) ? `url(${globalConfig.bgValue})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        transition: 'opacity 280ms ease-out, transform 280ms ease-out, filter 280ms ease-out',
                        opacity: transitioning ? 0 : 1,
                        transform: transitioning ? 'scale(0.98)' : 'scale(1)',
                        filter: transitioning ? 'blur(3px)' : 'blur(0)',
                    }}>
                        {data.image ? (
                            <div ref={imgWrapperRef} style={{ position: 'relative', width: '100%', margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                )}
        </div>
    )
}
