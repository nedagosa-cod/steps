import React from 'react'

/**
 * FieldLabel — Uppercase micro-label used above form fields.
 * Props: children
 */
export const FieldLabel = ({ children }) => (
    <label style={{
        display: 'block', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        color: 'var(--color-text-tertiary)', marginBottom: 5,
    }}>
        {children}
    </label>
)

export default FieldLabel
