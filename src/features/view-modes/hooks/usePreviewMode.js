import { useState, useCallback, useRef, useEffect } from 'react'
import { normalizeTriggers } from '../../../shared/utils/triggers'

export default function usePreviewMode(nodes, edges, globalConfig) {
    const startNode = nodes.find(n => n.data?.isStartNode === true)
        || nodes.find(n => !edges.some(e => e.target === n.id))
        || nodes[0]

    const [currentNodeId, setCurrentNodeId] = useState(startNode?.id)
    const [completedTriggers, setCompletedTriggers] = useState(new Set())
    const [inputValues, setInputValues] = useState({})
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [transitioning, setTransitioning] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(null)

    const timerRef = useRef(null)
    const hasTimerStarted = useRef(false)
    const containerRef = useRef(null)
    const inputRefs = useRef({})

    const currentNode = nodes.find(n => n.id === currentNodeId)

    const nodeOrder = (() => {
        const order = []
        let cursor = startNode?.id
        const visited = new Set()
        while (cursor && !visited.has(cursor)) {
            order.push(cursor)
            visited.add(cursor)
            cursor = edges.find(e => e.source === cursor)?.target
        }
        return order
    })()

    const stepIndex = nodeOrder.indexOf(currentNodeId)
    const totalSteps = nodeOrder.length

    const getNextNodeId = useCallback(() =>
        edges.find(e => e.source === currentNodeId)?.target
        , [currentNodeId, edges])

    const navigate = useCallback((targetId) => {
        setTransitioning(true)
        setError('')
        setSuccess(false)
        setInputValues(prev => ({ auth_name: prev['auth_name'] || '' }))
        setCompletedTriggers(new Set())

        const delay = globalConfig?.transitionEffect === 'none' ? 0 : 280
        setTimeout(() => {
            setCurrentNodeId(targetId)
            setTransitioning(false)
        }, delay)
    }, [globalConfig?.transitionEffect])

    const getTransitionStyles = () => {
        const effect = globalConfig.transitionEffect || 'fade'
        if (effect === 'none') return { transition: 'none', opacity: transitioning ? 0 : 1 }

        const baseTrans = 'opacity 250ms ease-out, transform 250ms ease-out, filter 250ms ease-out'
        switch (effect) {
            case 'zoom': return { transition: baseTrans, opacity: transitioning ? 0 : 1, transform: transitioning ? 'scale(0.95)' : 'scale(1)', filter: transitioning ? 'blur(4px)' : 'blur(0)' }
            case 'slide-left': return { transition: baseTrans, opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateX(30px)' : 'translateX(0)', filter: transitioning ? 'blur(2px)' : 'blur(0)' }
            case 'slide-right': return { transition: baseTrans, opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateX(-30px)' : 'translateX(0)', filter: transitioning ? 'blur(2px)' : 'blur(0)' }
            case 'slide-up': return { transition: baseTrans, opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(30px)' : 'translateY(0)', filter: transitioning ? 'blur(2px)' : 'blur(0)' }
            case 'fade':
            default: return { transition: baseTrans, opacity: transitioning ? 0 : 1, transform: 'none', filter: 'none' }
        }
    }

    const handleHighlightTrigger = useCallback((id) => {
        const el = document.getElementById(`trigger-${id}`)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            const oldBoxShadow = el.style.boxShadow
            let cycle = 0
            const interval = setInterval(() => {
                el.style.boxShadow = cycle % 2 === 0 ? '0 0 0 4px var(--color-brand), 0 0 20px var(--color-brand)' : oldBoxShadow
                cycle++
                if (cycle > 5) {
                    clearInterval(interval)
                    el.style.boxShadow = oldBoxShadow
                }
            }, 300)
        }
    }, [])

    const onTriggerComplete = useCallback((triggerId, allTriggers, silent = false) => {
        setCompletedTriggers(prev => {
            const next = new Set(prev)
            next.add(triggerId)

            if (silent) return next

            const delay = globalConfig?.transitionEffect === 'none' ? 10 : 350
            const completedTrigger = allTriggers.find(t => t.id === triggerId)

            if (completedTrigger && completedTrigger.navigateTarget) {
                setTimeout(() => navigate(completedTrigger.navigateTarget), delay)
                return next
            }

            const allDone = allTriggers.every(t => t.isOptional || next.has(t.id))
            if (allDone) {
                const nextId = getNextNodeId()
                if (nextId) setTimeout(() => navigate(nextId), delay)
                else setSuccess(true)
            }
            return next
        })
    }, [getNextNodeId, navigate, globalConfig?.transitionEffect])

    // Specific Action Handlers to be exported
    const handleClickTrigger = useCallback((trigger, triggers) => {
        if (completedTriggers.has(trigger.id)) return
        if (trigger.type === 'radio' && trigger.radioGroup) {
            triggers.forEach(t => {
                if (t.type === 'radio' && t.radioGroup === trigger.radioGroup && t.id !== trigger.id) {
                    onTriggerComplete(t.id, triggers, true)
                }
            })
        }
        onTriggerComplete(trigger.id, triggers)
    }, [completedTriggers, onTriggerComplete])

    const handleInputChange = useCallback((trigger, newValue, triggers) => {
        if (completedTriggers.has(trigger.id)) return
        const inputVal = (newValue || '').trim()
        const expected = (trigger.validationValue || '').trim()
        if (expected && inputVal === expected) {
            setError('')
            onTriggerComplete(trigger.id, triggers)
        }
    }, [completedTriggers, onTriggerComplete])

    const handleInputSubmit = useCallback((trigger, triggers) => {
        if (completedTriggers.has(trigger.id)) return
        const inputVal = (inputValues[trigger.id] || '').trim()
        const expected = (trigger.validationValue || '').trim()
        if (!expected || inputVal === expected) {
            setError('')
            onTriggerComplete(trigger.id, triggers)
        } else {
            setError('Texto incorrecto. Intenta de nuevo.')
            setTimeout(() => setError(''), 2200)
        }
    }, [completedTriggers, inputValues, onTriggerComplete])

    // Global keydown listener
    useEffect(() => {
        if (!currentNode || transitioning) return

        const handleGlobalKeyDown = (e) => {
            const currentTriggers = normalizeTriggers(currentNode.data)

            currentTriggers.forEach(t => {
                if (t.type !== 'keypress') return
                if (completedTriggers.has(t.id)) return

                const isBlocked = t.dependsOn && !completedTriggers.has(t.dependsOn)
                if (isBlocked) return

                const expectedKey = t.keyCode || ''
                const pressedKey = e.key === ' ' ? 'Space' : e.key

                if (pressedKey.toLowerCase() === expectedKey.toLowerCase()) {
                    if (['Space', 'Enter', 'ArrowUp', 'ArrowDown'].includes(pressedKey)) {
                        e.preventDefault()
                    }
                    onTriggerComplete(t.id, currentTriggers)
                }
            })
        }

        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [currentNode, completedTriggers, transitioning, onTriggerComplete])

    // Timer Logic
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    useEffect(() => {
        if (!currentNode) return

        const { timerMin, timerMax } = globalConfig
        if ((!timerMin || timerMin <= 0) && (!timerMax || timerMax <= 0)) {
            if (timerRef.current) clearInterval(timerRef.current)
            timerRef.current = null
            setTimeRemaining(null)
            hasTimerStarted.current = false
            return
        }

        if (currentNode.data?.timerEnd) {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        } else if (currentNode.data?.timerStart && !hasTimerStarted.current) {
            hasTimerStarted.current = true
            let timeToSet = 0
            if (timerMin > 0 && timerMax > 0 && timerMax >= timerMin) {
                timeToSet = Math.floor(Math.random() * (timerMax - timerMin + 1)) + timerMin
            } else if (timerMax > 0) {
                timeToSet = timerMax
            } else if (timerMin > 0) {
                timeToSet = timerMin
            }

            setTimeRemaining(timeToSet)

            if (timeToSet > 0) {
                if (timerRef.current) clearInterval(timerRef.current)
                timerRef.current = setInterval(() => {
                    setTimeRemaining((prev) => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current)
                            timerRef.current = null
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
            }
        }
    }, [currentNodeId, currentNode, globalConfig])

    // Fullscreen behavior
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.warn(`Error al intentar pantalla completa: ${err.message}`)
            })
        } else {
            document.exitFullscreen()
        }
    }

    return {
        state: { currentNode, currentNodeId, stepIndex, totalSteps, nodeOrder, completedTriggers, inputValues, error, success, transitioning, isFullscreen, timeRemaining },
        refs: { containerRef, inputRefs },
        actions: {
            setError, setInputValues,
            onTriggerComplete, navigate, handleHighlightTrigger,
            handleClickTrigger, handleInputChange, handleInputSubmit,
            toggleFullscreen, getTransitionStyles, getNextNodeId
        }
    }
}
