import React, { useRef, useState } from 'react'
import { Upload, MousePointer, Keyboard, Info, Image, Video, Trash2, GripVertical, ChevronDown, ChevronUp, TextCursorInput, List, ListTree, Plus, ImageIcon, CircleDot, CheckSquare, CalendarDays, Undo2, Settings2 } from 'lucide-react'
import { normalizeTriggers, makeDefaultTrigger, TRIGGER_COLORS, TRIGGER_LABELS } from '../shared/utils/triggers'
import { FieldLabel } from '../shared/components/FieldLabel'
import { Divider } from '../shared/components/Divider'
import { TextInput } from '../shared/components/TextInput'
import { NumericInput } from '../shared/components/NumericInput'


/* ── TriggerCard ── */
function TriggerCard({
    trigger, index, allTriggers, nodes,
    onUpdate, onDelete,
    isExpanded, onToggleExpand,
    draggableProps, onOpenScrollLibrary
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
                        { value: 'scroll_area', icon: GripVertical, label: 'Área Scroll' },
                        { value: 'radio', icon: CircleDot, label: 'Radio' },
                        { value: 'checkbox', icon: CheckSquare, label: 'Checkbox' },
                        { value: 'input_date', icon: CalendarDays, label: 'Calendario' },
                    ].map(({ value, icon: Icon, label }) => {
                        const active = trigger.type === value
                        const c = TRIGGER_COLORS[value] || TRIGGER_COLORS.click
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

                    {/* Obligatorio */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: -4 }}>
                        <input
                            type="checkbox"
                            checked={trigger.isOptional !== true}
                            onChange={e => onUpdate({ isOptional: !e.target.checked })}
                            id={`opt-${trigger.id}`}
                            style={{ accentColor: colors.label, cursor: 'pointer' }}
                        />
                        <label htmlFor={`opt-${trigger.id}`} style={{ fontSize: 11, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                            Obligatorio para avanzar de pantalla
                        </label>
                    </div>

                    {/* Practice Mode Hint */}
                    <div>
                        <FieldLabel>Guía / Pista (Modo Práctica)</FieldLabel>
                        <textarea
                            value={trigger.hint || ''}
                            onChange={e => onUpdate({ hint: e.target.value })}
                            placeholder="Ej: Haz clic en el botón 'Guardar' para continuar..."
                            rows={2}
                            style={{
                                width: '100%', resize: 'vertical',
                                background: 'var(--color-control)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 6, padding: '6px 8px',
                                fontSize: 11, color: 'var(--color-text-primary)', outline: 'none',
                                fontFamily: 'inherit',
                                transition: 'border-color 150ms ease-out',
                            }}
                            onFocus={e => e.target.style.borderColor = colors.label}
                            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                        />
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

                    {trigger.type === 'input_date' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div>
                                <FieldLabel>Fecha requerida para poder avanzar</FieldLabel>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        value={trigger.validationValue || ''}
                                        onChange={e => onUpdate({ validationValue: e.target.value })}
                                        style={{
                                            width: '100%',
                                            background: 'var(--color-control)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 6, padding: '6px 10px',
                                            fontSize: 12,
                                            color: 'var(--color-text-primary)', outline: 'none',
                                            transition: 'border-color 150ms ease-out',
                                            colorScheme: 'dark'
                                        }}
                                        onFocus={e => e.target.style.borderColor = colors.label}
                                        onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                                    />
                                    {!trigger.validationValue && (
                                        <div style={{ position: 'absolute', right: 35, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
                                            (Cualquier fecha)
                                        </div>
                                    )}
                                </div>
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

                    {trigger.type === 'scroll_area' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                            <FieldLabel>Imagen de Contenido (Scrollable)</FieldLabel>
                            {trigger.contentImage ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{
                                        position: 'relative', width: '100%', height: 80,
                                        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                        borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <img src={trigger.contentImage} alt="Contenido scroll" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        <button
                                            onClick={() => onUpdate({ contentImage: null })}
                                            style={{
                                                position: 'absolute', top: 4, right: 4, width: 20, height: 20,
                                                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 4, color: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                            }}
                                            title="Eliminar imagen"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                                        Esta imagen se mostrará dentro del área y permitirá hacer scroll verticalmente durante la simulación.
                                    </span>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="file" accept="image/*"
                                        id={`upload-scroll-${trigger.id}`}
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onload = (ev) => onUpdate({ contentImage: ev.target.result })
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`upload-scroll-${trigger.id}`}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                            width: '100%', padding: '10px', background: 'var(--color-control)',
                                            border: '1px dashed var(--color-border-strong)', borderRadius: 6,
                                            color: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                                            transition: 'all 150ms'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = colors.label
                                            e.currentTarget.style.color = 'var(--color-text-primary)'
                                            e.currentTarget.style.background = `rgba(${colors.bg.match(/[0-9.]+/g).slice(0, 3).join(',')}, 0.05)`
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                                            e.currentTarget.style.color = 'var(--color-text-secondary)'
                                            e.currentTarget.style.background = 'var(--color-control)'
                                        }}
                                    >
                                        <Upload size={14} /> Subir imagen larga
                                    </label>

                                    <button
                                        onClick={() => {
                                            if (onOpenScrollLibrary) {
                                                onOpenScrollLibrary((dataUrl) => onUpdate({ contentImage: dataUrl }))
                                            }
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                            width: '100%', padding: '10px', background: 'var(--color-raised)',
                                            border: '1px solid var(--color-border)', borderRadius: 6,
                                            color: 'var(--color-text-primary)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                            transition: 'all 150ms', marginTop: 8
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-control)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'var(--color-raised)'}
                                    >
                                        <ImageIcon size={14} color="var(--color-brand)" /> Seleccionar de Biblioteca
                                    </button>
                                </div>
                            )}
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

                    {/* Radio button configuration */}
                    {trigger.type === 'radio' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <FieldLabel>Nombre del grupo</FieldLabel>
                                <input
                                    value={trigger.radioGroup || ''}
                                    onChange={e => onUpdate({ radioGroup: e.target.value })}
                                    placeholder="Ej: pregunta1"
                                    style={{
                                        width: '100%',
                                        background: 'var(--color-control)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 6, padding: '5px 8px', height: 26,
                                        fontSize: 11, color: 'var(--color-text-primary)', outline: 'none',
                                        transition: 'border-color 150ms ease-out',
                                    }}
                                    onFocus={e => e.target.style.borderColor = colors.label}
                                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                                />
                            </div>
                            <div>
                                <FieldLabel>Texto de la opción</FieldLabel>
                                <input
                                    value={trigger.radioLabel || ''}
                                    onChange={e => onUpdate({ radioLabel: e.target.value })}
                                    placeholder="Ej: Opción A"
                                    style={{
                                        width: '100%',
                                        background: 'var(--color-control)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 6, padding: '5px 8px', height: 26,
                                        fontSize: 11, color: 'var(--color-text-primary)', outline: 'none',
                                        transition: 'border-color 150ms ease-out',
                                    }}
                                    onFocus={e => e.target.style.borderColor = colors.label}
                                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                                />
                            </div>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                fontSize: 11, color: 'var(--color-text-secondary)', cursor: 'pointer',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={!!trigger.isCorrectOption}
                                    onChange={e => onUpdate({ isCorrectOption: e.target.checked })}
                                    style={{ accentColor: colors.label }}
                                />
                                Es la opción correcta
                            </label>
                        </div>
                    )}

                    {/* Checkbox configuration */}
                    {trigger.type === 'checkbox' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <FieldLabel>Nombre del grupo</FieldLabel>
                                <input
                                    value={trigger.checkboxGroup || ''}
                                    onChange={e => onUpdate({ checkboxGroup: e.target.value })}
                                    placeholder="Ej: requisitos1"
                                    style={{
                                        width: '100%',
                                        background: 'var(--color-control)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 6, padding: '5px 8px', height: 26,
                                        fontSize: 11, color: 'var(--color-text-primary)', outline: 'none',
                                        transition: 'border-color 150ms ease-out',
                                    }}
                                    onFocus={e => e.target.style.borderColor = colors.label}
                                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                                />
                            </div>
                            <div>
                                <FieldLabel>Texto de la opción</FieldLabel>
                                <input
                                    value={trigger.checkboxLabel || ''}
                                    onChange={e => onUpdate({ checkboxLabel: e.target.value })}
                                    placeholder="Ej: Acepto términos"
                                    style={{
                                        width: '100%',
                                        background: 'var(--color-control)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 6, padding: '5px 8px', height: 26,
                                        fontSize: 11, color: 'var(--color-text-primary)', outline: 'none',
                                        transition: 'border-color 150ms ease-out',
                                    }}
                                    onFocus={e => e.target.style.borderColor = colors.label}
                                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                                />
                            </div>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                fontSize: 11, color: 'var(--color-text-secondary)', cursor: 'pointer',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={!!trigger.isCorrectOption}
                                    onChange={e => onUpdate({ isCorrectOption: e.target.checked })}
                                    style={{ accentColor: colors.label }}
                                />
                                Debe estar marcado (obligatorio)
                            </label>
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
                    {allTriggers.length > 1 && trigger.type !== 'scroll_area' && (
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
export default function NodeConfigPanel({ node, onUpdateNode, nodes, onEditImage, activeTab = 'node', onOpenScrollLibrary }) {
    const fileInputRef = useRef(null)
    const [draggedIdx, setDraggedIdx] = useState(null)
    const [dragOverIdx, setDragOverIdx] = useState(null)
    const [expandedState, setExpandedState] = useState({})
    const [editingTriggerId, setEditingTriggerId] = useState(null)

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
    const addTrigger = (type) => {
        const newTrigger = makeDefaultTrigger(type)
        setTriggers([...triggers, newTrigger])
        setEditingTriggerId(newTrigger.id)
    }

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

                                        {/* Edit Button */}
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
                                    const isDragged = draggedIdx === idx
                                    const isDragOver = dragOverIdx === idx
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
                                        onDragStart: (e) => {
                                            setDraggedIdx(idx)
                                            e.dataTransfer.effectAllowed = 'move'
                                            e.dataTransfer.setDragImage(e.currentTarget, 20, 20)
                                        },
                                        onDragOver: (e) => {
                                            e.preventDefault()
                                            if (draggedIdx !== null && draggedIdx !== idx) setDragOverIdx(idx)
                                        },
                                        onDragLeave: () => setDragOverIdx(null),
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
                                            outlineOffset: 1,
                                            transform: isDragOver ? (draggedIdx < idx ? 'translateY(2px)' : 'translateY(-2px)') : 'none',
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
