import React, { useState, useCallback, useRef } from 'react'
import { X, MousePointer, Keyboard, ChevronRight, AlertCircle } from 'lucide-react'

export default function PreviewMode({ nodes, edges, onExit }) {
    const startNode = nodes.find(n => !edges.some(e => e.target === n.id)) || nodes[0]
    const [currentNodeId, setCurrentNodeId] = useState(startNode?.id)
    const [inputValue, setInputValue] = useState('')
    const [error, setError] = useState('')
    const [isTransitioning, setIsTransitioning] = useState(false)
    const inputRef = useRef(null)

    const currentNode = nodes.find(n => n.id === currentNodeId)

    const navigate = useCallback((targetId) => {
        setIsTransitioning(true)
        setError('')
        setInputValue('')
        setTimeout(() => {
            setCurrentNodeId(targetId)
            setIsTransitioning(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        }, 350)
    }, [])

    const getNextNodeId = useCallback(() => {
        const edge = edges.find(e => e.source === currentNodeId)
        return edge?.target
    }, [currentNodeId, edges])

    const handleHotspotClick = () => {
        const nextId = getNextNodeId()
        if (nextId) navigate(nextId)
        else setError('Este es el último paso del simulador.')
    }

    const handleInputSubmit = () => {
        const { data } = currentNode
        if (!data.validationValue || inputValue.trim() === data.validationValue.trim()) {
            const nextId = getNextNodeId()
            if (nextId) navigate(nextId)
            else setError('¡Simulación completada! 🎉')
        } else {
            setError('Texto incorrecto. Intenta de nuevo.')
            setTimeout(() => setError(''), 2000)
        }
    }

    if (!currentNode) {
        return (
            <div className="fixed inset-0 bg-[#0d1117] z-50 flex items-center justify-center">
                <p className="text-[#8b949e]">No hay nodos en el simulador.</p>
            </div>
        )
    }

    const { data } = currentNode
    const hotspot = data.hotspot || { x: 40, y: 40, w: 20, h: 20 }

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#6e40c9]">Preview</span>
                    <span className="text-sm text-[#8b949e]">—</span>
                    <span className="text-sm text-[#e6edf3]">{data.label || 'Pantalla'}</span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Steps indicator */}
                    <div className="flex gap-1.5">
                        {nodes.map(n => (
                            <div
                                key={n.id}
                                className={`h-1.5 rounded-full transition-all duration-300 ${n.id === currentNodeId ? 'w-6 bg-[#6e40c9]' : 'w-1.5 bg-[#30363d]'
                                    }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={onExit}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8b949e] bg-[#21262d] border border-[#30363d] hover:text-[#e6edf3] hover:border-[#484f58] transition-all"
                    >
                        <X size={13} />
                        Salir
                    </button>
                </div>
            </div>

            {/* Main preview */}
            <div
                className={`relative rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-all duration-350 ${isTransitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
                    }`}
                style={{ maxWidth: 900, width: '90vw', maxHeight: '75vh' }}
            >
                {data.image ? (
                    <div className="relative">
                        <img
                            src={data.image}
                            alt="simulator screen"
                            className="w-full h-auto block"
                            draggable={false}
                            style={{ maxHeight: '75vh', objectFit: 'contain' }}
                        />

                        {/* Hotspot click area */}
                        {data.triggerType === 'click' && (
                            <button
                                onClick={handleHotspotClick}
                                className="absolute group"
                                style={{
                                    left: `${hotspot.x}%`,
                                    top: `${hotspot.y}%`,
                                    width: `${hotspot.w}%`,
                                    height: `${hotspot.h}%`,
                                }}
                            >
                                <span className="absolute inset-0 rounded bg-violet-500/20 border-2 border-violet-400/50 group-hover:bg-violet-500/35 group-hover:border-violet-400 transition-all animate-pulse group-hover:animate-none" />
                                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MousePointer size={18} className="text-violet-300 drop-shadow" />
                                </span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-full flex items-center justify-center bg-[#161b22] rounded-2xl" style={{ height: 400 }}>
                        <span className="text-[#484f58]">Sin imagen en este nodo</span>
                    </div>
                )}
            </div>

            {/* Input trigger UI */}
            {data.triggerType === 'input' && (
                <div className={`mt-6 flex gap-2 transition-all duration-350 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => { setInputValue(e.target.value); setError('') }}
                        onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                        placeholder={data.validationValue ? `Escribe: "${data.validationValue}"` : 'Escribe tu respuesta…'}
                        className="bg-[#21262d] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#6e40c9] w-72 transition-colors"
                    />
                    <button
                        onClick={handleInputSubmit}
                        className="px-4 py-2.5 bg-[#6e40c9] hover:bg-[#7c3aed] text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Error / info message */}
            {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
        </div>
    )
}
