import { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric'

export default function useImageEditor(imageUrl) {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const [fabricCanvas, setFabricCanvas] = useState(null)
    const [color, setColor] = useState('#ff3b30') // Default red
    const [fillColor, setFillColor] = useState('transparent') // Default transparent
    const [isFillMode, setIsFillMode] = useState(false)
    const [brushSize, setBrushSize] = useState(5)
    const [blurIntensity, setBlurIntensity] = useState(16) // Default blur radius in px

    // Tools: 'select', 'draw', 'text', 'rect', 'circle', 'crop', 'blur_brush', 'blur_rect'
    const [activeTool, setActiveTool] = useState('select')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const cropRectRef = useRef(null)
    const blurLayerRef = useRef(null)

    // History stack for Undo/Redo
    const [history, setHistory] = useState([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const isHistoryUpdating = useRef(false)

    // 1. Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return

        const container = containerRef.current
        const c = new fabric.Canvas(canvasRef.current)

        c.setDimensions({
            width: container.clientWidth,
            height: container.clientHeight - 60
        })

        c.selection = true
        c.preserveObjectStacking = true
        c.isDrawingMode = false

        setFabricCanvas(c)

        const resizeObserver = new ResizeObserver(() => {
            if (!c) return
            c.setDimensions({
                width: container.clientWidth,
                height: container.clientHeight - 60
            })
            c.renderAll()
        })
        resizeObserver.observe(container)

        // Load background image
        if (imageUrl) {
            const isVideo = imageUrl.startsWith('data:video/') || imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm');
            if (isVideo) {
                console.error("ImageEditor: Attempted to load a video URL as an image.");
                return;
            }

            fabric.Image.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
                // Scale image to fit canvas proportionally
                const scaleX = c.width / img.width
                const scaleY = c.height / img.height
                const scale = Math.min(scaleX, scaleY, 1) // don't upscale beyond original

                img.scale(scale)

                // Center the image
                img.set({
                    originX: 'center',
                    originY: 'center',
                    left: c.width / 2,
                    top: c.height / 2
                })
                c.backgroundImage = img

                // Create the blurred layer
                const blurImg = createBlurredLayer(img, blurIntensity)
                blurImg.set({
                    originX: 'center', originY: 'center',
                    left: c.width / 2, top: c.height / 2,
                    selectable: false, evented: false
                })

                // Group to hold the mask
                const clipGroup = new fabric.Group([], { absolutePositioned: true })
                blurImg.clipPath = clipGroup
                blurLayerRef.current = blurImg

                c.add(blurImg)
                c.sendObjectToBack(blurImg) // Send to back but above background

                c.renderAll()

                // Initialize history after loading image
                saveHistoryState(c)
            }).catch(err => {
                console.error("Error loading image in Fabric:", err)
            })
        } else {
            c.backgroundColor = '#ffffff'
            c.renderAll()
            saveHistoryState(c)
        }

        return () => {
            resizeObserver.disconnect()
            c.dispose()
        }
    }, [imageUrl])

    // History Tracking logic
    const saveHistoryState = (canvasObj = fabricCanvas) => {
        if (!canvasObj || isHistoryUpdating.current) return

        isHistoryUpdating.current = true // Prevent infinite loops when removing/adding blur layer

        // Temporarily remove blur layer to prevent serializing a huge image twice
        const blurLyr = blurLayerRef.current
        if (blurLyr) canvasObj.remove(blurLyr)

        const json = JSON.stringify(canvasObj.toJSON(['isBlurShape']))

        if (blurLyr) {
            canvasObj.add(blurLyr)
            canvasObj.sendObjectToBack(blurLyr)
        }

        isHistoryUpdating.current = false

        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1)
            newHistory.push(json)
            setHistoryIndex(newHistory.length - 1)
            return newHistory
        })
    }

    // Helper: Create a heavily blurred version of the background image
    const createBlurredLayer = (sourceImg, intensity = blurIntensity) => {
        const offscreen = document.createElement('canvas')
        offscreen.width = sourceImg.width
        offscreen.height = sourceImg.height
        const ctx = offscreen.getContext('2d')
        ctx.filter = `blur(${intensity}px)`
        ctx.drawImage(sourceImg.getElement(), 0, 0, offscreen.width, offscreen.height)

        const fabricImg = new fabric.Image(offscreen, {
            scaleX: sourceImg.scaleX,
            scaleY: sourceImg.scaleY
        })
        return fabricImg
    }

    // Effect to update blur intensity dynamically
    useEffect(() => {
        if (!fabricCanvas || !blurLayerRef.current) return

        const bg = fabricCanvas.backgroundImage
        if (!bg) return

        // Temporarily detach old clipPath
        const oldClipPath = blurLayerRef.current.clipPath
        fabricCanvas.remove(blurLayerRef.current)

        const newBlurImg = createBlurredLayer(bg, blurIntensity)
        newBlurImg.set({
            originX: 'center', originY: 'center',
            left: fabricCanvas.width / 2, top: fabricCanvas.height / 2,
            selectable: false, evented: false
        })

        // Reattach old mask
        newBlurImg.clipPath = oldClipPath
        blurLayerRef.current = newBlurImg

        fabricCanvas.add(newBlurImg)
        fabricCanvas.sendObjectToBack(newBlurImg)
        fabricCanvas.renderAll()
    }, [blurIntensity]) // Specifically run only when intensity changes

    // Helper: Sync blur shapes to the mask
    const syncBlurLayer = () => {
        if (!fabricCanvas || !blurLayerRef.current) return

        const shapes = fabricCanvas.getObjects().filter(o => o.isBlurShape)

        // Clone shapes securely for the clipGroup
        Promise.all(shapes.map(s => s.clone())).then(clonedShapes => {
            clonedShapes.forEach((c, idx) => {
                const original = shapes[idx]
                // Make the clone solid so it masks the blur fully, regardless of drawing opacity
                c.set({
                    fill: original.fill === 'transparent' ? 'transparent' : 'black',
                    stroke: original.stroke ? 'black' : null,
                    opacity: 1,
                    absolutePositioned: true
                })
            })
            const group = new fabric.Group(clonedShapes, { absolutePositioned: true })
            blurLayerRef.current.clipPath = group
            fabricCanvas.renderAll()
        })
    }

    // Attach canvas events to autosave history and sync blur
    useEffect(() => {
        if (!fabricCanvas) return

        const handleModify = (e) => {
            if (e.target && e.target.isBlurShape) syncBlurLayer()
            saveHistoryState()
        }

        const handlePathCreated = (e) => {
            if (activeTool === 'blur_brush') {
                e.path.set({
                    isBlurShape: true,
                    opacity: 0.4, // Semi-transparent grey in the UI so user sees what they drew
                    stroke: '#888888',
                    globalCompositeOperation: 'source-over'
                })
                syncBlurLayer()
            }
            saveHistoryState()
        }

        fabricCanvas.on('object:added', handleModify)
        fabricCanvas.on('object:modified', handleModify)
        fabricCanvas.on('object:removed', handleModify)
        fabricCanvas.on('path:created', handlePathCreated)

        return () => {
            fabricCanvas.off('object:added', handleModify)
            fabricCanvas.off('object:modified', handleModify)
            fabricCanvas.off('object:removed', handleModify)
            fabricCanvas.off('path:created', handlePathCreated)
        }
    }, [fabricCanvas, historyIndex, activeTool]) // Re-bind when historyIndex changes to slice correctly

    // 2. Toolbar Actions
    const handleUndo = () => {
        if (!fabricCanvas || historyIndex <= 0) return

        isHistoryUpdating.current = true
        const prevIndex = historyIndex - 1
        const json = history[prevIndex]

        const blurLyr = blurLayerRef.current
        if (blurLyr) fabricCanvas.remove(blurLyr)

        fabricCanvas.loadFromJSON(json, () => {
            if (blurLyr) {
                fabricCanvas.add(blurLyr)
                fabricCanvas.sendObjectToBack(blurLyr)
                syncBlurLayer() // re-sync clip mask after loading objects
            }
            fabricCanvas.renderAll()
            setHistoryIndex(prevIndex)
            isHistoryUpdating.current = false
        })
    }

    const handleRedo = () => {
        if (!fabricCanvas || historyIndex >= history.length - 1) return

        isHistoryUpdating.current = true
        const nextIndex = historyIndex + 1
        const json = history[nextIndex]

        const blurLyr = blurLayerRef.current
        if (blurLyr) fabricCanvas.remove(blurLyr)

        fabricCanvas.loadFromJSON(json, () => {
            if (blurLyr) {
                fabricCanvas.add(blurLyr)
                fabricCanvas.sendObjectToBack(blurLyr)
                syncBlurLayer()
            }
            fabricCanvas.renderAll()
            setHistoryIndex(nextIndex)
            isHistoryUpdating.current = false
        })
    }

    const handleClear = () => {
        if (!fabricCanvas) return
        if (window.confirm('¿Borrar todos los dibujos y figuras?')) {
            // we clear objects but keep background
            fabricCanvas.clear()
            if (imageUrl) {
                fabric.Image.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
                    const scaleX = fabricCanvas.width / img.width
                    const scaleY = fabricCanvas.height / img.height
                    const scale = Math.min(scaleX, scaleY, 1)
                    img.scale(scale)
                    img.set({
                        originX: 'center', originY: 'center',
                        left: fabricCanvas.width / 2, top: fabricCanvas.height / 2
                    })
                    fabricCanvas.backgroundImage = img

                    const blurImg = createBlurredLayer(img, blurIntensity)
                    blurImg.set({
                        originX: 'center', originY: 'center',
                        left: fabricCanvas.width / 2, top: fabricCanvas.height / 2,
                        selectable: false, evented: false
                    })
                    const clipGroup = new fabric.Group([], { absolutePositioned: true })
                    blurImg.clipPath = clipGroup
                    blurLayerRef.current = blurImg
                    fabricCanvas.add(blurImg)
                    fabricCanvas.sendObjectToBack(blurImg)

                    fabricCanvas.renderAll()
                    saveHistoryState()
                })
            } else {
                fabricCanvas.backgroundColor = '#ffffff'
                fabricCanvas.renderAll()
                saveHistoryState()
            }
        }
    }

    const addText = () => {
        if (!fabricCanvas) return
        setActiveTool('select') // Switch back to select after adding
        fabricCanvas.isDrawingMode = false

        const text = new fabric.IText('Texto nuevo', {
            left: fabricCanvas.width / 2,
            top: fabricCanvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Inter',
            fill: color,
            fontSize: 24,
            fontWeight: 'bold'
        })
        fabricCanvas.add(text)
        fabricCanvas.setActiveObject(text)
        text.enterEditing()
        text.selectAll()
        fabricCanvas.renderAll()
    }

    const addRect = (isBlur = false) => {
        if (!fabricCanvas) return
        setActiveTool('select')
        fabricCanvas.isDrawingMode = false

        const rect = new fabric.Rect({
            left: fabricCanvas.width / 2,
            top: fabricCanvas.height / 2,
            originX: 'center',
            originY: 'center',
            fill: isBlur ? 'rgba(128,128,128,0.4)' : fillColor,
            stroke: isBlur ? null : (color === 'transparent' ? null : color),
            strokeWidth: isBlur ? 0 : (color === 'transparent' ? 0 : brushSize),
            width: 100,
            height: 100,
            isBlurShape: isBlur
        })
        fabricCanvas.add(rect)
        fabricCanvas.setActiveObject(rect)
        fabricCanvas.renderAll()
        if (isBlur) syncBlurLayer()
    }

    const addCircle = () => {
        if (!fabricCanvas) return
        setActiveTool('select')
        fabricCanvas.isDrawingMode = false

        const circle = new fabric.Circle({
            left: fabricCanvas.width / 2,
            top: fabricCanvas.height / 2,
            originX: 'center',
            originY: 'center',
            fill: fillColor,
            stroke: color === 'transparent' ? null : color,
            strokeWidth: color === 'transparent' ? 0 : brushSize,
            radius: 50
        })
        fabricCanvas.add(circle)
        fabricCanvas.setActiveObject(circle)
        fabricCanvas.renderAll()
    }

    // 3. Tool State Sync & Crop Overlay
    useEffect(() => {
        if (!fabricCanvas) return

        // Remove previous crop rect if exists and we are not cropping
        if (activeTool !== 'crop' && cropRectRef.current) {
            fabricCanvas.remove(cropRectRef.current)
            cropRectRef.current = null
            fabricCanvas.renderAll()
        }

        if (activeTool === 'draw' || activeTool === 'blur_brush') {
            fabricCanvas.isDrawingMode = true

            // In Fabric v6, freeDrawingBrush might not be initialized by default
            if (!fabricCanvas.freeDrawingBrush) {
                fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas)
            }

            if (activeTool === 'blur_brush') {
                fabricCanvas.freeDrawingBrush.color = 'rgba(128,128,128,0.4)'
                fabricCanvas.freeDrawingBrush.width = Math.max(brushSize * 4, 20) // Blur brush should be fat
            } else {
                fabricCanvas.freeDrawingBrush.color = color
                fabricCanvas.freeDrawingBrush.width = brushSize
            }

            // Deactivate objects
            fabricCanvas.discardActiveObject()

        } else if (activeTool === 'crop') {
            fabricCanvas.isDrawingMode = false

            // Add crop rectangle overlay
            const bg = fabricCanvas.backgroundImage
            if (bg && !cropRectRef.current) {
                const rect = new fabric.Rect({
                    left: bg.left,
                    top: bg.top,
                    originX: 'center',
                    originY: 'center',
                    width: bg.width * bg.scaleX * 0.8,
                    height: bg.height * bg.scaleY * 0.8,
                    fill: 'rgba(0,0,0,0.3)',
                    stroke: '#fff',
                    strokeDashArray: [5, 5],
                    strokeWidth: 2,
                    cornerColor: '#fff',
                    cornerStrokeColor: '#000',
                    transparentCorners: false,
                    cornerStyle: 'circle',
                    hasRotatingPoint: false,
                    lockRotation: true
                })
                cropRectRef.current = rect
                fabricCanvas.add(rect)
                fabricCanvas.setActiveObject(rect)
            }
        } else {
            fabricCanvas.isDrawingMode = false
        }

    }, [activeTool, color, brushSize, fabricCanvas])

    const applyCrop = () => {
        const cropRect = cropRectRef.current

        // Hide the crop rectangle so it doesn't get baked into the export
        cropRect.set({ visible: false })
        fabricCanvas.renderAll()

        // We export the cropped area as a dataUrl, then reload it as the new background
        const dataUrl = fabricCanvas.toDataURL({
            format: 'jpeg',
            quality: 0.95,
            left: cropRect.left - (cropRect.width * cropRect.scaleX) / 2,
            top: cropRect.top - (cropRect.height * cropRect.scaleY) / 2,
            width: cropRect.width * cropRect.scaleX,
            height: cropRect.height * cropRect.scaleY
        })

        // Remove everything (we flatten the cropped result into the new background)
        fabricCanvas.clear()
        cropRectRef.current = null
        setActiveTool('select')

        fabric.Image.fromURL(dataUrl, { crossOrigin: 'anonymous' }).then((img) => {
            // Center the new cropped image
            img.set({
                originX: 'center', originY: 'center',
                left: fabricCanvas.width / 2, top: fabricCanvas.height / 2
            })
            fabricCanvas.backgroundImage = img
            fabricCanvas.renderAll()
            saveHistoryState()
        })
    }

    // Update active object colors
    useEffect(() => {
        if (!fabricCanvas) return
        const activeObj = fabricCanvas.getActiveObject()
        if (activeObj && activeTool === 'select') {
            if (activeObj.type === 'i-text') {
                activeObj.set('fill', color)
            } else {
                activeObj.set('stroke', color === 'transparent' ? null : color)
                activeObj.set('strokeWidth', color === 'transparent' ? 0 : brushSize)
                activeObj.set('fill', fillColor)
            }
            fabricCanvas.renderAll()
            saveHistoryState()
        }
    }, [color, fillColor, brushSize])

    // Delete handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                if (!fabricCanvas) return
                const activeObj = fabricCanvas.getActiveObject()
                // Don't delete if we are actively editing text
                if (activeObj && !activeObj.isEditing) {
                    fabricCanvas.remove(activeObj)
                    fabricCanvas.discardActiveObject()
                    fabricCanvas.renderAll()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [fabricCanvas])

    // 4. Save Image
    const generateExportImage = () => {
        if (!fabricCanvas) return null
        // Discard active object so selection handles don't get saved
        fabricCanvas.discardActiveObject()

        // Hide UI blur shapes so only the true blurred background shines through
        const blurShapes = fabricCanvas.getObjects().filter(o => o.isBlurShape)
        blurShapes.forEach(s => s.set({ opacity: 0 }))

        fabricCanvas.renderAll()

        // Export only the bounding box of the background image, or the whole canvas if none
        const bg = fabricCanvas.backgroundImage
        let dataUrl

        if (bg) {
            dataUrl = fabricCanvas.toDataURL({
                format: 'jpeg',
                quality: 0.95,
                left: bg.left - (bg.width * bg.scaleX) / 2,
                top: bg.top - (bg.height * bg.scaleY) / 2,
                width: bg.width * bg.scaleX,
                height: bg.height * bg.scaleY,
                multiplier: 1 / bg.scaleX // Save at original scale loosely
            })
        } else {
            dataUrl = fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.95 })
        }

        // Restore UI blur shapes
        blurShapes.forEach(s => s.set({ opacity: 0.4 }))
        fabricCanvas.renderAll()

        return dataUrl
    }

    // Fullscreen toggle
    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', handleFsChange)
        return () => document.removeEventListener('fullscreenchange', handleFsChange)
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(() => { })
        } else {
            document.exitFullscreen()
        }
    }

    const openEyeDropper = async () => {
        if (!window.EyeDropper) {
            alert('Tu navegador no soporta la herramienta cuentagotas.')
            return
        }
        try {
            const eyeDropper = new window.EyeDropper()
            const result = await eyeDropper.open()
            if (isFillMode) setFillColor(result.sRGBHex)
            else setColor(result.sRGBHex)
        } catch (e) {
            // User aborted
        }
    }

    return {
        refs: { containerRef, canvasRef },
        state: { color, fillColor, isFillMode, blurIntensity, activeTool, isFullscreen, historyIndex, historyLen: history.length },
        actions: {
            setColor, setFillColor, setIsFillMode, setBrushSize, setBlurIntensity, setActiveTool,
            handleUndo, handleRedo, handleClear, addText, addRect, addCircle, applyCrop,
            generateExportImage, openEyeDropper, toggleFullscreen
        }
    }
}
