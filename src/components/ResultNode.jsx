import React from 'react'
import { Handle, Position } from 'reactflow'
import { Trophy } from 'lucide-react'

export default function ResultNode({ data, selected }) {
    return (
        <div style={{
            background: 'var(--color-surface)',
            border: selected ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 20,
            width: 280,
            color: 'var(--color-text-primary)',
            boxShadow: selected ? '0 0 0 4px rgba(124,92,252,0.15)' : '0 4px 12px rgba(0,0,0,0.1)',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: 'rgba(234, 179, 8, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(234, 179, 8, 0.3)'
                }}>
                    <Trophy size={22} color="#eab308" />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{data?.label || 'Resultado / Certificado'}</h3>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>Fin del Simulador</p>
                </div>
            </div>

            <div style={{
                background: 'var(--color-control)', borderRadius: 8, padding: 12, border: '1px dashed var(--color-border)'
            }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-primary)', textAlign: 'center' }}>
                    {data?.title || '¡Simulación Completada!'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
                    {data?.message || 'Has finalizado el recorrido con éxito.'}
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Left}
                style={{
                    background: 'var(--color-bg)',
                    width: 14,
                    height: 14,
                    border: '3px solid var(--color-border)',
                    left: -7
                }}
            />
        </div>
    )
}
