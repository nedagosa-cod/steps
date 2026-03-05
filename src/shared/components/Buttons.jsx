import React, { useState } from 'react'

/**
 * ToolBtn — Icon button for the left toolbar.
 * Props: onClick, title?, children, danger?
 */
export const ToolBtn = ({ onClick, title, children, danger = false }) => {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick}
            title={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 7, border: 'none', cursor: 'pointer',
                color: danger
                    ? (hovered ? 'var(--color-danger)' : 'var(--color-text-muted)')
                    : (hovered ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)'),
                background: hovered
                    ? (danger ? 'rgba(192,64,64,0.1)' : 'var(--color-raised)')
                    : 'transparent',
                transition: 'all 150ms ease-out',
            }}
        >
            {children}
        </button>
    )
}

/**
 * GhostBtn — Ghost-style button used in the header toolbar.
 * Props: onClick, children, disabled?
 */
export const GhostBtn = ({ onClick, children, disabled }) => {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => !disabled && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center',
                padding: '5px 11px', borderRadius: 6,
                border: `1px solid ${hovered ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
                background: hovered ? 'var(--color-raised)' : 'transparent',
                color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                fontSize: 11, fontWeight: 500, cursor: disabled ? 'default' : 'pointer',
                transition: 'all 150ms ease-out',
            }}
        >
            {children}
        </button>
    )
}

/**
 * PrimaryBtn — Primary action button (brand color).
 * Props: onClick, children, disabled?
 */
export const PrimaryBtn = ({ onClick, children, disabled }) => {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => !disabled && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center',
                padding: '5px 14px', borderRadius: 6, border: 'none',
                background: disabled
                    ? 'var(--color-raised)'
                    : (hovered ? 'var(--color-brand-hover)' : 'var(--color-brand)'),
                boxShadow: (!disabled && hovered) ? '0 0 16px var(--color-brand-glow)' : 'none',
                color: disabled ? 'var(--color-text-muted)' : '#fff',
                fontSize: 11, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
                transition: 'all 150ms ease-out',
                letterSpacing: '0.01em',
            }}
        >
            {children}
        </button>
    )
}
