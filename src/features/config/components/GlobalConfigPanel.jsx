import React from 'react'
import { Settings, Clock, Image as ImageIcon, PaintBucket, Maximize, RefreshCw } from 'lucide-react'
import { FieldLabel } from '../../../shared/components/FieldLabel'
import { Divider } from '../../../shared/components/Divider'
import { NumericInput } from '../../../shared/components/NumericInput'

export default function GlobalConfigPanel({ config, onUpdate, nodes, edges }) {

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                onUpdate({ bgType: 'image', bgValue: event.target.result })
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div style={{
            height: '100%', overflowY: 'auto', padding: 16,
            display: 'flex', flexDirection: 'column', gap: 20
        }}>

            {/* Temporizador */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <Clock size={16} color="var(--color-brand)" />
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                        Temporizador Global
                    </h3>
                </div>

                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
                    El tiempo que los usuarios tienen para completar pantallas interactivas antes de que se agote y salte error. Déjalo en blanco si no quieres temporizador.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <NumericInput
                        label="Mínimo (seg)"
                        placeholder="Ej: 5"
                        value={config.timerMin}
                        onChange={e => onUpdate({ timerMin: e.target.value === '' ? '' : parseInt(e.target.value) })}
                        min={0} step="1" suffix="s"
                    />
                    <NumericInput
                        label="Máximo (seg)"
                        placeholder="Ej: 30"
                        value={config.timerMax}
                        onChange={e => onUpdate({ timerMax: e.target.value === '' ? '' : parseInt(e.target.value) })}
                        min={0} step="1" suffix="s"
                    />
                </div>
            </div>

            <Divider margin="16px 0" />

            {/* Fondo */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <Maximize size={16} color="var(--color-brand)" />
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                        Fondo del Simulador
                    </h3>
                </div>

                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
                    Define el fondo que se mostrará en los espacios vacíos cuando la imagen de una pantalla no ocupa el 100% de la ventana.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Tipo de Fondo */}
                    <div style={{ display: 'flex', background: 'var(--color-control)', borderRadius: 6, pading: 2, border: '1px solid var(--color-border)' }}>
                        {[
                            { id: 'color', label: 'Color Sólido', icon: PaintBucket },
                            { id: 'image', label: 'Imagen Cover', icon: ImageIcon },
                            { id: 'transparent', label: 'Transparente', icon: Maximize }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => onUpdate({ bgType: opt.id })}
                                style={{
                                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                    padding: '8px 4px', border: 'none', background: config.bgType === opt.id ? 'var(--color-raised)' : 'transparent',
                                    color: config.bgType === opt.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                                    fontSize: 9, fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer',
                                    borderRadius: 4, transition: 'all 150ms'
                                }}
                            >
                                <opt.icon size={14} color={config.bgType === opt.id ? 'var(--color-brand)' : 'currentColor'} />
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Selector de Color */}
                    {config.bgType === 'color' && (
                        <div>
                            <FieldLabel>Color Hexadecimal</FieldLabel>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="color"
                                    value={config.bgValue || '#0a0d12'}
                                    onChange={e => onUpdate({ bgValue: e.target.value })}
                                    style={{
                                        width: 36, height: 36, padding: 0, border: '1px solid var(--color-border)',
                                        borderRadius: 6, cursor: 'pointer', background: 'var(--color-control)'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={config.bgValue || '#0a0d12'}
                                    onChange={e => onUpdate({ bgValue: e.target.value })}
                                    placeholder="#0a0d12"
                                    style={{
                                        flex: 1, background: 'var(--color-control)', border: '1px solid var(--color-border)',
                                        borderRadius: 6, padding: '0 10px', fontSize: 12, fontFamily: 'monospace',
                                        color: 'var(--color-text-primary)', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Selector de Imagen */}
                    {config.bgType === 'image' && (
                        <div>
                            <FieldLabel>Imagen de Fondo</FieldLabel>
                            {config.bgValue && config.bgValue.length > 20 ? (
                                <div style={{
                                    position: 'relative', width: '100%', height: 100, borderRadius: 6,
                                    border: '1px solid var(--color-border)', overflow: 'hidden',
                                    background: `url(${config.bgValue}) center/cover no-repeat`
                                }}>
                                    <button
                                        onClick={() => onUpdate({ bgValue: '' })}
                                        style={{
                                            position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)',
                                            color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px',
                                            fontSize: 10, cursor: 'pointer'
                                        }}
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="file" accept="image/*" id="global-bg-upload"
                                        onChange={handleImageUpload} style={{ display: 'none' }}
                                    />
                                    <label htmlFor="global-bg-upload" style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        width: '100%', padding: '12px', background: 'var(--color-control)',
                                        border: '1px dashed var(--color-border-strong)', borderRadius: 6,
                                        color: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 500, cursor: 'pointer'
                                    }}>
                                        <ImageIcon size={14} /> Subir Imagen
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    {config.bgType === 'transparent' && (
                        <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px dashed var(--color-border)' }}>
                            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
                                Se utilizará un fondo transparente o el que provea el contenedor origen.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Divider margin="16px 0" />

            {/* Efectos de Transición */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <RefreshCw size={16} color="var(--color-brand)" />
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                        Transición entre Pantallas
                    </h3>
                </div>

                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
                    Elige la animación que se reproducirá visualmente al saltar de una pantalla interactiva a otra.
                </p>

                <div>
                    <select
                        value={config.transitionEffect || 'fade'}
                        onChange={e => onUpdate({ transitionEffect: e.target.value })}
                        style={{
                            width: '100%',
                            background: 'var(--color-control)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 6, padding: '8px 12px',
                            fontSize: 12, color: 'var(--color-text-primary)', outline: 'none',
                            cursor: 'pointer', appearance: 'none',
                            transition: 'border-color 150ms ease-out',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--color-brand)'}
                        onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                    >
                        <option value="none" style={{ background: '#111', color: '#eee' }}>Sin Transición (Corte directo)</option>
                        <option value="fade" style={{ background: '#111', color: '#eee' }}>Desvanecer (Fade)</option>
                        <option value="zoom" style={{ background: '#111', color: '#eee' }}>Acercar Suavemente (Zoom & Fade)</option>
                        <option value="slide-left" style={{ background: '#111', color: '#eee' }}>Deslizar a la Izquierda</option>
                        <option value="slide-right" style={{ background: '#111', color: '#eee' }}>Deslizar a la Derecha</option>
                        <option value="slide-up" style={{ background: '#111', color: '#eee' }}>Deslizar hacia Arriba</option>
                    </select>
                </div>
            </div>

        </div>
    )
}
