import React from 'react'
import useImageEditor from '../hooks/useImageEditor'
import { ImageEditorToolbar } from './ImageEditorToolbar'

export default function ImageEditor({ imageUrl, onSave, onCancel }) {
    const { refs, state, actions } = useImageEditor(imageUrl)

    return (
        <div ref={refs.containerRef} style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column'
        }}>
            {/* Toolbar extracted to its own component */}
            <ImageEditorToolbar
                state={state}
                actions={actions}
                onSave={onSave}
                onCancel={onCancel}
            />

            {/* Canvas Container */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <canvas ref={refs.canvasRef} />
            </div>
        </div>
    )
}
