import React, { memo, useRef } from 'react'
import { Handle, Position } from 'reactflow'
import { Monitor, ImageOff } from 'lucide-react'

const ScreenNode = memo(({ data, selected }) => {
    const { label, image, hotspot } = data

    return (
        <div
            className={`screen-node relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer
        ${selected
                    ? 'ring-2 ring-purple-500 shadow-[0_0_24px_rgba(110,64,201,0.5)]'
                    : 'ring-1 ring-[#30363d] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
                }
      `}
            style={{ width: 280, background: '#161b22' }}
        >
            {/* Header bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#30363d] bg-[#0d1117]">
                <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <Monitor size={12} className="text-[#6e40c9] ml-1" />
                <span className="text-[11px] font-medium text-[#8b949e] truncate flex-1">
                    {label || 'Pantalla sin nombre'}
                </span>
            </div>

            {/* Image area */}
            <div className="relative" style={{ height: 180 }}>
                {image ? (
                    <img
                        src={image}
                        alt="Screen"
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1117] gap-2">
                        <ImageOff size={28} className="text-[#484f58]" />
                        <span className="text-[11px] text-[#484f58]">Sin imagen</span>
                    </div>
                )}

                {/* Hotspot overlay (editor hint) */}
                {hotspot && image && (
                    <div
                        className="absolute border-2 border-dashed border-violet-400/70 bg-violet-500/10 rounded"
                        style={{
                            left: `${hotspot.x}%`,
                            top: `${hotspot.y}%`,
                            width: `${hotspot.w}%`,
                            height: `${hotspot.h}%`,
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 flex items-center justify-between border-t border-[#30363d]">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${data.triggerType === 'input'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-violet-500/15 text-violet-400'
                    }`}>
                    {data.triggerType === 'input' ? '⌨ Input' : '🖱 Click'}
                </span>
                <span className="text-[10px] text-[#484f58]">Screen Node</span>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                style={{
                    width: 12,
                    height: 12,
                    background: '#6e40c9',
                    border: '2px solid #8b5cf6',
                    borderRadius: '50%',
                    left: -6
                }}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    width: 12,
                    height: 12,
                    background: '#6e40c9',
                    border: '2px solid #8b5cf6',
                    borderRadius: '50%',
                    right: -6
                }}
            />
        </div>
    )
})

export default ScreenNode
