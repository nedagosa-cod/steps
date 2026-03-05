import React from 'react'

/**
 * Divider — Horizontal rule with optional centered label text.
 * Props: label?, margin?
 *   - margin: CSS margin value (default: '4px 0')
 *             Use '16px 0' for the spacious variant used in GlobalConfigPanel.
 */
export const Divider = ({ label, margin = '4px 0' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin }}>
        <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
        {label && (
            <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--color-text-muted)', flexShrink: 0,
            }}>
                {label}
            </span>
        )}
        <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
    </div>
)

export default Divider
