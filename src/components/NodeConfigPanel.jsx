import React, { useRef } from 'react'
import { Upload, MousePointer, Keyboard, Info, Image, Trash2 } from 'lucide-react'
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

const NumericInput = ({ value, onChange, label, accentColor }) => (
    <div>
        <FieldLabel>{label}</FieldLabel>
        <div style={{ position: 'relative' }}>
            <input
                type="number" min={0} max={100}
                value={value}
                onChange={onChange}
                style={{
                    width: '100%',
                    background: 'var(--color-control)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6, padding: '5px 20px 5px 8px',
                    fontSize: 12, fontVariantNumeric: 'tabular-nums',
                    color: 'var(--color-text-primary)', outline: 'none',
                    transition: 'border-color 150ms ease-out',
                }}
                onFocus={e => e.target.style.borderColor = accentColor || 'var(--color-border-strong)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
            <span style={{
                position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
                fontSize: 9, color: 'var(--color-text-muted)', pointerEvents: 'none',
            }}>%</span>
        </div>
    </div>
)

/* ── TriggerCard ── */
function TriggerCard({ trigger, index, allTriggers, onUpdate, onDelete }) {
    const hs = trigger.hotspot || { x: 30, y: 40, w: 20, h: 10 }
    const colors = TRIGGER_COLORS[trigger.type] || TRIGGER_COLORS.click
    const setHotspot = (key, val) =>
        onUpdate({ hotspot: { ...hs, [key]: parseFloat(val) || 0 } })

    return (
        <div style={{
            border: `1px solid ${colors.border}`,
            borderRadius: 8, overflow: 'hidden',
            background: 'var(--color-control)',
        }}>
            {/* Card header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 8px',
                background: colors.bg,
                borderBottom: `1px solid ${colors.border}`,
            }}>
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
                <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                    {[
                        { value: 'click', icon: MousePointer, label: 'Click' },
                        { value: 'input', icon: Keyboard, label: 'Input' },
                    ].map(({ value, icon: Icon, label }) => {
                        const active = trigger.type === value
                        const c = TRIGGER_COLORS[value]
                        return (
                            <button
                                key={value}
                                onClick={() => onUpdate({ type: value })}
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

            {/* Card body */}
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
                    <div>
                        <FieldLabel>Texto de validación</FieldLabel>
                        <TextInput
                            value={trigger.validationValue || ''}
                            onChange={e => onUpdate({ validationValue: e.target.value })}
                            placeholder="Texto exacto requerido"
                            mono
                        />
                    </div>
                )}

                {/* Dependency */}
                {allTriggers.length > 1 && (
                    <div>
                        <FieldLabel>Depende de (Opcional)</FieldLabel>
                        <select
                            value={trigger.dependsOn || ''}
                            onChange={e => onUpdate({ dependsOn: e.target.value || null })}
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
                            <option value="">(Ninguno)</option>
                            {allTriggers.filter(t => t.id !== trigger.id).map(t => {
                                const tIndex = allTriggers.findIndex(x => x.id === t.id) + 1
                                return (
                                    <option key={t.id} value={t.id}>
                                        Paso {tIndex} ({TRIGGER_LABELS[t.type] || t.type})
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ── Main component ── */
export default function NodeConfigPanel({ node, onUpdateNode }) {
    const fileInputRef = useRef(null)

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
                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        position: 'relative', borderRadius: 7, overflow: 'hidden',
                        border: '1px solid var(--color-border)', cursor: 'pointer',
                        display: 'block', width: '100%', background: 'none', padding: 0,
                    }}
                >
                    <img src={data.image} alt="preview" style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
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
                    {triggers.map((trigger, idx) => (
                        <React.Fragment key={trigger.id}>
                            <TriggerCard
                                trigger={trigger}
                                index={idx}
                                allTriggers={triggers}
                                onUpdate={patch => updateTrigger(idx, patch)}
                                onDelete={() => deleteTrigger(idx)}
                            />
                            {idx < triggers.length - 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
                                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>LUEGO</span>
                                    <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {triggers.length === 0 && (
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', padding: '2px 0' }}>
                    Sin triggers — añade uno abajo
                </p>
            )}

            {/* Add trigger buttons */}
            <div style={{ display: 'flex', gap: 6 }}>
                <AddBtn onClick={() => addTrigger('click')} icon={MousePointer} label="+ Click" color={TRIGGER_COLORS.click.label} />
                <AddBtn onClick={() => addTrigger('input')} icon={Keyboard} label="+ Input" color={TRIGGER_COLORS.input.label} />
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
