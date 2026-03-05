import React from 'react'
import { X, CheckCircle, AlertCircle, Maximize2, Minimize2, Eye } from 'lucide-react'
import { normalizeTriggers } from '../../../shared/utils/triggers'
import { DraggableHUD } from './DraggableHUD'
import { TriggerOverlays } from './TriggerOverlays'
import usePreviewMode from '../hooks/usePreviewMode'

export default function PreviewMode({ nodes, edges, globalConfig = {}, onExit }) {
    const previewModeData = usePreviewMode(nodes, edges, globalConfig)
    const { state, refs, actions } = previewModeData

    const {
        currentNode, currentNodeId, stepIndex, totalSteps, nodeOrder,
        completedTriggers, inputValues, error, success, transitioning,
        isFullscreen, timeRemaining
    } = state

    if (!currentNode) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'var(--color-canvas)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>No hay nodos.</p>
            </div>
        )
    }

    const { data } = currentNode
    const triggers = normalizeTriggers(data)

    return (
        <div ref={refs.containerRef} style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(10,13,18,0.97)',
            display: 'flex', flexDirection: 'column',
        }}>
            <DraggableHUD>
                {/* ── Top bar ── */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-brand)' }}>
                                Preview
                            </span>
                            <span style={{ color: 'var(--color-border)', fontSize: 10 }}>·</span>
                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {data.label || 'Sin nombre'}
                            </span>
                        </div>
                        {/* Screen step pills */}
                        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                            {nodeOrder.map((id, i) => (
                                <div key={id} style={{
                                    height: 3, borderRadius: 99,
                                    width: id === currentNodeId ? 14 : 4,
                                    background: i <= stepIndex ? 'var(--color-brand)' : 'var(--color-border)',
                                    transition: 'width 250ms ease-out, background 250ms ease-out',
                                }} />
                            ))}
                            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>
                                {stepIndex + 1}/{totalSteps}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {timeRemaining !== null && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '4px 10px', borderRadius: 12,
                                background: timeRemaining <= 5 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                                border: timeRemaining <= 5 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                                color: timeRemaining <= 5 ? '#ef4444' : 'var(--color-text-primary)',
                                fontWeight: timeRemaining <= 5 ? 700 : 500,
                                fontSize: 13, transition: 'all 200ms ease-out',
                                fontVariantNumeric: 'tabular-nums', marginRight: 8
                            }}>
                                <span style={{ fontSize: 11, color: timeRemaining <= 5 ? '#ef4444' : 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Tiempo:
                                </span>
                                {timeRemaining}s
                            </div>
                        )}
                        <button
                            onClick={actions.toggleFullscreen}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 26, height: 26, borderRadius: 6,
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--color-text-secondary)',
                                cursor: 'pointer', transition: 'all 150ms'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                                e.currentTarget.style.color = 'var(--color-text-primary)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                e.currentTarget.style.color = 'var(--color-text-secondary)'
                            }}
                            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                        >
                            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                        </button>
                        <button
                            onClick={onExit}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '4px 8px', borderRadius: 6,
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--color-text-secondary)', fontSize: 11, cursor: 'pointer',
                                transition: 'all 150ms'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                                e.currentTarget.style.color = 'var(--color-text-primary)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = 'var(--color-text-secondary)'
                            }}
                        >
                            <X size={12} /> Salir
                        </button>
                    </div>
                </div>

                {/* ── Trigger progress dots (when > 1 trigger) ── */}
                {triggers.length > 1 && (
                    <div style={{
                        display: 'flex', gap: 4, marginTop: 12, alignItems: 'center', flexWrap: 'wrap',
                        opacity: transitioning ? 0 : 1, transition: 'opacity 280ms ease-out',
                        paddingTop: 10, borderTop: '1px solid var(--color-border-subtle)'
                    }}>
                        {triggers.map((t) => {
                            const done = completedTriggers.has(t.id)
                            return (
                                <div key={t.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '2px 7px', borderRadius: 20,
                                    border: `1px solid ${done ? 'rgba(46,165,103,0.35)' : 'rgba(255,255,255,0.1)'}`,
                                    background: done ? 'rgba(46,165,103,0.08)' : 'rgba(255,255,255,0.03)',
                                    transition: 'all 250ms ease-out',
                                }}>
                                    <span style={{ fontSize: 8, fontWeight: 700, color: done ? '#5ac98a' : 'rgba(255,255,255,0.5)' }}>
                                        {done ? '✓' : '○'}
                                    </span>
                                    <span style={{ fontSize: 8, fontWeight: done ? 600 : 400, letterSpacing: '0.06em', textTransform: 'uppercase', color: done ? '#5ac98a' : 'rgba(255,255,255,0.5)' }}>
                                        {t.type}
                                    </span>
                                </div>
                            )
                        })}
                        {/* Pending count */}
                        {(() => {
                            const reqTriggers = triggers.filter(t => !t.isOptional);
                            const reqCompleted = reqTriggers.filter(t => completedTriggers.has(t.id)).length;
                            if (reqCompleted < reqTriggers.length) {
                                return (
                                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)', marginLeft: 2 }}>
                                        {reqTriggers.length - reqCompleted} res.
                                    </span>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}

                {/* ── Practice Mode Guide ── */}
                {sessionStorage.getItem('isPracticeMode') === 'true' && currentNode.type !== 'authNode' && (
                    <div style={{
                        marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8,
                        paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-brand)', textTransform: 'uppercase' }}>
                            Guía de Práctica
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(() => {
                                const guideTriggers = triggers.filter(t => !t.isOptional);
                                if (guideTriggers.length === 0) {
                                    return <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No hay acciones obligatorias en esta pantalla.</div>;
                                }
                                return guideTriggers.map((t, index) => {
                                    const done = completedTriggers.has(t.id);
                                    const depsArray = Array.isArray(t.dependsOn) ? t.dependsOn : (t.dependsOn ? [t.dependsOn] : [])
                                    const isBlocked = depsArray.length > 0 && depsArray.some(depId => !completedTriggers.has(depId))

                                    // Fallback hints if empty
                                    let autoHint = t.hint;
                                    if (!autoHint) {
                                        switch (t.type) {
                                            case 'click': autoHint = "Haz clic en la zona indicada."; break;
                                            case 'double_click': autoHint = "Haz doble clic en la zona indicada."; break;
                                            case 'input': autoHint = "Completa el campo de texto."; break;
                                            case 'dropdown': autoHint = "Selecciona la opción correcta en la lista."; break;
                                            case 'dependent_dropdown': autoHint = "Selecciona la subcategoría correcta."; break;
                                            case 'keypress': autoHint = `Presiona la tecla ${t.keyCode}.`; break;
                                            case 'scroll_area': autoHint = "Desplaza el contenido hacia abajo."; break;
                                            default: autoHint = "Realiza la acción requerida.";
                                        }
                                    }

                                    return (
                                        <div key={t.id} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 8,
                                            opacity: done ? 0.4 : (isBlocked ? 0.6 : 1),
                                            transition: 'all 300ms ease',
                                        }}>
                                            <div style={{
                                                marginTop: 2, width: 14, height: 14, borderRadius: '50%',
                                                border: `1px solid ${done ? '#5ac98a' : 'var(--color-border-strong)'}`,
                                                background: done ? 'rgba(90, 201, 138, 0.2)' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                {done && <span style={{ color: '#5ac98a', fontSize: 10 }}>✓</span>}
                                            </div>
                                            <div style={{
                                                fontSize: 12, color: done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                                                textDecoration: done ? 'line-through' : 'none', lineHeight: 1.4, flex: 1
                                            }}>
                                                <span style={{ fontWeight: 600, marginRight: 4 }}>Paso {index + 1}:</span>
                                                {autoHint}
                                            </div>
                                            {!done && !isBlocked && (
                                                <button
                                                    onClick={() => actions.handleHighlightTrigger(t.id)}
                                                    title="Ver dónde hacer clic"
                                                    style={{
                                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                                        color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        padding: '4px', borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.color = 'var(--color-brand)';
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.color = 'var(--color-text-muted)';
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    <Eye size={12} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )
                }

                {/* ── Feedback ── */}
                {
                    error && (
                        <div style={{
                            marginTop: 10, display: 'flex', alignItems: 'center', gap: 7,
                            padding: '6px 12px', borderRadius: 6,
                            border: '1px solid rgba(192,64,64,0.3)', background: 'rgba(192,64,64,0.1)',
                            fontSize: 11, color: '#d97979',
                        }}>
                            <AlertCircle size={12} />
                            {error}
                        </div>
                    )
                }

                {
                    success && (
                        <div style={{
                            marginTop: 10, display: 'flex', alignItems: 'center', gap: 7,
                            padding: '6px 14px', borderRadius: 6,
                            border: '1px solid rgba(46,165,103,0.3)', background: 'rgba(46,165,103,0.1)',
                            fontSize: 11, color: '#5ac98a',
                        }}>
                            <CheckCircle size={12} />
                            ¡Completado!
                        </div>
                    )
                }
            </DraggableHUD>

            {/* ── Visual Result Node (Certificado) ── */}
            {currentNode.type === 'resultNode' && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,13,18,0.85)', backdropFilter: 'blur(12px)',
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    {sessionStorage.getItem('isPracticeMode') === 'true' ? (
                        <div style={{
                            background: '#ffffff', borderRadius: 12, padding: '40px 60px',
                            maxWidth: 500, width: '90%', textAlign: 'center',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                        }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(46,165,103,0.1)', color: '#2ea567', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                <CheckCircle size={32} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111' }}>Práctica Completada</h2>
                            <p style={{ margin: 0, fontSize: 15, color: '#555', lineHeight: 1.5 }}>
                                Has finalizado este escenario en Modo Práctica. Esta sesión es formativa y no genera evaluación ni certificado.
                            </p>
                            <button
                                onClick={onExit}
                                style={{
                                    marginTop: 20, padding: '10px 24px', borderRadius: 8, background: '#111',
                                    color: 'white', fontWeight: 600, fontSize: 14, border: 'none',
                                    cursor: 'pointer', transition: 'transform 150ms'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Finalizar y Volver
                            </button>
                        </div>
                    ) : (
                        /* Certificate Card */
                        <div style={{
                            background: '#ffffff',
                            borderRadius: 12, padding: '30px 60px',
                            width: '94%', maxWidth: 900,
                            minHeight: 'min(90vh, 600px)',
                            textAlign: 'center', margin: 'auto',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
                            position: 'relative', overflow: 'hidden',
                            color: '#1a1a1a'
                        }}>
                            <svg style={{ position: 'absolute', top: 0, left: 0, width: 250, height: 250, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 0 L100 0 C50 20 20 50 0 100 Z" fill={data.certColorAccent || '#EAB308'} opacity="0.9" />
                                <path d="M0 0 L80 0 C40 15 15 40 0 80 Z" fill={data.certColorPrimary || '#1E3A8A'} />
                            </svg>
                            <svg style={{ position: 'absolute', bottom: 0, right: 0, width: 250, height: 250, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M100 100 L0 100 C50 80 80 50 100 0 Z" fill={data.certColorAccent || '#EAB308'} opacity="0.9" />
                                <path d="M100 100 L20 100 C60 85 85 60 100 20 Z" fill={data.certColorPrimary || '#1E3A8A'} />
                            </svg>
                            <svg style={{ position: 'absolute', top: 0, right: 40, width: 50, height: 80, pointerEvents: 'none' }} viewBox="0 0 50 80" preserveAspectRatio="none">
                                <path d="M0 0 L50 0 L50 80 L25 60 L0 80 Z" fill={data.certColorAccent || '#EAB308'} />
                            </svg>

                            <div style={{
                                position: 'absolute', right: 60, top: '45%', transform: 'translateY(-50%)',
                                width: 110, height: 110, borderRadius: '50%', background: data.certColorPrimary || '#1E3A8A',
                                display: 'none',
                                border: `3px solid ${data.certColorAccent || '#EAB308'}`, color: data.certColorAccent || '#EAB308',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }} className="cert-seal">
                                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', padding: 12 }}>
                                    <path id="curve" d="M 20 50 A 30 30 0 1 1 80 50 A 30 30 0 1 1 20 50" fill="transparent" />
                                    <text fontSize="10" fontWeight="bold" fill={data.certColorAccent || '#EAB308'} letterSpacing="2">
                                        <textPath href="#curve" startOffset="50%" textAnchor="middle">
                                            SELLO DE EXCELENCIA
                                        </textPath>
                                    </text>
                                    <polygon points="50,30 55,40 65,42 58,50 60,60 50,55 40,60 42,50 35,42 45,40" fill={data.certColorAccent || '#EAB308'} />
                                </svg>
                            </div>

                            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                                <h1 style={{ margin: 0, fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 900, color: '#000000', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    {data.certTitle ?? 'CERTIFICADO'}
                                </h1>
                                <h2 style={{ margin: 0, fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 700, color: data.certColorPrimary || '#1E3A8A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {data.certSubtitle ?? 'DE RECONOCIMIENTO'}
                                </h2>
                            </div>

                            <div style={{ zIndex: 1, marginTop: 20 }}>
                                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {data.certPreName ?? 'OTORGADO A:'}
                                </p>
                            </div>

                            <div style={{ zIndex: 1, width: '85%', padding: '5px 0', borderBottom: '2px solid #1a1a1a', margin: '0 0 10px 0' }}>
                                <h3 style={{ margin: 0, fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 400, color: '#000000', fontFamily: '"Great Vibes", "Brush Script MT", "Alex Brush", cursive', lineHeight: 1.2 }}>
                                    {inputValues['auth_name'] ? inputValues['auth_name'].trim() : 'Nombre del Participante'}
                                </h3>
                            </div>

                            <div style={{ zIndex: 1, maxWidth: 700 }}>
                                <p style={{ margin: 0, fontSize: 'clamp(15px, 2vw, 18px)', color: '#374151', lineHeight: 1.6, fontWeight: 500 }}>
                                    {data.certDescription ?? 'Por haber completado satisfactoriamente 120 horas del Diplomado...'}
                                </p>
                            </div>

                            <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 20, gap: 20, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: '70%', height: 1, background: '#1a1a1a' }} />
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#000', textTransform: 'uppercase' }}>{data.signature1Name ?? 'LIC. HORACIO OLIVO'}</p>
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#4b5563', fontStyle: 'italic' }}>{data.signature1Title ?? 'Director de Administración'}</p>
                                </div>
                                <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: '70%', height: 1, background: '#1a1a1a' }} />
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#000', textTransform: 'uppercase' }}>{data.signature2Name ?? 'LIC. CARLA RODRÍGUEZ'}</p>
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#4b5563', fontStyle: 'italic' }}>{data.signature2Title ?? 'Directora de Negocios'}</p>
                                </div>
                            </div>

                            <button
                                onClick={onExit}
                                style={{
                                    marginTop: 30, padding: '12px 32px', borderRadius: 8, background: data.certColorPrimary || '#1E3A8A',
                                    color: 'white', fontWeight: 600, fontSize: 15, border: 'none',
                                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                                    transition: 'transform 150ms, box-shadow 150ms', zIndex: 1
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.6)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.4)' }}
                            >
                                Finalizar y Volver
                            </button>

                            <style>{`
                                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                                @media (min-width: 768px) {
                                    .cert-seal { display: flex !important; }
                                }
                            `}</style>
                        </div>
                    )}
                </div>
            )}

            {
                currentNode.type === 'authNode' ? (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: -1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#0a0d12',
                        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(124, 92, 252, 0.15) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(46, 165, 103, 0.1) 0%, transparent 50%)',
                        ...actions.getTransitionStyles()
                    }}>
                        <div style={{
                            width: 420, maxWidth: '90%', padding: 40,
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 24,
                            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
                            display: 'flex', flexDirection: 'column', gap: 24,
                            textAlign: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                                    {data.title || 'Control de Accesos'}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    {data.objective || 'Bienvenido al simulador. Ingresa tus datos para continuar.'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Tu Nombre..."
                                        value={inputValues['auth_name'] || ''}
                                        onChange={e => {
                                            actions.setInputValues(prev => ({ ...prev, auth_name: e.target.value }))
                                            actions.setError('')
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                const name = (inputValues['auth_name'] || '').trim()
                                                if (!name) actions.setError('Por favor, ingresa tu nombre para continuar.')
                                                else {
                                                    const nextId = actions.getNextNodeId()
                                                    if (nextId) actions.navigate(nextId)
                                                }
                                            }
                                        }}
                                        style={{
                                            width: '100%', padding: '14px 16px',
                                            background: 'rgba(0,0,0,0.4)',
                                            border: error ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: 12, color: 'white', fontSize: 14,
                                            outline: 'none', transition: 'border-color 200ms',
                                            textAlign: 'center'
                                        }}
                                    />
                                    {error && <div style={{ position: 'absolute', top: -24, left: 0, right: 0, color: '#ef4444', fontSize: 11, fontWeight: 500 }}>{error}</div>}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {data.showPractice !== false && (
                                        <button
                                            onClick={() => {
                                                const name = (inputValues['auth_name'] || '').trim()
                                                if (!name) {
                                                    actions.setError('Por favor, ingresa tu nombre para continuar.')
                                                    return
                                                }
                                                sessionStorage.setItem('isPracticeMode', 'true')
                                                const nextId = actions.getNextNodeId()
                                                if (nextId) actions.navigate(nextId)
                                            }}
                                            style={{
                                                padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.15)', color: 'white',
                                                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        >
                                            MODO PRÁCTICA
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            const name = (inputValues['auth_name'] || '').trim()
                                            if (!name) {
                                                actions.setError('Por favor, ingresa tu nombre para continuar.')
                                                return
                                            }
                                            sessionStorage.setItem('isPracticeMode', 'false')
                                            const nextId = actions.getNextNodeId()
                                            if (nextId) actions.navigate(nextId)
                                        }}
                                        style={{
                                            padding: '14px', borderRadius: 12, background: 'var(--color-brand)',
                                            border: 'none', color: 'white', fontSize: 13, fontWeight: 700,
                                            cursor: 'pointer', transition: 'transform 100ms, filter 150ms, box-shadow 150ms',
                                            boxShadow: '0 4px 14px rgba(124, 92, 252, 0.4)'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 92, 252, 0.6)' }}
                                        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124, 92, 252, 0.4)' }}
                                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        EVALUACIÓN
                                    </button>

                                    {data.showScores !== false && (
                                        <button disabled style={{
                                            padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)',
                                            fontSize: 13, fontWeight: 600, cursor: 'not-allowed'
                                        }}>
                                            PUNTAJES
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── Main image container ── */
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: -1,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: (globalConfig.bgType === 'color' && globalConfig.bgValue) ? globalConfig.bgValue : (globalConfig.bgType === 'transparent' ? 'transparent' : '#0a0d12'),
                        backgroundImage: (globalConfig.bgType === 'image' && globalConfig.bgValue) ? `url(${globalConfig.bgValue})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        ...actions.getTransitionStyles()
                    }}>
                        {data.image ? (
                            <div style={{ position: 'relative', width: '100%', margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {data.mediaType === 'video' ? (
                                    <video
                                        src={Array.isArray(data.image) ? data.image[0] : data.image}
                                        autoPlay
                                        playsInline
                                        onEnded={() => {
                                            const nextId = actions.getNextNodeId()
                                            if (nextId) actions.navigate(nextId)
                                            else setSuccess(true)
                                        }}
                                        style={{
                                            width: '100vw', height: '100dvh', display: 'block',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', maxWidth: '100%', margin: '0 auto' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                            {(Array.isArray(data.image) ? data.image : [data.image]).map((src, idx) => (
                                                <img key={idx} src={src} alt={`screen-${idx}`} draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                            ))}
                                        </div>
                                        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                            <TriggerOverlays
                                                triggers={triggers}
                                                completedTriggers={completedTriggers}
                                                handlers={actions}
                                                state={state}
                                                refs={refs}
                                            />
                                        </div>
                                    </div>
                                )}
                                {data.mediaType === 'video' && <TriggerOverlays triggers={triggers} completedTriggers={completedTriggers} handlers={actions} state={state} refs={refs} />}
                            </div>
                        ) : (
                            <div style={{ position: 'relative', width: '100vw', height: '100dvh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 14, color: 'var(--color-text-muted)', pointerEvents: 'none' }}>Sin imagen en este nodo</span>
                                <TriggerOverlays triggers={triggers} completedTriggers={completedTriggers} handlers={actions} state={state} refs={refs} />
                            </div>
                        )}
                    </div>
                )}
        </div>
    )
}
