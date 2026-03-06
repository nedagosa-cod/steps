import React from 'react'
import { FieldLabel } from './FieldLabel'

/**
 * NumericInput — Number input with a floating suffix badge and design-system styling.
 *
 * This is the unified superset of both variants:
 *   - NodeConfigPanel variant: accentColor, min, max, step, suffix
 *   - GlobalConfigPanel variant: placeholder (passed as placeholder)
 *
 * Props: value, onChange, label?, accentColor?, min?, max?, step?, suffix?, placeholder?
 */
export const NumericInput = ({
    value,
    onChange,
    label,
    accentColor,
    min = 0,
    max = 100,
    step = '0.01',
    suffix = '%',
    placeholder,
}) => (
    <div>
        {label && <FieldLabel>{label}</FieldLabel>}
        <div style={{ position: 'relative' }}>
            <input
                type="number" min={min} max={max} step={step}
                value={value !== null && value !== undefined ? value : ''}
                onChange={e => onChange(parseFloat(e.target.value) || 0)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    background: 'var(--color-control)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6, padding: suffix ? '5px 25px 5px 8px' : '6px 25px 6px 8px',
                    fontSize: 12, fontVariantNumeric: 'tabular-nums',
                    color: 'var(--color-text-primary)', outline: 'none',
                    transition: 'border-color 150ms ease-out',
                }}
                onFocus={e => e.target.style.borderColor = accentColor || 'var(--color-brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
            {suffix && (
                <span style={{
                    position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 9, color: 'var(--color-text-muted)', pointerEvents: 'none',
                }}>{suffix}</span>
            )}
        </div>
    </div>
)

export default NumericInput
