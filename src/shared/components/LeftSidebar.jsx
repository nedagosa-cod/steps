import React from 'react'
import { GitBranch, Plus, Award, GalleryHorizontalEnd, Trash2, UserCircle, Trophy } from 'lucide-react'
import { ToolBtn } from './Buttons'

export default function LeftSidebar({
    addAuthNode,
    addScreenNode,
    addResultNode,
    addRankingNode,
    setShowScrollLibrary,
    setScrollLibraryCallback,
    nodesCount,
    edgesCount,
    selectedNode,
    deleteSelectedNode
}) {
    return (
        <aside style={styles.leftBar}>
            <div style={styles.logo}>
                <GitBranch size={15} color="#fff" />
            </div>

            <div style={styles.sep} />

            <ToolBtn title="Menú de Inicio / Login" onClick={addAuthNode}>
                <UserCircle size={16} />
            </ToolBtn>

            <ToolBtn title="Añadir pantalla (N)" onClick={addScreenNode}>
                <Plus size={16} />
            </ToolBtn>

            <ToolBtn title="Añadir Certificado (Resultado)" onClick={addResultNode}>
                <Award size={16} />
            </ToolBtn>

            <ToolBtn title="Añadir Ranking" onClick={addRankingNode}>
                <Trophy size={16} />
            </ToolBtn>

            <ToolBtn
                title="Biblioteca de Scroll"
                onClick={() => {
                    setScrollLibraryCallback(null)
                    setShowScrollLibrary(true)
                }}
            >
                <GalleryHorizontalEnd size={16} />
            </ToolBtn>

            <div style={{ flex: 1 }} />

            <div style={styles.counter}>
                <span style={styles.counterNum}>{nodesCount}</span>
                <span style={styles.counterLabel}>nodos</span>
            </div>
            <div style={{ ...styles.counter, marginBottom: 8 }}>
                <span style={styles.counterNum}>{edgesCount}</span>
                <span style={styles.counterLabel}>links</span>
            </div>

            {selectedNode && (
                <>
                    <div style={styles.sep} />
                    <ToolBtn title="Eliminar nodo" onClick={deleteSelectedNode} danger>
                        <Trash2 size={15} />
                    </ToolBtn>
                </>
            )}
        </aside>
    )
}

const styles = {
    leftBar: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 56,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border-subtle)',
        padding: '12px 0',
        flexShrink: 0,
        zIndex: 10,
        gap: 4,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 8,
        background: 'var(--color-brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        flexShrink: 0,
    },
    sep: {
        width: 28,
        height: 1,
        background: 'var(--color-border-subtle)',
        margin: '4px 0',
    },
    counter: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
    },
    counterNum: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
    },
    counterLabel: {
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
    }
}
