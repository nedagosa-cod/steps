import { useRef, useCallback, useEffect } from 'react'

// ── Configuration ────────────────────────────────────────────────
const MAX_HISTORY = 40      // Maximum snapshots to keep in memory
const DEBOUNCE_MS = 400     // Debounce rapid changes (e.g. typing)

/**
 * useHistory — Undo / Redo system for nodes + edges state.
 *
 * How it works:
 *  1. After every meaningful state change, a snapshot of { nodes, edges }
 *     is pushed onto the history stack (debounced to avoid flooding).
 *  2. Ctrl+Z pops back, Ctrl+Y moves forward.
 *  3. While undoing/redoing, snapshot recording is paused so the
 *     restoration itself doesn't create a new entry.
 *
 * @param {Array}    nodes    – current ReactFlow nodes
 * @param {Array}    edges    – current ReactFlow edges
 * @param {Function} setNodes – ReactFlow setNodes
 * @param {Function} setEdges – ReactFlow setEdges
 * @param {Object}   [options]
 * @param {Function} [options.patchEdge] – called on each edge after restore
 *        to re-inject non-serializable data (e.g. callback functions)
 * @returns {{ undo, redo, canUndo, canRedo }}
 */
export default function useHistory(nodes, edges, setNodes, setEdges, options = {}) {
    const { patchEdge } = options
    // ── Internal refs (stable across renders) ───────────────────────
    const history = useRef([])       // Array of { nodes, edges } snapshots
    const pointer = useRef(-1)       // Current position in history stack
    const isRestoring = useRef(false) // True while applying undo/redo
    const debounceTimer = useRef(null)

    // ── Safe deep-clone (JSON strips non-serializable values like functions) ──
    const clone = (obj) => JSON.parse(JSON.stringify(obj))

    const snapshot = useCallback(() => ({
        nodes: clone(nodes),
        edges: clone(edges),
    }), [nodes, edges])

    // ── Record a snapshot into the history stack ────────────────────
    const record = useCallback(() => {
        if (isRestoring.current) return

        // Discard any "future" entries after the current pointer
        history.current = history.current.slice(0, pointer.current + 1)

        // Push a deep clone of the current state
        history.current.push(snapshot())
        pointer.current = history.current.length - 1

        // Cap the stack size
        if (history.current.length > MAX_HISTORY) {
            history.current.shift()
            pointer.current--
        }
    }, [snapshot])

    // ── Debounced recording — watches nodes & edges changes ─────────
    useEffect(() => {
        if (isRestoring.current) return

        clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(() => {
            record()
        }, DEBOUNCE_MS)

        return () => clearTimeout(debounceTimer.current)
    }, [nodes, edges, record])

    // ── Initialize history with the very first state ────────────────
    useEffect(() => {
        if (history.current.length === 0) {
            history.current.push(snapshot())
            pointer.current = 0
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Restore a snapshot at a given pointer position ──────────────
    const restore = useCallback((index) => {
        const entry = history.current[index]
        if (!entry) return

        isRestoring.current = true
        pointer.current = index

        setNodes(clone(entry.nodes))

        // Re-inject non-serializable data (callbacks) into edges
        const restoredEdges = patchEdge
            ? entry.edges.map(e => patchEdge(clone(e)))
            : clone(entry.edges)
        setEdges(restoredEdges)

        // Re-enable recording after React has flushed the state updates
        requestAnimationFrame(() => {
            isRestoring.current = false
        })
    }, [setNodes, setEdges, patchEdge])

    // ── Public API ──────────────────────────────────────────────────
    const undo = useCallback(() => {
        if (pointer.current > 0) {
            restore(pointer.current - 1)
        }
    }, [restore])

    const redo = useCallback(() => {
        if (pointer.current < history.current.length - 1) {
            restore(pointer.current + 1)
        }
    }, [restore])

    const canUndo = pointer.current > 0
    const canRedo = pointer.current < history.current.length - 1

    // ── Keyboard shortcuts ──────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isCtrl = e.ctrlKey || e.metaKey

            // Ctrl+Z — Undo
            if (isCtrl && e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                undo()
            }
            // Ctrl+Y or Ctrl+Shift+Z — Redo
            if (isCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault()
                redo()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [undo, redo])

    return { undo, redo, canUndo, canRedo }
}
