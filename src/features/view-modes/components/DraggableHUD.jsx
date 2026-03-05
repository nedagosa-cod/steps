import React, { useState, useRef } from 'react'
import { GripHorizontal } from 'lucide-react'

export function DraggableHUD({ children }) {
    const [pos, setPos] = useState({ x: 24, y: 24 })
    const isDragging = useRef(false)
    const dragStart = useRef({ x: 0, y: 0 })
    const initialPos = useRef({ x: 0, y: 0 })

    const onPointerDown = (e) => {
        isDragging.current = true
        dragStart.current = { x: e.clientX, y: e.clientY }
        initialPos.current = { ...pos }

        const onPointerMove = (ev) => {
            if (!isDragging.current) return
            const dx = ev.clientX - dragStart.current.x
            const dy = ev.clientY - dragStart.current.y

            setPos({
                x: Math.max(0, Math.min(window.innerWidth - 200, initialPos.current.x + dx)),
                y: Math.max(0, Math.min(window.innerHeight - 50, initialPos.current.y + dy))
            })
        }

        const onPointerUp = () => {
            isDragging.current = false
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
    }

    return (
        <div style={{
            position: 'absolute',
            left: pos.x, top: pos.y,
            zIndex: 100,
            display: 'flex', flexDirection: 'column', gap: 8,
            minWidth: 260,
            pointerEvents: 'none',
        }}>
            <div style={{
                background: 'rgba(10,13,18,0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset',
                padding: '12px 16px',
                pointerEvents: 'auto',
                display: 'flex', flexDirection: 'column',
            }}>
                <div
                    onPointerDown={onPointerDown}
                    style={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        height: 16, cursor: 'grab', color: 'var(--color-text-tertiary)',
                        marginBottom: 10, marginTop: -6,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
                >
                    <GripHorizontal size={14} />
                </div>
                {children}
            </div>
        </div>
    )
}
