import React, { useRef, useState, useEffect } from 'react'
import { TRIGGER_COLORS, TRIGGER_LABELS } from '../../../shared/utils/triggers'

export function InteractiveTrigger({ trigger, index, onUpdate, containerRef, innerRef, children }) {
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
        // Only prevent default if we are not clicking inside the container content
        if (trigger.type !== 'scroll_area' && trigger.type !== 'floating_window') {
            e.preventDefault()
        }
        if (!containerRef.current) return

        actionRef.current = type
        document.body.style.userSelect = 'none'

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
            document.body.style.userSelect = ''
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
                overflowY: trigger.type === 'scroll_area' ? 'auto' : (trigger.type === 'floating_window' ? 'hidden' : 'visible'),
                overflowX: trigger.type === 'scroll_area' ? 'hidden' : (trigger.type === 'floating_window' ? 'hidden' : 'visible'),
            }}
        >
            {(trigger.type === 'scroll_area' || trigger.type === 'floating_window') && (
                <div
                    ref={innerRef}
                    style={{ position: 'relative', width: '100%', height: trigger.type === 'floating_window' ? '100%' : 'auto', minHeight: '100%' }}
                    onPointerDown={e => e.stopPropagation()} // Let children handle their own clicks/drags, don't drag the parent
                >
                    {trigger.contentImage ? (
                        <img src={trigger.contentImage} alt="Contenido" style={{ width: '100%', height: trigger.type === 'floating_window' ? '100%' : 'auto', objectFit: trigger.type === 'floating_window' ? 'cover' : 'fill', display: 'block', pointerEvents: 'none', userSelect: 'none' }} draggable={false} />
                    ) : (
                        <div style={{ padding: 10, textAlign: 'center', color: colors.label, fontSize: 11, background: 'rgba(10,13,18,0.8)', minHeight: '100%', userSelect: 'none' }}>
                            [{TRIGGER_LABELS[trigger.type]} sin imagen]
                        </div>
                    )}

                    {/* Renderizar hijos proporcionados por FocusMode */}
                    {children}
                </div>
            )}

            {/* RENDERING DE LA TABLA ESTÁTICA */}
            {trigger.type === 'table_grid' && (() => {
                const rawData = trigger.tableRawData || '';
                const rows = rawData.split('\n').filter(r => r.trim() !== '');
                const maxCols = Math.max(...rows.map(r => r.split('\t').length), 1);

                return (
                    <div style={{
                        width: '100%', height: '100%',
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.max(...(trigger.tableRawData || '').split('\n').filter(r => r.trim()).map(r => r.split('\t').length), 1)}, ${trigger.cellWidth !== undefined ? trigger.cellWidth : 33}%)`,
                        gridAutoRows: `${trigger.cellHeight !== undefined ? trigger.cellHeight : 25}%`,
                        fontSize: `clamp(4px, ${trigger.fontSize !== undefined ? trigger.fontSize : 4}cqw, 80px)`, // Proportional to container width
                        color: trigger.textColor || '#E2E8F0',
                        overflow: 'auto',
                        background: trigger.borderColor || '#334155', // Bordes
                        gap: `${trigger.borderWidth !== undefined ? trigger.borderWidth : 1}px`,
                        boxSizing: 'border-box',
                        containerType: 'inline-size', // Enable container queries for this element
                    }}>
                        {rows.map((rowText, rowIndex) => {
                            const cols = rowText.split('\t');
                            return Array.from({ length: maxCols }).map((_, colIndex) => {
                                const isHeader = trigger.hasHeader !== false && rowIndex === 0;
                                const cellContent = cols[colIndex] || '';
                                let bg = trigger.oddRowBg || trigger.stripeBg || '#0F172A';
                                if (rowIndex % 2 !== 0) bg = trigger.evenRowBg || '#111827';

                                if (isHeader) bg = trigger.headerBg || '#1E293B';

                                return (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        style={{
                                            background: bg,
                                            display: 'flex', alignItems: 'center', padding: '0 8px',
                                            fontWeight: isHeader ? 700 : 400,
                                            color: isHeader ? (trigger.headerTextColor || '#FFFFFF') : (trigger.textColor || '#E2E8F0'),
                                            justifyContent: trigger.textAlign === 'center' ? 'center' : (trigger.textAlign === 'right' ? 'flex-end' : 'flex-start'),
                                            textAlign: trigger.textAlign || 'left',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}
                                        title={cellContent}
                                    >
                                        {cellContent}
                                    </div>
                                );
                            });
                        })}
                    </div>
                );
            })()}

            {(trigger.type !== 'scroll_area' && trigger.type !== 'floating_window' && trigger.type !== 'table_grid') && children}

            {/* The label (Drag Handle) */}
            <span
                onPointerDown={e => (trigger.type === 'scroll_area' || trigger.type === 'floating_window' || trigger.type === 'table_grid') ? onPointerDown(e, 'drag') : null}
                style={{
                    position: (trigger.type === 'scroll_area' || trigger.type === 'floating_window' || trigger.type === 'table_grid') ? 'absolute' : 'relative',
                    top: (trigger.type === 'scroll_area' || trigger.type === 'floating_window' || trigger.type === 'table_grid') ? 0 : 'auto',
                    left: (trigger.type === 'scroll_area' || trigger.type === 'floating_window' || trigger.type === 'table_grid') ? 0 : 'auto',
                    fontSize: 10, fontWeight: 700, color: colors.label,
                    background: 'rgba(10,13,18,0.9)',
                    borderRadius: 3, padding: '4px 8px', lineHeight: 1.2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    pointerEvents: (trigger.type === 'scroll_area' || trigger.type === 'floating_window' || trigger.type === 'table_grid') ? 'auto' : 'none',
                    cursor: (trigger.type === 'scroll_area' || trigger.type === 'floating_window' || trigger.type === 'table_grid') ? 'move' : 'inherit',
                    zIndex: 20
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
