import React from 'react'
import { Handle, Position } from 'reactflow'
import { UserCircle } from 'lucide-react'

export default function AuthNode({ data, selected }) {
    return (
        <div style={{
            background: 'rgba(10, 13, 18, 0.9)',
            border: selected ? '2px solid var(--color-brand)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 20,
            width: 260,
            color: 'white',
            boxShadow: selected ? '0 0 0 4px rgba(255,59,48,0.15)' : '0 10px 30px rgba(0,0,0,0.5)',
            position: 'relative',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <UserCircle size={20} color="var(--color-brand)" />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Menú de Inicio</h3>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-secondary)' }}>Login & Autenticación</p>
                </div>
            </div>

            <div style={{
                background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12, border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--color-text-primary)' }}>
                    {data?.title || 'Control de Accesos'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {data?.objective || 'Bienvenido al simulador...'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                    {data?.showPractice !== false && <div style={{ height: 24, borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Modo Práctica</div>}
                    <div style={{ height: 24, borderRadius: 4, background: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'white' }}>Evaluación</div>
                    {data?.showScores !== false && <div style={{ height: 24, borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Puntajes</div>}
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
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    background: 'var(--color-brand)',
                    width: 14,
                    height: 14,
                    border: '3px solid #1a1d24',
                    right: -7
                }}
            />
        </div>
    )
}
