import React, { useState } from 'react'
import { Upload, MousePointer, Keyboard, Info, Image, Video, Trash2, GripVertical, ChevronDown, ChevronUp, TextCursorInput, List, ListTree, Plus, ImageIcon, CircleDot, CheckSquare, CalendarDays, Undo2, Settings2, AppWindow, GripHorizontal, Eye, EyeOff, Settings, Maximize2, Table } from 'lucide-react'
import { TRIGGER_COLORS, TRIGGER_LABELS } from '../../../shared/utils/triggers'
import { FieldLabel } from '../../../shared/components/FieldLabel'
import { Divider } from '../../../shared/components/Divider'
import { TextInput } from '../../../shared/components/TextInput'
import { NumericInput } from '../../../shared/components/NumericInput'

export function TriggerCard({
    trigger, index, allTriggers, nodes,
    onUpdate, onDelete,
    isExpanded, onToggleExpand,
    draggableProps, onOpenScrollLibrary,
    isChild = false
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
                        { value: 'floating_window', icon: AppWindow, label: 'Ventana Flot.' },
                        { value: 'table_grid', icon: Table, label: 'Grid/Tabla' },
                        { value: 'radio', icon: ({ size, color }) => <CircleDot size={size} color={color} />, label: 'Radio' },
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
                {(allTriggers.length > 1 || isChild) && (
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

                    {(trigger.type === 'scroll_area' || trigger.type === 'floating_window') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                            <FieldLabel>{trigger.type === 'scroll_area' ? 'Imagen de Contenido (Scrollable)' : 'Imagen de Contenido (Ventana)'}</FieldLabel>
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
                                        {trigger.type === 'scroll_area' ? 'Esta imagen se mostrará dentro del área y permitirá hacer scroll verticalmente durante la simulación.' : 'Esta imagen se mostrará dentro de la ventana flotante.'}
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

                            {trigger.type === 'floating_window' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    <input
                                        type="checkbox"
                                        checked={trigger.isDraggable !== false} // default true
                                        onChange={e => onUpdate({ isDraggable: e.target.checked })}
                                        id={`drag-${trigger.id}`}
                                        style={{ accentColor: colors.label, cursor: 'pointer' }}
                                    />
                                    <label htmlFor={`drag-${trigger.id}`} style={{ fontSize: 11, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                                        Permitir al usuario arrastrar la ventana
                                    </label>
                                </div>
                            )}

                            {/* Child Triggers inside Area */}
                            {!isChild && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <FieldLabel>{trigger.type === 'scroll_area' ? 'Triggers dentro del Scroll' : 'Triggers dentro de la Ventana'}</FieldLabel>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {(trigger.triggers || []).map((childTrigger, cIdx) => (
                                            <TriggerCard
                                                key={childTrigger.id}
                                                trigger={childTrigger}
                                                index={cIdx}
                                                allTriggers={trigger.triggers || []}
                                                nodes={nodes}
                                                onUpdate={(patch) => {
                                                    const newTriggers = [...(trigger.triggers || [])]
                                                    newTriggers[cIdx] = { ...newTriggers[cIdx], ...patch }
                                                    onUpdate({ triggers: newTriggers })
                                                }}
                                                onDelete={() => {
                                                    const newTriggers = (trigger.triggers || []).filter((_, i) => i !== cIdx)
                                                    onUpdate({ triggers: newTriggers })
                                                }}
                                                isExpanded={childTrigger._expanded !== false}
                                                onToggleExpand={() => {
                                                    const newTriggers = [...(trigger.triggers || [])]
                                                    newTriggers[cIdx] = { ...newTriggers[cIdx], _expanded: childTrigger._expanded === false }
                                                    onUpdate({ triggers: newTriggers })
                                                }}
                                                draggableProps={{}}
                                                onOpenScrollLibrary={onOpenScrollLibrary}
                                                isChild={true}
                                            />
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                                        {[
                                            { value: 'click', label: '+ Click' },
                                            { value: 'input', label: '+ Input' },
                                            { value: 'dropdown', label: '+ Lista' },
                                            { value: 'radio', label: '+ Radio' },
                                            { value: 'checkbox', label: '+ Checkbox' }
                                        ].map(btn => (
                                            <button
                                                key={btn.value}
                                                onClick={() => {
                                                    import('../../../shared/utils/triggers').then(m => {
                                                        const newT = m.makeDefaultTrigger(btn.value)
                                                        newT._expanded = true
                                                        onUpdate({ triggers: [...(trigger.triggers || []), newT] })
                                                    })
                                                }}
                                                style={{
                                                    padding: '4px 8px', borderRadius: 4, background: 'var(--color-surface)',
                                                    border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
                                                    fontSize: 10, cursor: 'pointer', transition: 'all 120ms'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = 'var(--color-control)'
                                                    e.currentTarget.style.color = 'var(--color-text-primary)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = 'var(--color-surface)'
                                                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                                                }}
                                            >
                                                {btn.label}
                                            </button>
                                        ))}
                                    </div>
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

                    {trigger.type === 'table_grid' && (() => {
                        const rawDataX = trigger.tableRawData || '';
                        const rowsX = rawDataX.split('\n');
                        const maxColsX = Math.max(...rowsX.map(r => r.split('\t').length), 1);

                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>

                                {/* Visual Builder */}
                                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Constructor Visual</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
                                        {rowsX.map((rText, rIdx) => {
                                            const cols = rText.split('\t');
                                            while (cols.length < maxColsX) cols.push('');
                                            return (
                                                <div key={rIdx} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                    {cols.map((val, cIdx) => (
                                                        <input
                                                            key={cIdx}
                                                            value={val}
                                                            placeholder="Vacio"
                                                            onChange={(e) => {
                                                                const matrix = rowsX.map(r => {
                                                                    let c = r.split('\t');
                                                                    while (c.length < maxColsX) c.push('');
                                                                    return c;
                                                                });
                                                                matrix[rIdx][cIdx] = e.target.value;
                                                                onUpdate({ tableRawData: matrix.map(r => r.join('\t')).join('\n') });
                                                            }}
                                                            style={{
                                                                flex: '1 0 60px', width: 60, padding: '4px 6px', fontSize: 11,
                                                                borderRadius: 4, border: '1px solid var(--color-border)',
                                                                background: 'var(--color-control)', color: 'var(--color-text-primary)'
                                                            }}
                                                        />
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            const m = rowsX.filter((_, i) => i !== rIdx);
                                                            onUpdate({ tableRawData: m.join('\n') });
                                                        }}
                                                        style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0 4px', display: 'flex' }}
                                                        title="Eliminar fila"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                        <button onClick={() => {
                                            const newRow = Array(maxColsX).fill('').join('\t');
                                            onUpdate({ tableRawData: (trigger.tableRawData ? trigger.tableRawData + '\n' : '') + newRow });
                                        }} style={{ flex: 1, padding: '4px 0', fontSize: 10, fontWeight: 500, background: 'var(--color-control)', border: '1px dashed var(--color-border)', borderRadius: 4, cursor: 'pointer', color: 'var(--color-text-secondary)' }}>+ Fila</button>

                                        <button onClick={() => {
                                            const matrix = rowsX.map(r => {
                                                const cols = r.split('\t');
                                                cols.push('');
                                                return cols;
                                            });
                                            onUpdate({ tableRawData: matrix.map(r => r.join('\t')).join('\n') });
                                        }} style={{ flex: 1, padding: '4px 0', fontSize: 10, fontWeight: 500, background: 'var(--color-control)', border: '1px dashed var(--color-border)', borderRadius: 4, cursor: 'pointer', color: 'var(--color-text-secondary)' }}>+ Columna</button>

                                        {maxColsX > 1 && (
                                            <button onClick={() => {
                                                const matrix = rowsX.map(r => {
                                                    const arr = r.split('\t');
                                                    arr.pop();
                                                    return arr;
                                                });
                                                onUpdate({ tableRawData: matrix.map(r => r.join('\t')).join('\n') });
                                            }} style={{ flex: 1, padding: '4px 0', fontSize: 10, fontWeight: 500, background: 'var(--color-control)', border: '1px dashed var(--color-border)', borderRadius: 4, cursor: 'pointer', color: 'var(--color-danger)' }}>- Columna</button>
                                        )}
                                    </div>
                                </div>

                                <details>
                                    <summary style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', cursor: 'pointer', outline: 'none' }}>
                                        Pegar matriz desde Excel (Avanzado)
                                    </summary>
                                    <div style={{ marginTop: 8 }}>
                                        <textarea
                                            value={trigger.tableRawData || ''}
                                            onChange={(e) => onUpdate({ tableRawData: e.target.value })}
                                            placeholder="Columna 1&#9;Columna 2&#10;Dato 1&#9;Dato 2"
                                            style={{
                                                width: '100%', height: 80, background: 'var(--color-control)',
                                                border: '1px solid var(--color-border)', borderRadius: 6,
                                                padding: '8px 10px', fontSize: 11, color: 'var(--color-text-primary)',
                                                resize: 'vertical', outline: 'none', whiteSpace: 'pre'
                                            }}
                                        />
                                        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                                            Copia un rango de celdas y pégalo. Sobrescribirá el diseño actual.
                                        </div>
                                    </div>
                                </details>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div>
                                        <FieldLabel>Ancho de Celda (%)</FieldLabel>
                                        <NumericInput
                                            value={trigger.cellWidth !== undefined ? trigger.cellWidth : 33}
                                            onChange={val => onUpdate({ cellWidth: val })}
                                            min={5} max={200} step={0.1}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Alto de Celda (%)</FieldLabel>
                                        <NumericInput
                                            value={trigger.cellHeight !== undefined ? trigger.cellHeight : 25}
                                            onChange={val => onUpdate({ cellHeight: val })}
                                            min={5} max={200} step={0.1}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div>
                                        <FieldLabel>Fondo Cabecera</FieldLabel>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input type="color" value={trigger.headerBg || '#1E293B'} onChange={e => onUpdate({ headerBg: e.target.value })} style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }} />
                                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{trigger.headerBg || '#1E293B'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <FieldLabel>Color Texto</FieldLabel>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input type="color" value={trigger.textColor || '#E2E8F0'} onChange={e => onUpdate({ textColor: e.target.value })} style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }} />
                                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{trigger.textColor || '#E2E8F0'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <FieldLabel>Fondo Filas Alternas</FieldLabel>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input type="color" value={trigger.stripeBg || '#0F172A'} onChange={e => onUpdate({ stripeBg: e.target.value })} style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }} />
                                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{trigger.stripeBg || '#0F172A'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <FieldLabel>Color Borde</FieldLabel>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input type="color" value={trigger.borderColor || '#334155'} onChange={e => onUpdate({ borderColor: e.target.value })} style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }} />
                                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{trigger.borderColor || '#334155'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginTop: 4 }}>
                                        <input
                                            type="checkbox"
                                            checked={trigger.hasHeader !== false}
                                            onChange={(e) => onUpdate({ hasHeader: e.target.checked })}
                                            style={{ accentColor: 'var(--color-brand)' }}
                                        />
                                        <span style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>Primera fila es cabecera</span>
                                    </label>
                                </div>
                            </div>
                        );
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

export function AddBtn({ onClick, icon: Icon, label, color }) {
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
