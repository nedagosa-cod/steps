import React, { useRef, useState, useEffect } from 'react'
import { TRIGGER_COLORS, TRIGGER_LABELS } from '../../../shared/utils/triggers'

export function InteractiveTrigger({ trigger, index, onUpdate, containerRef }) {
    const hs = trigger.hotspot || { x: 40, y: 40, w: 20, h: 10 }
    const colors = TRIGGER_COLORS[trigger.type] || TRIGGER_COLORS.click

    const [localHs, setLocalHs] = useState(hs)
    const localHsRef = useRef(hs)
    const actionRef = useRef(null) // 'drag' | 'resize' | null

    useEffect(() => {
        if (!actionRef.current) {
            setLocalHs(hs)
            localHsRef.current = hs
        }
    }, [hs])

    const onPointerDown = (e, type) => {
        e.stopPropagation()
        e.preventDefault() // prevent native image dragging if clicked
        if (!containerRef.current) return

        actionRef.current = type
        const rect = containerRef.current.getBoundingClientRect()
        const startX = e.clientX
        const startY = e.clientY
        const startHs = { ...localHsRef.current }

        const onPointerMove = (ev) => {
            const dx = ev.clientX - startX
            const dy = ev.clientY - startY
            const dpX = parseFloat(((dx / rect.width) * 100).toFixed(2))
            const dpY = parseFloat(((dy / rect.height) * 100).toFixed(2))

            let nextHs = { ...startHs }

            if (type === 'resize') {
                nextHs.w = Math.max(2, startHs.w + dpX)
                nextHs.h = Math.max(2, startHs.h + dpY)
            } else {
                nextHs.x = Math.min(100 - startHs.w, Math.max(0, startHs.x + dpX))
                nextHs.y = Math.min(100 - startHs.h, Math.max(0, startHs.y + dpY))
            }

            setLocalHs(nextHs)
            localHsRef.current = nextHs
        }

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
            actionRef.current = null
            onUpdate({ hotspot: localHsRef.current })
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
    }

    return (
        <div
            onPointerDown={e => onPointerDown(e, 'drag')}
            style={{
                position: 'absolute',
                left: `${localHs.x}%`, top: `${localHs.y}%`,
                width: `${localHs.w}%`, height: `${localHs.h}%`,
                border: `1.5px dashed ${colors.border}`,
                background: colors.bg,
                borderRadius: 3,
                cursor: 'move',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: actionRef.current ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
                zIndex: actionRef.current ? 10 : 1, // bring to front while interacting
            }}
        >
            {/* The label */}
            <span style={{
                fontSize: 10, fontWeight: 700, color: colors.label,
                background: 'rgba(10,13,18,0.7)',
                borderRadius: 3, padding: '2px 6px', lineHeight: 1.2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                pointerEvents: 'none', // ignore mouse on text
            }}>
                {index + 1} · {TRIGGER_LABELS[trigger.type]}
            </span>

            {/* The resize handle bottom-right */}
            <div
                onPointerDown={e => onPointerDown(e, 'resize')}
                style={{
                    position: 'absolute', right: -4, bottom: -4,
                    width: 14, height: 14, background: colors.label,
                    border: '2px solid #fff', borderRadius: '50%',
                    cursor: 'se-resize',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
            />
        </div>
    )
}
