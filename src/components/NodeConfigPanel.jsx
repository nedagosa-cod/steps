import React, { useRef, useState } from 'react'
import { Upload, MousePointer, Keyboard, Info, Image, Trash2, GripVertical, ChevronDown, ChevronUp, TextCursorInput, List, ListTree } from 'lucide-react'
import { normalizeTriggers, makeDefaultTrigger, TRIGGER_COLORS, TRIGGER_LABELS } from '../utils/triggers'

/* ── Atoms ── */
const FieldLabel = ({ children }) => (
    <label style={{
        display: 'block', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        color: 'var(--color-text-tertiary)', marginBottom: 5,
    }}>
        {children}
    </label>
)

const Divider = ({ label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
        {label && (
            <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--color-text-muted)', flexShrink: 0,
            }}>
                {label}
            </span>
        )}
        <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
    </div>
)

const TextInput = ({ value, onChange, placeholder, mono }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
            width: '100%',
            background: 'var(--color-control)',
            border: '1px solid var(--color-border)',
            borderRadius: 6, padding: '6px 10px',
            fontSize: mono ? 11 : 12,
            fontFamily: mono ? 'ui-monospace, monospace' : 'inherit',
            color: 'var(--color-text-primary)', outline: 'none',
            transition: 'border-color 150ms ease-out',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--color-border-strong)'}
        onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
    />
)

const NumericInput = ({ value, onChange, label, accentColor, min = 0, max = 100, step = "0.01", suffix = "%" }) => (
    <div>
        <FieldLabel>{label}</FieldLabel>
        <div style={{ position: 'relative' }}>
            <input
                type="number" min={min} max={max} step={step}
                value={value}
                onChange={onChange}
                style={{
                    width: '100%',
                    background: 'var(--color-control)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6, padding: '5px 25px 5px 8px',
                    fontSize: 12, fontVariantNumeric: 'tabular-nums',
                    color: 'var(--color-text-primary)', outline: 'none',
                    transition: 'border-color 150ms ease-out',
                }}
                onFocus={e => e.target.style.borderColor = accentColor || 'var(--color-border-strong)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
            {suffix && (
                <span style={{
                    position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 9, color: 'var(--color-text-muted)', pointerEvents: 'none',
                }}>{suffix}</span>
            )}
        </div>
    </div>
)

/* ── TriggerCard ── */
function TriggerCard({
    trigger, index, allTriggers, nodes,
    onUpdate, onDelete,
    isExpanded, onToggleExpand,
    draggableProps
}) {
    const [showAdvanced, setShowAdvanced] = useState(false)
    const hs = trigger.hotspot || { x: 30, y: 40, w: 20, h: 10 }
    const colors = TRIGGER_COLORS[trigger.type] || TRIGGER_COLORS.click
    const setHotspot = (key, val) =>
        onUpdate({ hotspot: { ...hs, [key]: parseFloat(val) || 0 } })

    return (
        <div
            {...draggableProps}
            style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 8, overflow: 'hidden',
                background: 'var(--color-control)',
                ...draggableProps?.style
            }}
        >
            {/* Card header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 8px',
                background: colors.bg,
                borderBottom: isExpanded ? `1px solid ${colors.border}` : 'none',
            }}>
                {/* Drag Handle */}
                <div
                    title="Arrastrar para reordenar"
                    style={{
                        cursor: 'grab', color: 'var(--color-text-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 2, marginRight: -2
                    }}
                >
                    <GripVertical size={13} />
                </div>

                {/* Step number */}
                <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(10,13,18,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: colors.label, flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                }}>
                    {index + 1}
                </span>

                {/* Type toggle */}
                <div style={{ display: 'flex', gap: 3, flex: 1, flexWrap: 'wrap' }}>
                    {[
                        { value: 'click', icon: MousePointer, label: 'Click' },
                        { value: 'double_click', icon: MousePointer, label: 'Dbl Clic' },
                        { value: 'keypress', icon: Keyboard, label: 'Tecla' },
                        { value: 'input', icon: TextCursorInput, label: 'Input' },
                        { value: 'dropdown', icon: List, label: 'Lista' },
                        { value: 'dependent_dropdown', icon: ListTree, label: 'Lista Doble' },
                    ].map(({ value, icon: Icon, label }) => {
                        const active = trigger.type === value
                        const c = TRIGGER_COLORS[value]
                        return (
                            <button
                                key={value}
                                onClick={(e) => { e.stopPropagation(); onUpdate({ type: value }); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '3px 8px', borderRadius: 5,
                                    border: active ? `1px solid ${c.border}` : '1px solid var(--color-border)',
                                    background: active ? c.bg : 'transparent',
                                    color: active ? c.label : 'var(--color-text-muted)',
                                    fontSize: 10, fontWeight: active ? 600 : 400,
                                    cursor: 'pointer', transition: 'all 120ms ease-out',
                                }}
                            >
                                <Icon size={10} />
                                {label}
                            </button>
                        )
                    })}
                </div>

                {/* Collapse/Expand button */}
                <button
                    onClick={onToggleExpand}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 20, height: 20, borderRadius: 4,
                        border: 'none', background: 'transparent',
                        color: 'var(--color-text-muted)', cursor: 'pointer',
                        transition: 'all 120ms ease-out',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Delete button */}
                {allTriggers.length > 1 && (
                    <button
                        onClick={onDelete}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 20, height: 20, borderRadius: 4,
                            border: '1px solid transparent', background: 'transparent',
                            color: 'var(--color-text-muted)', cursor: 'pointer',
                            transition: 'all 120ms ease-out',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(192,64,64,0.12)'
                            e.currentTarget.style.color = 'var(--color-danger)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--color-text-muted)'
                        }}
                    >
                        <Trash2 size={10} />
                    </button>
                )}
            </div>

            {/* Card body (Collapsible) */}
            {isExpanded && (
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Hotspot — always shown for both types */}
                    <div>
                        <FieldLabel>Posición sobre la imagen</FieldLabel>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                            <NumericInput label="X" value={hs.x} accentColor={colors.label} onChange={e => setHotspot('x', e.target.value)} />
                            <NumericInput label="Y" value={hs.y} accentColor={colors.label} onChange={e => setHotspot('y', e.target.value)} />
                            <NumericInput label="Ancho" value={hs.w} accentColor={colors.label} onChange={e => setHotspot('w', e.target.value)} />
                            <NumericInput label="Alto" value={hs.h} accentColor={colors.label} onChange={e => setHotspot('h', e.target.value)} />
                        </div>
                    </div>

                    {/* Validation text — only for input type */}
                    {trigger.type === 'input' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div>
                                <FieldLabel>Placeholder</FieldLabel>
                                <TextInput
                                    value={trigger.placeholderText ?? ''}
                                    onChange={e => onUpdate({ placeholderText: e.target.value })}
                                    placeholder="Escribe aquí..."
                                />
                            </div>
                            <div>
                                <FieldLabel>Texto de validación (Requerido para avanzar)</FieldLabel>
                                <TextInput
                                    value={trigger.validationValue || ''}
                                    onChange={e => onUpdate({ validationValue: e.target.value })}
                                    placeholder="Dejar vacío para avanzar con cualquier texto"
                                    mono
                                />
                            </div>

                        </div>
                    )}

                    {trigger.type === 'keypress' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div>
                                <FieldLabel>Presiona la tecla deseada</FieldLabel>
                                <input
                                    type="text"
                                    value={trigger.keyCode || ''}
                                    placeholder="Haz clic aquí y presiona una tecla..."
                                    readOnly
                                    onKeyDown={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        const key = e.key === ' ' ? 'Space' : e.key
                                        onUpdate({ keyCode: key })
                                    }}
                                    style={{
                                        width: '100%',
                                        background: 'var(--color-control)',
                                        border: `1px solid ${trigger.keyCode ? colors.borderActive : 'var(--color-border)'}`,
                                        borderRadius: 6, padding: '6px 10px',
                                        fontSize: 12, fontWeight: 600,
                                        fontFamily: 'ui-monospace, monospace',
                                        color: trigger.keyCode ? colors.label : 'var(--color-text-primary)',
                                        outline: 'none', transition: 'all 150ms ease-out',
                                        cursor: 'pointer', textAlign: 'center'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Dropdown configuration */}
                    {trigger.type === 'dropdown' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <FieldLabel>Opciones de la lista (Pega desde Excel, una por línea)</FieldLabel>
                                <textarea
                                    value={trigger.optionsText || ''}
                                    onChange={e => onUpdate({ optionsText: e.target.value, validationValue: '' })}
                                    placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
                                    rows={4}
                                    style={{
                                        width: '100%', resize: 'vertical',
                                        background: 'var(--color-control)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 6, padding: '6px 8px',
                                        fontSize: 12, color: 'var(--color-text-primary)', outline: 'none',
                                        fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre',
                                        transition: 'border-color 150ms ease-out',
                                    }}
                                    onFocus={e => e.target.style.borderColor = colors.label}
                                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                                />
                            </div>
                            <div>
                                <FieldLabel>Opción correcta (Requerida para avanzar)</FieldLabel>
                                <select
                                    value={trigger.validationValue || ''}
                                    onChange={e => onUpdate({ validationValue: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: 'var(--color-control)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 6, padding: '5px 8px', height: 26,
                                        fontSize: 11, color: 'var(--color-text-primary)', outline: 'none',
                                        transition: 'border-color 150ms ease-out',
                                        appearance: 'none',
                                    }}
                                    onFocus={e => e.target.style.borderColor = colors.label}
                                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                                >
                                    <option value="" disabled>Selecciona la correcta...</option>
                                    {[...new Set((trigger.optionsText || '').split('\n').map(o => o.trim()).filter(Boolean))].map((opt, i) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {trigger.type === 'dependent_dropdown' && (() => {
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

                            // Fallback: If only 2 columns exist, assume they are parent -> child
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
                        const categories = Object.keys(cMap)

                        // Find potential parents
                        const parentTriggers = allTriggers.filter(t => t.id !== trigger.id && (t.type === 'dropdown' || t.type === 'input' || t.type === 'dependent_dropdown'))

                        return (
                            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div>
                                    <FieldLabel>Anidada de (Lista/Input Padre)</FieldLabel>
                                    <select
                                        value={trigger.dependsOnTriggerId || ''}
                                        onChange={e => onUpdate({ dependsOnTriggerId: e.target.value })}
                                        style={{
                                            width: '100%', background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                            borderRadius: 6, padding: '5px', fontSize: 11, color: 'var(--color-text-primary)', outline: 'none'
                                        }}
                                    >
                                        <option value="">-- Selecciona un trigger --</option>
                                        {parentTriggers.map(t => (
                                            <option key={t.id} value={t.id}>
                                                Paso {allTriggers.findIndex(tr => tr.id === t.id) + 1} - {TRIGGER_LABELS[t.type]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ flex: 1 }}>
                                        <FieldLabel>Nivel de Datos (Columna a leer)</FieldLabel>
                                        <NumericInput
                                            value={trigger.dataColumnIndex || 2}
                                            accentColor={colors.label}
                                            onChange={e => {
                                                const val = parseInt(e.target.value) || 2;
                                                onUpdate({ dataColumnIndex: Math.max(2, val) });
                                            }}
                                            min={2} max={10} step="1" suffix=" (Nivel)"
                                        />
                                    </div>
                                    <div style={{ flex: 1, fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.2 }}>
                                        Nivel N extrae opciones de pares Columna N-1 y Columna N.<br />Aplica solo al pegar tablas grandes &gt;2 columnas.
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel>
                                        Opciones (Pegar tabla de Excel)
                                    </FieldLabel>
                                    <textarea
                                        value={trigger.optionsText || ''}
                                        onChange={e => onUpdate({ optionsText: e.target.value })}
                                        placeholder="Categoría 1 &#9; Subcategoría A&#10;Categoría 1 &#9; Subcategoría B&#10;Categoría 2 &#9; Subcategoría C"
                                        style={{
                                            width: '100%', minHeight: 70, resize: 'vertical',
                                            padding: 8, borderRadius: 6, fontSize: 11,
                                            background: 'var(--color-control)', color: 'var(--color-text-primary)',
                                            border: '1px solid var(--color-border)', outline: 'none',
                                            lineHeight: 1.4, fontFamily: 'monospace'
                                        }}
                                    />
                                    <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
                                        Copia columnas de Excel (Categoría Padre y Sus Hijos).
                                    </p>
                                </div>
                                <div>
                                    <FieldLabel>Opción Correcta</FieldLabel>
                                    <select
                                        value={trigger.validationValue || ''}
                                        onChange={e => onUpdate({ validationValue: e.target.value })}
                                        style={{
                                            width: '100%', background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                            borderRadius: 6, padding: '5px', fontSize: 11, color: 'var(--color-text-primary)', outline: 'none'
                                        }}
                                    >
                                        <option value="">Cualquiera / Ninguna</option>
                                        {categories.map((c, i) => (
                                            <optgroup key={i} label={c} style={{ background: 'var(--color-bg)' }}>
                                                {(cMap[c] || []).map((sub, j) => (
                                                    <option key={j} value={sub}>{sub}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )
                    })()}

                    {/* Advanced Settings Toggle */}
                    <div
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '6px 0', marginTop: 4, cursor: 'pointer',
                            color: 'var(--color-text-tertiary)',
                            transition: 'color 150ms'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
                    >
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            {showAdvanced ? 'Ocultar ajustes avanzados' : 'Mostrar ajustes avanzados'}
                        </span>
                        {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </div>

                    {showAdvanced && (
                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: 10,
                            paddingTop: 8, paddingBottom: 4, borderTop: '1px solid var(--color-border-subtle)'
                        }}>

                            {/* ADVANCED: Type-Specific */}
                            {trigger.type === 'input' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <NumericInput
                                        label="Tamaño de letra del input"
                                        value={trigger.fontSize || ''}
                                        accentColor={colors.label}
                                        onChange={e => onUpdate({ fontSize: e.target.value ? parseInt(e.target.value) : null })}
                                        min={8} max={72} step="1" suffix="px"
                                    />
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        cursor: 'pointer', fontSize: 11, color: 'var(--color-text-secondary)',
                                        userSelect: 'none'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={trigger.isPassword || false}
                                            onChange={e => onUpdate({ isPassword: e.target.checked })}
                                            style={{ accentColor: colors.label, width: 14, height: 14, cursor: 'pointer' }}
                                        />
                                        Campo tipo contraseña (ocultar texto tipeado)
                                    </label>
                                </div>
                            )}

                            {(trigger.type === 'dropdown' || trigger.type === 'dependent_dropdown') && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <NumericInput
                                                label="Tamaño de letra"
                                                value={trigger.fontSize || ''}
                                                accentColor={colors.label}
                                                onChange={e => onUpdate({ fontSize: e.target.value ? parseInt(e.target.value) : null })}
                                                min={8} max={72} step="1" suffix="px"
                                            />
                                        </div>
                                        <div>
                                            <FieldLabel>Color de Fondo</FieldLabel>
                                            <TextInput
                                                value={trigger.bgColor || ''}
                                                onChange={e => onUpdate({ bgColor: e.target.value })}
                                                placeholder="Ej: transparent o #ffffff"
                                            />
                                        </div>
                                        <div>
                                            <FieldLabel>Color de Texto</FieldLabel>
                                            <TextInput
                                                value={trigger.textColor || ''}
                                                onChange={e => onUpdate({ textColor: e.target.value })}
                                                placeholder="Ej: #000000"
                                            />
                                        </div>
                                    </div>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        cursor: 'pointer', fontSize: 11, color: 'var(--color-text-secondary)',
                                        userSelect: 'none'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={trigger.nativeStyles || false}
                                            onChange={e => onUpdate({ nativeStyles: e.target.checked })}
                                            style={{ accentColor: colors.label, width: 14, height: 14, cursor: 'pointer' }}
                                        />
                                        Usar apariencia HTML nativa del navegador para este elemento
                                    </label>
                                </div>
                            )}

                            {/* ADVANCED: Generic */}
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                cursor: 'pointer', fontSize: 11, color: 'var(--color-text-secondary)',
                                userSelect: 'none',
                                marginTop: (trigger.type === 'click' || trigger.type === 'double_click' || trigger.type === 'keypress') ? 0 : 8
                            }}>
                                <input
                                    type="checkbox"
                                    checked={trigger.hidden || false}
                                    onChange={e => onUpdate({ hidden: e.target.checked })}
                                    style={{ accentColor: colors.label, width: 14, height: 14, cursor: 'pointer' }}
                                />
                                Ocultar área/estilos durante la simulación libre (Hotspot invisible)
                            </label>

                            {/* Navigate Target (Branching) */}
                            <div>
                                <FieldLabel>Navegar a pantalla (Opcional - Ramificación)</FieldLabel>
                                <select
                                    value={trigger.navigateTarget || ''}
                                    onChange={e => onUpdate({ navigateTarget: e.target.value || null })}
                                    style={{
                                        width: '100%',
                                        background: 'var(--color-control)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 6, padding: '5px 8px',
                                        fontSize: 11, color: 'var(--color-text-primary)', outline: 'none',
                                        transition: 'border-color 150ms ease-out',
                                        appearance: 'none',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--color-border-strong)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                                >
                                    <option value="">(Secuencia normal lineal)</option>
                                    {nodes?.filter(n => n.id !== trigger.id).map(tNode => (
                                        <option key={tNode.id} value={tNode.id}>
                                            {tNode.data.label || 'Sin nombre'}
                                        </option>
                                    ))}
                                </select>
                                <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.25 }}>
                                    Si seleccionas una pantalla, al completar la simulación saltará a ella directamente perdiendo el progreso actual en esta pantalla. Útil para bifurcaciones tipo "Acepta/Cancela".
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Multiple Dependencies */}
                    {allTriggers.length > 1 && (
                        <div style={{ marginTop: 8 }}>
                            <FieldLabel>Depende de (Opcional)</FieldLabel>
                            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 6, lineHeight: 1.2 }}>
                                Este paso permanecerá bloqueado hasta que completes los triggers seleccionados.
                            </p>
                            <div style={{
                                display: 'flex', flexDirection: 'column', gap: 6,
                                background: 'var(--color-surface)', padding: 8, borderRadius: 6,
                                border: '1px solid var(--color-border)',
                                maxHeight: 120, overflowY: 'auto'
                            }}>
                                {allTriggers.filter(t => t.id !== trigger.id).map(t => {
                                    const tIndex = allTriggers.findIndex(x => x.id === t.id) + 1

                                    // Normalize dependsOn to array
                                    const depsArray = Array.isArray(trigger.dependsOn)
                                        ? trigger.dependsOn
                                        : (trigger.dependsOn ? [trigger.dependsOn] : [])

                                    const isChecked = depsArray.includes(t.id)

                                    return (
                                        <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    let newDeps = [...depsArray]
                                                    if (e.target.checked) {
                                                        newDeps.push(t.id)
                                                    } else {
                                                        newDeps = newDeps.filter(id => id !== t.id)
                                                    }
                                                    onUpdate({ dependsOn: newDeps.length > 0 ? newDeps : null })
                                                }}
                                                style={{ cursor: 'pointer', accentColor: 'var(--color-brand)' }}
                                            />
                                            <span style={{ fontSize: 11, color: isChecked ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                                                Paso {tIndex} ({TRIGGER_LABELS[t.type] || t.type})
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ── Main component ── */
export default function NodeConfigPanel({ node, onUpdateNode, nodes, onEditImage }) {
    const fileInputRef = useRef(null)
    const [draggedIdx, setDraggedIdx] = useState(null)
    const [dragOverIdx, setDragOverIdx] = useState(null)
    const [expandedState, setExpandedState] = useState({})

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
    const update = (patch) => onUpdateNode(node.id, patch)
    const triggers = normalizeTriggers(data)

    const setTriggers = (newTriggers) => update({ triggers: newTriggers })
    const updateTrigger = (idx, patch) =>
        setTriggers(triggers.map((t, i) => i === idx ? { ...t, ...patch } : t))
    const deleteTrigger = (idx) =>
        setTriggers(triggers.filter((_, i) => i !== idx))
    const addTrigger = (type) =>
        setTriggers([...triggers, makeDefaultTrigger(type)])

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => update({ image: ev.target.result })
        reader.readAsDataURL(file)
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 12,
            padding: 14, height: '100%', overflowY: 'auto',
        }}>
            {/* Name */}
            <div>
                <FieldLabel>Nombre</FieldLabel>
                <TextInput
                    value={data.label || ''}
                    onChange={e => update({ label: e.target.value })}
                    placeholder="Pantalla sin nombre"
                />
            </div>

            <Divider label="Imagen" />

            {/* Image upload */}
            <input ref={fileInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleImageUpload} />

            {data.image ? (
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            position: 'relative', borderRadius: 7, overflow: 'hidden',
                            border: '1px solid var(--color-border)', cursor: 'pointer',
                            display: 'block', width: '100%', background: '#000', padding: 0,
                        }}
                    >
                        <img src={data.image} alt="preview" style={{ width: '100%', height: 160, objectFit: 'contain', display: 'block' }} />
                        <div
                            style={{
                                position: 'absolute', inset: 0, background: 'rgba(10,13,18,0.65)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                opacity: 0, transition: 'opacity 150ms ease-out',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                            <Image size={14} style={{ color: '#e2eaf4' }} />
                            <span style={{ fontSize: 11, fontWeight: 500, color: '#e2eaf4' }}>Cambiar</span>
                        </div>
                    </button>
                    <button
                        onClick={onEditImage}
                        style={{
                            position: 'absolute', top: 8, right: 8,
                            background: 'var(--color-brand)', border: 'none',
                            borderRadius: 4, padding: '4px 8px',
                            display: 'flex', alignItems: 'center', gap: 6,
                            color: 'white', fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                            zIndex: 2
                        }}
                    >
                        ✏️ Editar
                    </button>
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
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Subir imagen</span>
                </button>
            )}

            {/* Triggers */}
            <Divider label={triggers.length > 0 ? `Triggers · ${triggers.length}` : 'Triggers'} />

            {triggers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {triggers.map((trigger, idx) => {
                        const isExpanded = expandedState[trigger.id] !== false // Default true
                        const isDragged = draggedIdx === idx
                        const isDragOver = dragOverIdx === idx

                        const draggableProps = {
                            draggable: true,
                            onDragStart: (e) => {
                                setDraggedIdx(idx)
                                e.dataTransfer.effectAllowed = 'move'
                                // Ghost image trick for cleaner drag
                                const el = e.currentTarget
                                e.dataTransfer.setDragImage(el, 20, 20)
                            },
                            onDragOver: (e) => {
                                e.preventDefault() // Necessary to allow dropping
                                if (draggedIdx !== null && draggedIdx !== idx) {
                                    setDragOverIdx(idx)
                                }
                            },
                            onDragLeave: () => {
                                setDragOverIdx(null)
                            },
                            onDrop: (e) => {
                                e.preventDefault()
                                if (draggedIdx !== null && draggedIdx !== idx) {
                                    const newTriggers = [...triggers]
                                    const [draggedItem] = newTriggers.splice(draggedIdx, 1)
                                    newTriggers.splice(idx, 0, draggedItem)
                                    setTriggers(newTriggers)
                                }
                                setDraggedIdx(null)
                                setDragOverIdx(null)
                            },
                            onDragEnd: () => {
                                setDraggedIdx(null)
                                setDragOverIdx(null)
                            },
                            style: {
                                opacity: isDragged ? 0.4 : 1,
                                outline: isDragOver ? '2px solid var(--color-brand)' : 'none',
                                outlineOffset: 2,
                                transform: isDragOver ? (draggedIdx < idx ? 'translateY(4px)' : 'translateY(-4px)') : 'none',
                                transition: 'transform 150ms ease, outline 150ms ease, opacity 150ms ease',
                            }
                        }

                        return (
                            <React.Fragment key={trigger.id}>
                                <TriggerCard
                                    trigger={trigger}
                                    index={idx}
                                    allTriggers={triggers}
                                    nodes={nodes}
                                    onUpdate={patch => updateTrigger(idx, patch)}
                                    onDelete={() => deleteTrigger(idx)}
                                    isExpanded={isExpanded}
                                    onToggleExpand={() => setExpandedState(prev => ({ ...prev, [trigger.id]: !isExpanded }))}
                                    draggableProps={draggableProps}
                                />
                                {idx < triggers.length - 1 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isDragged ? 0.4 : 1 }}>
                                        <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
                                        <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>LUEGO</span>
                                        <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
                                    </div>
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>
            )}

            {triggers.length === 0 && (
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', padding: '2px 0' }}>
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
                </div>
            </div>
        </div>
    )
}

function AddBtn({ onClick, icon: Icon, label, color }) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 5, padding: '6px 0', borderRadius: 6,
                border: '1px dashed var(--color-border)',
                background: 'transparent', cursor: 'pointer',
                fontSize: 11, fontWeight: 500, color: 'var(--color-text-muted)',
                transition: 'all 150ms ease-out',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = color
                e.currentTarget.style.color = color
                e.currentTarget.style.background = `${color}18`
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-muted)'
                e.currentTarget.style.background = 'transparent'
            }}
        >
            <Icon size={11} />
            {label}
        </button>
    )
}
