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

    // Si es scroll_area o floating_window, inicializar con lista vacía de triggers hijos
    if (type === 'scroll_area') {
        defaultData.triggers = [];
    }

    if (type === 'floating_window') {
        defaultData.triggers = [];
        defaultData.isDraggable = true;
    }

    if (type === 'table_grid') {
        defaultData.tableRawData = "Encabezado 1\\tEncabezado 2\\nFila 1 Col 1\\tFila 1 Col 2\\nFila 2 Col 1\\tFila 2 Col 2";
        defaultData.cellWidth = 33;
        defaultData.cellHeight = 25;
        defaultData.hasHeader = true;
        defaultData.headerBg = "#1E293B";
        defaultData.headerTextColor = "#FFFFFF";
        defaultData.oddRowBg = "#0F172A";
        defaultData.evenRowBg = "#111827";
        defaultData.borderColor = "#334155";
        defaultData.borderWidth = 1;
        defaultData.textAlign = "left";
        defaultData.fontSize = 4;
        defaultData.textColor = "#E2E8F0";
    }

    return defaultData;
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
        if ((t.type === 'scroll_area' || t.type === 'floating_window') && Array.isArray(t.triggers)) {
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
    floating_window: {
        bg: 'rgba(234, 187, 0, 0.1)', // Amarillo
        bgHover: 'rgba(234, 187, 0, 0.2)',
        bgActive: 'rgba(234, 187, 0, 0.3)',
        border: 'rgba(234, 187, 0, 0.4)',
        borderActive: 'rgba(234, 187, 0, 0.8)',
        label: '#F59E0B'
    },
    table_grid: {
        bg: 'rgba(124, 58, 237, 0.1)', // Violeta
        bgHover: 'rgba(124, 58, 237, 0.2)',
        bgActive: 'rgba(124, 58, 237, 0.3)',
        border: 'rgba(124, 58, 237, 0.4)',
        borderActive: 'rgba(124, 58, 237, 0.8)',
        label: '#8B5CF6'
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

export const TRIGGER_TYPES = ['click', 'double_click', 'input', 'input_date', 'dropdown', 'dependent_dropdown', 'keypress', 'scroll_area', 'floating_window', 'table_grid', 'radio', 'checkbox']

export const TRIGGER_LABELS = {
    click: 'Clic Simple',
    double_click: 'Doble Clic',
    input: 'Campo Texto',
    input_date: 'Campo Fecha',
    dropdown: 'Menú Desplegable',
    dependent_dropdown: 'Desplegable Anidado',
    keypress: 'Tecla Específica',
    scroll_area: 'Área Scroll',
    floating_window: 'Ventana Flotante',
    table_grid: 'Tabla/Grilla',
    radio: 'Opción Única',
    checkbox: 'Opciones Múltiples'
}
