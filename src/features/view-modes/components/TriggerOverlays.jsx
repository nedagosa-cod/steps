import React from 'react'
import { ChevronDown } from 'lucide-react'
import { TRIGGER_COLORS } from '../../../shared/utils/triggers'

export function TriggerOverlays({ triggers, completedTriggers, handlers, state, refs }) {
    const { handleClickTrigger, handleInputSubmit, handleInputChange, setInputValues, setError } = handlers
    const { inputValues } = state
    const { inputRefs } = refs

    return triggers.map((trigger) => {
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
                    id={`trigger-${trigger.id}`}
                    onClick={() => { if (isClick && !isDone && !isBlocked) handleClickTrigger(trigger, triggers) }}
                    onDoubleClick={() => { if (isDbl && !isDone && !isBlocked) handleClickTrigger(trigger, triggers) }}
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
                    id={`trigger-${trigger.id}`}
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
                                if (!isBlocked && !isDone) handleInputChange(trigger, val, triggers)
                            }}
                            onKeyDown={e => { if (e.key === 'Enter' && !isBlocked && !isDone) handleInputSubmit(trigger, triggers) }}
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
                    id={`trigger-${trigger.id}`}
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
                                    if (!trigger.validationValue || val === trigger.validationValue) {
                                        handleClickTrigger(trigger, triggers)
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
                                colorScheme: 'dark'
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
                    id={`trigger-${trigger.id}`}
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
                                        handleClickTrigger(trigger, triggers)
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
                    id={`trigger-${trigger.id}`}
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
                                        handleClickTrigger(trigger, triggers)
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
                    id={`trigger-${trigger.id}`}
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
                        pointerEvents: 'none',
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
                    id={`trigger-${trigger.id}`}
                    style={{
                        position: 'absolute',
                        left: `${hs.x}%`, top: `${hs.y}%`,
                        width: `${hs.w}%`, height: `${hs.h}%`,
                        border: trigger.hidden ? 'none' : `1px dashed ${colors.border}`,
                        overflowY: 'auto', overflowX: 'hidden',
                        display: 'block',
                        opacity: isBlocked ? 0.35 : 1,
                        pointerEvents: isBlocked ? 'none' : 'auto',
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
                    id={`trigger-${trigger.id}`}
                    onClick={() => {
                        if (isDone || isBlocked) return
                        setInputValues(prev => ({ ...prev, [`_radioGroup_${groupName}`]: trigger.id }))
                        if (trigger.isCorrectOption) {
                            handleClickTrigger(trigger, triggers)
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
                    id={`trigger-${trigger.id}`}
                    onClick={() => {
                        if (isDone || isBlocked) return
                        const newChecked = !isChecked
                        setInputValues(prev => ({ ...prev, [`_checkbox_${trigger.id}`]: newChecked }))
                        if (newChecked && trigger.isCorrectOption) {
                            handleClickTrigger(trigger, triggers)
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
