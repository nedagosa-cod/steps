import React from 'react'
import { Handle, Position } from 'reactflow'
import { Trophy, Users } from 'lucide-react'

export default function RankingNode({ data, selected }) {
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
                    width: 44, height: 44, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                    <Trophy size={22} color="#38bdf8" />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{data?.label || 'Ranking Global'}</h3>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>Tabla de Posiciones</p>
                </div>
            </div>

            <div style={{
                background: 'var(--color-control)', borderRadius: 8, padding: 12, border: '1px dashed var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
                <Users size={16} color="var(--color-text-secondary)" />
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {data?.title || 'Tabla de Posiciones'}
                </div>
            </div>

            {/* Este nodo se supone que va al final, por lo que solo tiene un input (target) */}
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
