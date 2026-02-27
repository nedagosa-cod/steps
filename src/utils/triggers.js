/**
 * Trigger utilities — source of truth for the multi-trigger data model.
 *
 * Every trigger has a hotspot (x,y,w,h in % of image) regardless of type.
 * In preview mode:
 *   - 'click' → clicking the area completes the trigger
 *   - 'input' → an input field is rendered overlaid on the area; typing the
 *               correct validationValue completes the trigger
 *
 * Data shape:
 *   { id, type: 'click'|'input', hotspot: { x, y, w, h }, validationValue?: string }
 */

let _counter = 1

export function newTriggerId() {
    return `trigger-${_counter++}`
}

export function normalizeTriggers(data) {
    if (Array.isArray(data.triggers) && data.triggers.length > 0) {
        // Ensure every legacy trigger has a hotspot
        return data.triggers.map(t => ({
            hotspot: { x: 40, y: 40, w: 20, h: 10 },
            ...t,
        }))
    }
    // Legacy single-trigger migration
    if (data.triggerType) {
        return [{
            id: newTriggerId(),
            type: data.triggerType,
            validationValue: data.validationValue || '',
            hotspot: data.hotspot || { x: 40, y: 40, w: 20, h: 10 },
        }]
    }
    return []
}

export function makeDefaultTrigger(type = 'click') {
    return {
        id: newTriggerId(),
        type,
        validationValue: '',
        hotspot: { x: 30, y: 40, w: 20, h: 10 },
    }
}

// Color scheme per trigger type (for editor overlays)
export const TRIGGER_COLORS = {
    click: {
        border: 'rgba(124,92,252,0.65)',
        bg: 'rgba(124,92,252,0.12)',
        borderActive: 'rgba(124,92,252,0.9)',
        bgActive: 'rgba(124,92,252,0.28)',
        label: '#7c5cfc',
    },
    input: {
        border: 'rgba(56,139,253,0.65)',
        bg: 'rgba(56,139,253,0.10)',
        borderActive: 'rgba(56,139,253,0.9)',
        bgActive: 'rgba(56,139,253,0.25)',
        label: '#388bfd',
    },
}

export const TRIGGER_LABELS = { click: 'Click', input: 'Input' }
