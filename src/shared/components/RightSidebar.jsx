import React from 'react'
import { Settings2, Image as ImageIcon, Zap, LayoutDashboard } from 'lucide-react'
import GlobalConfigPanel from '../../features/config/components/GlobalConfigPanel'
import NodeConfigPanel from '../../features/config/components/NodeConfigPanel'

export default function RightSidebar({
    rightPanelWidth,
    handleMouseDownResize,
    configTab,
    setConfigTab,
    selectedNode,
    globalConfig,
    setGlobalConfig,
    nodes,
    edges,
    onUpdateNode,
    setIsEditingImage,
    setShowScrollLibrary,
    setScrollLibraryCallback
}) {
    return (
        <>
            <div
                onMouseDown={handleMouseDownResize}
                style={{
                    width: 6,
                    cursor: 'col-resize',
                    background: 'transparent',
                    zIndex: 20,
                    marginLeft: -3,
                    marginRight: -3,
                    borderLeft: '1px solid var(--color-border-subtle)',
                    transition: 'background 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            />

            <aside style={{ ...styles.rightPanel, width: rightPanelWidth, borderLeft: 'none', flexDirection: 'row' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={styles.rightPanelHeader}>
                        <span style={styles.rightPanelTitle}>
                            {configTab === 'node' ? 'Nodo' : configTab === 'media' ? 'Media' : configTab === 'triggers' ? 'Triggers' : 'General'}
                        </span>
                        {selectedNode && configTab !== 'general' && (
                            <span style={styles.nodeIdBadge}>{selectedNode.id}</span>
                        )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        {configTab === 'general' ? (
                            <GlobalConfigPanel
                                config={globalConfig}
                                onUpdate={(patch) => setGlobalConfig(prev => ({ ...prev, ...patch }))}
                                nodes={nodes}
                                edges={edges}
                            />
                        ) : (
                            <NodeConfigPanel
                                node={selectedNode}
                                onUpdateNode={onUpdateNode}
                                nodes={nodes}
                                onEditImage={(idx) => setIsEditingImage(idx)}
                                activeTab={configTab}
                                onOpenScrollLibrary={(callback) => {
                                    setScrollLibraryCallback(() => callback)
                                    setShowScrollLibrary(true)
                                }}
                            />
                        )}
                    </div>
                </div>

                <div style={{
                    display: 'flex', flexDirection: 'column',
                    width: 36, flexShrink: 0,
                    borderLeft: '1px solid var(--color-border-subtle)',
                    background: 'var(--color-raised)',
                    paddingTop: 6, gap: 2,
                }}>
                    {[
                        { id: 'general', icon: LayoutDashboard, label: 'General' },
                        { id: 'node', icon: Settings2, label: 'Nodo' },
                        { id: 'media', icon: ImageIcon, label: 'Media' },
                        { id: 'triggers', icon: Zap, label: 'Triggers' },
                    ].map(({ id, icon: Icon, label }) => {
                        const active = configTab === id
                        return (
                            <button
                                key={id}
                                onClick={() => setConfigTab(id)}
                                title={label}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '100%', height: 34,
                                    border: 'none', cursor: 'pointer',
                                    background: active ? 'var(--color-surface)' : 'transparent',
                                    borderLeft: active ? '2px solid var(--color-brand)' : '2px solid transparent',
                                    color: active ? 'var(--color-brand)' : 'var(--color-text-muted)',
                                    transition: 'all 120ms ease-out',
                                }}
                            >
                                <Icon size={15} />
                            </button>
                        )
                    })}
                </div>
            </aside>
        </>
    )
}

const styles = {
    rightPanel: {
        display: 'flex',
        flexDirection: 'column',
        width: 264,
        background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border-subtle)',
        flexShrink: 0,
        zIndex: 10,
    },
    rightPanelHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '10px 14px',
        borderBottom: '1px solid var(--color-border-subtle)',
        flexShrink: 0,
    },
    rightPanelTitle: {
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        letterSpacing: '0.02em',
        flex: 1,
    },
    nodeIdBadge: {
        fontSize: 9,
        fontVariantNumeric: 'tabular-nums',
        padding: '2px 6px',
        borderRadius: 4,
        background: 'var(--color-raised)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)',
    }
}
