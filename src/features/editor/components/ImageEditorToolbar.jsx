import React from 'react'
import { Save, Type, Square, Circle, PenTool, Trash2, Maximize2, Minimize2, Undo2, Redo2, Pipette, Crop, Check, Droplet, SquareDashedBottom } from 'lucide-react'

export function ToolBtn({ icon, title, active, onClick, disabled, style }) {
    return (
        <button
            title={title}
            onClick={onClick}
            disabled={disabled}
            style={{
                width: 32, height: 32, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: '1px solid',
                borderColor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: active ? 'white' : 'var(--color-text-secondary)',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.3 : 1,
                ...style
            }}
            onMouseEnter={e => { if (!active && !disabled) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--color-text-primary)' } }}
            onMouseLeave={e => { if (!active && !disabled) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)' } }}
        >
            {icon}
        </button>
    )
}

export function ImageEditorToolbar({
    state: { activeTool, color, fillColor, isFillMode, blurIntensity, isFullscreen, historyIndex, historyLen },
    actions: { setActiveTool, setColor, setFillColor, setIsFillMode, setBlurIntensity, handleUndo, handleRedo, handleClear, addText, addRect, addCircle, applyCrop, openEyeDropper, toggleFullscreen, generateExportImage },
    onSave,
    onCancel
}) {
    const COLORS = ['#ffffff', '#000000', '#ff3b30', '#ff9500', '#ffcc00', '#4cd964', '#5ac8fa', '#007aff', '#5856d6', 'transparent']

    const handleSaveClick = () => {
        const dataUrl = generateExportImage()
        if (dataUrl) onSave(dataUrl)
    }

    return (
        <div style={{
            height: 60, flexShrink: 0, borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px'
        }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>✏️ Editor de Imagen</span>

                <div style={{ width: 1, height: 24, background: 'var(--color-border)' }} />

                {/* Tools */}
                <div style={{ display: 'flex', gap: 4 }}>
                    <ToolBtn active={activeTool === 'select'} onClick={() => setActiveTool('select')} icon={<Maximize2 size={16} />} title="Seleccionar/Mover" />
                    <ToolBtn active={activeTool === 'draw'} onClick={() => setActiveTool('draw')} icon={<PenTool size={16} />} title="Dibujar libremente" />
                    <ToolBtn onClick={addText} icon={<Type size={16} />} title="Agregar texto" />
                    <ToolBtn onClick={() => addRect(false)} icon={<Square size={16} />} title="Agregar cuadrado" />
                    <ToolBtn onClick={addCircle} icon={<Circle size={16} />} title="Agregar círculo" />
                    <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 4px' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ToolBtn active={activeTool === 'blur_brush'} onClick={() => setActiveTool('blur_brush')} icon={<Droplet size={16} />} title="Pincel para Desenfocar" style={{ color: activeTool === 'blur_brush' ? 'white' : '#5ac8fa' }} />
                        <ToolBtn onClick={() => addRect(true)} icon={<SquareDashedBottom size={16} />} title="Recuadro de Desenfoque" style={{ color: '#5ac8fa' }} />
                        {/* Blur Intensity Slider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 8, marginLeft: 2 }}>
                            <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Nivel: {blurIntensity}</span>
                            <input
                                type="range"
                                min="2" max="40" step="1"
                                value={blurIntensity}
                                onChange={e => setBlurIntensity(parseInt(e.target.value))}
                                style={{ width: 60, cursor: 'pointer', accentColor: '#5ac8fa' }}
                                title="Intensidad del desenfoque"
                            />
                        </div>
                    </div>

                    <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 4px' }} />

                    <ToolBtn
                        active={activeTool === 'crop'}
                        onClick={() => setActiveTool(activeTool === 'crop' ? 'select' : 'crop')}
                        icon={<Crop size={16} />}
                        title="Recortar imagen"
                    />
                    {activeTool === 'crop' && (
                        <button
                            onClick={applyCrop}
                            title="Aplicar recorte"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '0 10px', height: 32, borderRadius: 6,
                                background: 'var(--color-brand)', color: 'white',
                                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                                marginLeft: 6
                            }}
                        >
                            <Check size={14} /> Aplicar
                        </button>
                    )}
                </div>

                <div style={{ width: 1, height: 24, background: 'var(--color-border)' }} />

                {/* Colors & Fill Mode */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {/* Fill / Stroke Selector */}
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 2, marginRight: 8 }}>
                        <button
                            onClick={() => setIsFillMode(false)}
                            title="Editar color del borde"
                            style={{
                                padding: '4px 8px', fontSize: 11, border: 'none', background: !isFillMode ? 'var(--color-surface)' : 'transparent',
                                color: !isFillMode ? 'white' : 'var(--color-text-secondary)', borderRadius: 10, cursor: 'pointer',
                                fontWeight: !isFillMode ? 600 : 400
                            }}
                        >Borde</button>
                        <button
                            onClick={() => setIsFillMode(true)}
                            title="Editar color de fondo"
                            style={{
                                padding: '4px 8px', fontSize: 11, border: 'none', background: isFillMode ? 'var(--color-surface)' : 'transparent',
                                color: isFillMode ? 'white' : 'var(--color-text-secondary)', borderRadius: 10, cursor: 'pointer',
                                fontWeight: isFillMode ? 600 : 400
                            }}
                        >Fondo</button>
                    </div>

                    {COLORS.map(c => {
                        const isSelected = isFillMode ? fillColor === c : color === c
                        return (
                            <button
                                key={c}
                                onClick={() => isFillMode ? setFillColor(c) : setColor(c)}
                                style={{
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: c === 'transparent' ? 'repeating-linear-gradient(45deg, transparent, transparent 4px, #ff3b30 4px, #ff3b30 6px)' : c,
                                    border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                                    cursor: 'pointer', outline: isSelected ? '2px solid var(--color-brand)' : 'none',
                                    outlineOffset: 1
                                }}
                                title={c === 'transparent' ? 'Transparente' : c}
                            />
                        )
                    })}
                    <button
                        onClick={openEyeDropper}
                        title="Cuentagotas (Seleccionar color de pantalla)"
                        style={{
                            width: 24, height: 24, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'var(--color-text-secondary)', cursor: 'pointer',
                            marginLeft: 4
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                    >
                        <Pipette size={14} />
                    </button>
                </div>

                <div style={{ width: 1, height: 24, background: 'var(--color-border)' }} />

                {/* History */}
                <div style={{ display: 'flex', gap: 4 }}>
                    <ToolBtn onClick={handleUndo} disabled={historyIndex <= 0} icon={<Undo2 size={16} />} title="Deshacer" />
                    <ToolBtn onClick={handleRedo} disabled={historyIndex >= historyLen - 1} icon={<Redo2 size={16} />} title="Rehacer" />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <ToolBtn onClick={handleClear} icon={<Trash2 size={16} />} title="Limpiar lienzo" style={{ color: '#ff3b30' }} />
                <ToolBtn onClick={toggleFullscreen} icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />} title="Pantalla completa" />

                <button onClick={onCancel} style={{
                    padding: '6px 14px', borderRadius: 6,
                    background: 'transparent', border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer'
                }}>Cancelar</button>

                <button onClick={handleSaveClick} style={{
                    padding: '6px 14px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--color-brand)', border: 'none', fontWeight: 600,
                    color: 'white', fontSize: 13, cursor: 'pointer'
                }}>
                    <Save size={14} /> Aplicar
                </button>
            </div>
        </div>
    )
}
