import React, { useEffect, useRef } from 'react';
import { Loader2, MonitorDown } from 'lucide-react';

export default function ExportProgressDialog({ isOpen, progressMessage }) {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom of terminal lines when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [progressMessage]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: 500, maxWidth: '90%',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    display: 'flex', alignItems: 'center', gap: 16
                }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(124, 92, 252, 0.15)',
                        border: '1px solid rgba(124, 92, 252, 0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <MonitorDown size={24} color="var(--color-brand)" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            Exportando Simulador a EXE
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                            Empaquetando recursos y construyendo ejecutable...
                        </p>
                    </div>
                </div>

                {/* Body / Terminal */}
                <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <Loader2 size={16} color="var(--color-brand)" style={{ animation: 'spin 2s linear infinite' }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>Procesando...</span>
                    </div>

                    <div 
                        ref={scrollRef}
                        style={{
                            background: '#040608',
                            border: '1px solid var(--color-border-subtle)',
                            borderRadius: 6,
                            padding: 12,
                            height: 160,
                            overflowY: 'auto',
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                            fontSize: 11,
                            color: '#8b9bb4',
                            lineHeight: 1.5
                        }}
                    >
                        {progressMessage.map((msg, idx) => (
                            <div key={idx} style={{ 
                               wordBreak: 'break-all', 
                               color: msg.includes('error') || msg.toLowerCase().includes('fail') ? '#ef4444' : 
                                      msg.includes('éxito') ? '#22c55e' : 'inherit'
                            }}>
                                {msg}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    background: 'var(--color-canvas)',
                    borderTop: '1px solid var(--color-border-subtle)',
                    display: 'flex', justifyContent: 'flex-end'
                }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        Por favor, no cierres esta ventana hasta que finalice.
                    </span>
                </div>
            </div>
            
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
