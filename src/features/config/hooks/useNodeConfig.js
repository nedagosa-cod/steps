import { useState } from 'react'
import { normalizeTriggers, makeDefaultTrigger } from '../../../shared/utils/triggers'

export default function useNodeConfig(node, onUpdateNode, setEditingTriggerId) {
    const data = node ? node.data : {}
    const update = (patch) => {
        if (node && onUpdateNode) onUpdateNode(node.id, patch)
    }
    const triggers = normalizeTriggers(data)

    const setTriggers = (newTriggers) => update({ triggers: newTriggers })

    const updateTrigger = (idx, patch) =>
        setTriggers(triggers.map((t, i) => i === idx ? { ...t, ...patch } : t))

    const deleteTrigger = (idx) =>
        setTriggers(triggers.filter((_, i) => i !== idx))

    const addTrigger = (type) => {
        const newTrigger = makeDefaultTrigger(type)
        setTriggers([...triggers, newTrigger])
        if (setEditingTriggerId) setEditingTriggerId(newTrigger.id)
    }

    // Drag & Drop State and Handlers
    const [draggedIdx, setDraggedIdx] = useState(null)
    const [dragOverIdx, setDragOverIdx] = useState(null)

    const onDragStart = (e, idx) => {
        setDraggedIdx(idx)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setDragImage(e.currentTarget, 20, 20)
    }

    const onDragOver = (e, idx) => {
        e.preventDefault()
        if (draggedIdx !== null && draggedIdx !== idx) setDragOverIdx(idx)
    }

    const onDragLeave = () => setDragOverIdx(null)

    const onDrop = (e, idx) => {
        e.preventDefault()
        if (draggedIdx !== null && draggedIdx !== idx) {
            const newTriggers = [...triggers]
            const [draggedItem] = newTriggers.splice(draggedIdx, 1)
            newTriggers.splice(idx, 0, draggedItem)
            setTriggers(newTriggers)
        }
        setDraggedIdx(null)
        setDragOverIdx(null)
    }

    const onDragEnd = () => {
        setDraggedIdx(null)
        setDragOverIdx(null)
    }

    return {
        triggers,
        update,
        setTriggers,
        updateTrigger,
        deleteTrigger,
        addTrigger,
        dragProps: {
            draggedIdx,
            dragOverIdx,
            onDragStart,
            onDragOver,
            onDragLeave,
            onDrop,
            onDragEnd
        }
    }
}
