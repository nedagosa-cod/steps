import React from 'react'
import { Plus, Play, Download, Save, Upload, Image as ImageIcon, Undo2, Redo2, Maximize2 } from 'lucide-react'
import { GhostBtn, PrimaryBtn } from './Buttons'

export default function TopNavbar({
    nodesCount,
    canUndo,
    canRedo,
    undo,
    redo,
    selectedNode,
    isFocusMode,
    setIsFocusMode,
    setShowImageBuilder,
    addScreenNode,
    handleLoadProject,
    handleSaveProject,
    handleExport,
    handleExportExe,
    isExporting,
    isExportingExe,
    setIsPreview
}) {
    return (
        <header style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={styles.brandName}>SimuBuild</span>
                <span style={styles.editorBadge}>Editor</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {nodesCount === 0 && (
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 4 }}>
                        Añade una pantalla para empezar
                    </span>
                )}

                <div style={{ display: 'flex', gap: 2, marginRight: 4 }}>
                    <GhostBtn onClick={undo} disabled={!canUndo} title="Deshacer (Ctrl+Z)">
                        <Undo2 size={13} />
                    </GhostBtn>
                    <GhostBtn onClick={redo} disabled={!canRedo} title="Rehacer (Ctrl+Y)">
                        <Redo2 size={13} />
                    </GhostBtn>
                </div>

                {selectedNode && !isFocusMode && (
                    <GhostBtn onClick={() => setIsFocusMode(true)}>
                        <Maximize2 size={12} style={{ marginRight: 5 }} />
                        Enfocar nodo
                    </GhostBtn>
                )}

                <GhostBtn onClick={() => setShowImageBuilder(true)}>
                    <ImageIcon size={12} style={{ marginRight: 5 }} />
                    Creador de Scroll
                </GhostBtn>

                <GhostBtn onClick={addScreenNode}>
                    <Plus size={12} style={{ marginRight: 5 }} />
                    Nueva pantalla
                </GhostBtn>

                <GhostBtn onClick={handleLoadProject}>
                    <Upload size={12} style={{ marginRight: 5 }} />
                    Cargar
                </GhostBtn>

                <GhostBtn onClick={handleSaveProject} disabled={nodesCount === 0}>
                    <Save size={12} style={{ marginRight: 5 }} />
                    Guardar
                </GhostBtn>

                <GhostBtn onClick={handleExport} disabled={nodesCount === 0 || isExporting}>
                    <Download size={12} style={{ marginRight: 5 }} />
                    {isExporting ? 'Exportando...' : 'Exportar'}
                </GhostBtn>

                <GhostBtn
                    onClick={handleExportExe}
                    disabled={nodesCount === 0 || isExportingExe}
                    style={{ borderColor: isExportingExe ? 'rgba(124,92,252,0.5)' : undefined }}
                >
                    <Download size={12} style={{ marginRight: 5 }} />
                    {isExportingExe ? 'Generando EXE...' : 'Exportar EXE'}
                </GhostBtn>

                <PrimaryBtn
                    onClick={() => nodesCount > 0 && setIsPreview(true)}
                    disabled={nodesCount === 0}
                >
                    <Play size={12} style={{ marginRight: 5 }} />
                    Preview
                </PrimaryBtn>
            </div>
        </header>
    )
}

const styles = {
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 44,
        padding: '0 16px',
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-surface)',
        flexShrink: 0,
        zIndex: 10,
    },
    brandName: {
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        color: 'var(--color-text-primary)',
    },
    editorBadge: {
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.04em',
        padding: '2px 7px',
        borderRadius: 4,
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-tertiary)',
    }
}
