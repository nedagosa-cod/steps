import React, { useRef, useState } from 'react'
import { Upload, MousePointer, Keyboard, Info, Image } from 'lucide-react'

const Label = ({ children }) => (
    <label className="text-[11px] font-medium text-[#8b949e] uppercase tracking-wider mb-1 block">
        {children}
    </label>
)

const SectionTitle = ({ children }) => (
    <h3 className="text-xs font-semibold text-[#6e40c9] uppercase tracking-widest mb-3 flex items-center gap-2">
        <span className="flex-1 h-px bg-[#30363d]" />
        {children}
        <span className="flex-1 h-px bg-[#30363d]" />
    </h3>
)

export default function NodeConfigPanel({ node, onUpdateNode }) {
    const fileInputRef = useRef(null)

    if (!node) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#21262d] flex items-center justify-center">
                    <Info size={24} className="text-[#484f58]" />
                </div>
                <p className="text-sm text-[#8b949e] leading-relaxed">
                    Selecciona un nodo en el canvas para configurarlo
                </p>
            </div>
        )
    }

    const { data } = node
    const update = (patch) => onUpdateNode(node.id, patch)

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => update({ image: ev.target.result })
        reader.readAsDataURL(file)
    }

    return (
        <div className="flex flex-col gap-5 p-4 h-full overflow-y-auto">
            {/* Node name */}
            <div>
                <Label>Nombre del nodo</Label>
                <input
                    type="text"
                    value={data.label || ''}
                    onChange={(e) => update({ label: e.target.value })}
                    placeholder="Ej: Pantalla de Login"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#6e40c9] transition-colors"
                />
            </div>

            {/* Image upload */}
            <div>
                <SectionTitle>Imagen</SectionTitle>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                />
                {data.image ? (
                    <div className="relative rounded-lg overflow-hidden border border-[#30363d] group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <img src={data.image} alt="preview" className="w-full h-36 object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Image size={16} className="text-white" />
                            <span className="text-white text-xs font-medium">Cambiar imagen</span>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-28 border-2 border-dashed border-[#30363d] rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#6e40c9] hover:bg-[#6e40c9]/5 transition-all group"
                    >
                        <Upload size={20} className="text-[#484f58] group-hover:text-[#6e40c9] transition-colors" />
                        <span className="text-xs text-[#484f58] group-hover:text-[#8b949e]">Subir imagen del sistema</span>
                    </button>
                )}
            </div>

            {/* Trigger type */}
            <div>
                <SectionTitle>Tipo de trigger</SectionTitle>
                <div className="flex gap-2">
                    {[
                        { value: 'click', icon: MousePointer, label: 'Click' },
                        { value: 'input', icon: Keyboard, label: 'Input' },
                    ].map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            onClick={() => update({ triggerType: value })}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${data.triggerType === value
                                    ? 'border-[#6e40c9] bg-[#6e40c9]/15 text-[#a78bfa]'
                                    : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#484f58]'
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Validation value (only for input) */}
            {data.triggerType === 'input' && (
                <div>
                    <Label>Texto de validación</Label>
                    <input
                        type="text"
                        value={data.validationValue || ''}
                        onChange={(e) => update({ validationValue: e.target.value })}
                        placeholder="Ej: admin@empresa.com"
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#6e40c9] transition-colors"
                    />
                    <p className="text-[11px] text-[#484f58] mt-1.5">El usuario debe escribir este texto exacto para avanzar.</p>
                </div>
            )}

            {/* Hotspot config */}
            {data.triggerType === 'click' && (
                <div>
                    <SectionTitle>Hotspot (% del ancho/alto)</SectionTitle>
                    <div className="grid grid-cols-2 gap-2">
                        {['x', 'y', 'w', 'h'].map((key) => (
                            <div key={key}>
                                <Label>{key === 'x' ? 'X (left)' : key === 'y' ? 'Y (top)' : key === 'w' ? 'Ancho' : 'Alto'}</Label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={data.hotspot?.[key] ?? (key === 'w' || key === 'h' ? 20 : 40)}
                                        onChange={(e) =>
                                            update({
                                                hotspot: {
                                                    x: 40, y: 40, w: 20, h: 20,
                                                    ...(data.hotspot || {}),
                                                    [key]: parseFloat(e.target.value) || 0,
                                                },
                                            })
                                        }
                                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 pr-6 text-sm text-[#e6edf3] focus:outline-none focus:border-[#6e40c9] transition-colors"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#484f58]">%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[11px] text-[#484f58] mt-2">Define el área clickeable sobre la imagen en modo preview.</p>
                </div>
            )}
        </div>
    )
}
