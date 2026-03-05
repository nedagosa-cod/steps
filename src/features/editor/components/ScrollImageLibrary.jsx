import React, { useState, useEffect } from 'react'
import { X, Trash2, Image as ImageIcon, Check, Search } from 'lucide-react'

// ── localStorage key for the scroll image library ────────────────
const STORAGE_KEY = 'simubuild_scroll_library'

/**
 * Reads the scroll image library from localStorage.
 * @returns {Array<{ id: string, name: string, data: string, createdAt: number }>}
 */
export function getScrollLibrary() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
        return []
    }
}

/**
 * Saves an image to the scroll library in localStorage.
 * @param {string} name – human-readable name
 * @param {string} dataUrl – base64 image data
 */
export function addToScrollLibrary(name, dataUrl) {
    const lib = getScrollLibrary()
    lib.push({
        id: Math.random().toString(36).substr(2, 9),
        name,
        data: dataUrl,
        createdAt: Date.now(),
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lib))
}

/**
 * Removes an image from the scroll library by id.
 */
export function removeFromScrollLibrary(id) {
    const lib = getScrollLibrary().filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lib))
}

// ── ScrollImageLibrary — full-screen overlay picker ──────────────
export default function ScrollImageLibrary({ onSelect, onClose }) {
    const [items, setItems] = useState([])
    const [filter, setFilter] = useState('')

    useEffect(() => {
        setItems(getScrollLibrary())
    }, [])

    const handleDelete = (id) => {
        removeFromScrollLibrary(id)
        setItems(prev => prev.filter(i => i.id !== id))
    }

    const filtered = filter
        ? items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()))
        : items

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 55,
            background: 'rgba(10,13,18,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                width: 680, maxHeight: '82vh',
                background: 'var(--color-surface)', borderRadius: 12,
                border: '1px solid var(--color-border)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 18px', borderBottom: '1px solid var(--color-border)',
                }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: 'var(--color-brand)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ImageIcon size={14} color="#fff" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', flex: 1 }}>
                        Biblioteca de Scroll
                    </span>
                    <span style={{
                        fontSize: 11, color: 'var(--color-text-muted)',
                        background: 'var(--color-control)', padding: '2px 8px', borderRadius: 4,
                    }}>
                        {items.length} {items.length === 1 ? 'imagen' : 'imágenes'}
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: 'var(--color-control)', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--color-text-secondary)',
                        }}
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Search bar */}
                {items.length > 3 && (
                    <div style={{ padding: '10px 18px 0' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 10px', borderRadius: 6,
                            background: 'var(--color-control)', border: '1px solid var(--color-border)',
                        }}>
                            <Search size={13} color="var(--color-text-muted)" />
                            <input
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                placeholder="Buscar por nombre..."
                                style={{
                                    flex: 1, border: 'none', outline: 'none',
                                    background: 'transparent', fontSize: 12,
                                    color: 'var(--color-text-primary)',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: 18,
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 14, alignContent: 'start',
                }}>
                    {filtered.length === 0 && (
                        <div style={{
                            gridColumn: '1 / -1', textAlign: 'center',
                            padding: '48px 0', color: 'var(--color-text-muted)', fontSize: 13,
                        }}>
                            {items.length === 0
                                ? 'No hay imágenes guardadas. Usa el "Creador de Scroll" para crear una.'
                                : 'No se encontraron resultados.'}
                        </div>
                    )}

                    {filtered.map(item => (
                        <div
                            key={item.id}
                            style={{
                                background: 'var(--color-control)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 8, overflow: 'hidden',
                                display: 'flex', flexDirection: 'column',
                                transition: 'all 150ms',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--color-brand)'
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,92,252,0.15)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--color-border)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            {/* Thumbnail */}
                            <div
                                onClick={() => {
                                    onSelect(item.data)
                                    onClose()
                                }}
                                style={{
                                    height: 140, background: '#0a0d12',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                <img
                                    src={item.data}
                                    alt={item.name}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            </div>

                            {/* Info row */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px 10px',
                                borderTop: '1px solid var(--color-border)',
                            }}>
                                <span style={{
                                    flex: 1, fontSize: 11, fontWeight: 600,
                                    color: 'var(--color-text-primary)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {item.name}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm('¿Eliminar esta imagen de la biblioteca?')) {
                                            handleDelete(item.id)
                                        }
                                    }}
                                    title="Eliminar"
                                    style={{
                                        background: 'transparent', border: 'none',
                                        color: 'var(--color-text-muted)', cursor: 'pointer',
                                        padding: 4, borderRadius: 4, display: 'flex',
                                        transition: 'color 150ms',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
