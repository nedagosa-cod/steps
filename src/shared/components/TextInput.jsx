import React from 'react'

/**
 * TextInput — Single-line text input with design-system styling.
 * Props: value, onChange, placeholder?, mono?
 */
export const TextInput = ({ value, onChange, placeholder, mono }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
            width: '100%',
            background: 'var(--color-control)',
            border: '1px solid var(--color-border)',
            borderRadius: 6, padding: '6px 10px',
            fontSize: mono ? 11 : 12,
            fontFamily: mono ? 'ui-monospace, monospace' : 'inherit',
            color: 'var(--color-text-primary)', outline: 'none',
            transition: 'border-color 150ms ease-out',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--color-border-strong)'}
        onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
    />
)

export default TextInput
