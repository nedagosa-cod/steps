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

export function newTriggerId() {
    return `trigger-${Math.random().toString(36).substring(2, 9)}`
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
    const defaultData = {
        id: newTriggerId(),
        type,
        validationValue: '',
        hotspot: { x: 30, y: 40, w: 20, h: 10 },
    }
    
    // Si es scroll_area, inicializar con lista vacía de triggers hijos
    if (type === 'scroll_area') {
        defaultData.triggers = []
    }
    
    return defaultData
}

/**
 * Retorna todos los triggers obligatorios, incluyendo los que están anidados (ej. dentro de un scroll_area)
 */
export function getAllRequiredTriggers(triggersArray) {
    let required = []
    if (!Array.isArray(triggersArray)) return required

    for (const t of triggersArray) {
        if (!t.isOptional) required.push(t)
        
        // Búsqueda recursiva en triggers de áreas anidadas
        if (t.type === 'scroll_area' && Array.isArray(t.triggers)) {
            required = required.concat(getAllRequiredTriggers(t.triggers))
        }
    }
    return required
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
    double_click: {
        border: 'rgba(255,152,0,0.65)',
        bg: 'rgba(255,152,0,0.10)',
        borderActive: 'rgba(255,152,0,0.9)',
        bgActive: 'rgba(255,152,0,0.28)',
        label: '#ff9800',
    },
    input: {
        border: 'rgba(56,139,253,0.65)',
        bg: 'rgba(56,139,253,0.10)',
        borderActive: 'rgba(56,139,253,0.9)',
        bgActive: 'rgba(56,139,253,0.25)',
        label: '#388bfd',
    },
    keypress: {
        border: 'rgba(232,62,140,0.65)',
        bg: 'rgba(232,62,140,0.10)',
        borderActive: 'rgba(232,62,140,0.9)',
        bgActive: 'rgba(232,62,140,0.28)',
        label: '#e83e8c',
    },
    dropdown: {
        border: 'rgba(32,201,151,0.65)',
        bg: 'rgba(32,201,151,0.10)',
        borderActive: 'rgba(32,201,151,0.9)',
        bgActive: 'rgba(32,201,151,0.28)',
        label: '#20c997',
    },
    dependent_dropdown: {
        border: 'rgba(214,51,132,0.65)',
        bg: 'rgba(214,51,132,0.10)',
        borderActive: 'rgba(214,51,132,0.9)',
        bgActive: 'rgba(214,51,132,0.28)',
        label: '#d63384',
    },
    scroll_area: {
        border: 'rgba(16,185,129,0.65)',
        bg: 'rgba(16,185,129,0.10)',
        borderActive: 'rgba(16,185,129,0.9)',
        bgActive: 'rgba(16,185,129,0.28)',
        label: '#10b981',
    },
    radio: {
        border: 'rgba(251,146,60,0.65)',
        bg: 'rgba(251,146,60,0.10)',
        borderActive: 'rgba(251,146,60,0.9)',
        bgActive: 'rgba(251,146,60,0.28)',
        label: '#fb923c',
    },
    checkbox: {
        border: 'rgba(6,182,212,0.65)',
        bg: 'rgba(6,182,212,0.10)',
        borderActive: 'rgba(6,182,212,0.9)',
        bgActive: 'rgba(6,182,212,0.28)',
        label: '#06b6d4',
    },
    input_date: {
        border: 'rgba(156,39,176,0.65)',
        bg: 'rgba(156,39,176,0.10)',
        borderActive: 'rgba(156,39,176,0.9)',
        bgActive: 'rgba(156,39,176,0.28)',
        label: '#9c27b0',
    },
}

export const TRIGGER_LABELS = { click: 'Click', double_click: 'Doble Clic', input: 'Input', keypress: 'Tecla', dropdown: 'Lista', dependent_dropdown: 'Lista Dep.', scroll_area: 'Área Scroll', radio: 'Radio', checkbox: 'Checkbox', input_date: 'Calendario' }
