import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import playerHtml from '../export/player.html?raw'

/**
 * Generates and downloads a ZIP file containing the standalone simulation player
 * and the serialized nodes/edges payload.
 */
export async function exportSimulator(originalNodes, originalEdges) {
    try {
        const zip = new JSZip()

        // Deep clone to avoid modifying the active React state
        const nodes = JSON.parse(JSON.stringify(originalNodes))
        const edges = JSON.parse(JSON.stringify(originalEdges))

        const assetsFolder = zip.folder('assets')
        let assetCounter = 1

        // Helper to extract base64 to assets folder
        const processBase64 = (dataUrl) => {
            if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return dataUrl

            // e.g. "data:image/png;base64,iVBORw..."
            const [header, base64Data] = dataUrl.split(',')
            const mimeMatch = header.match(/^data:([^;]+);/)
            if (!mimeMatch) return dataUrl

            const mimeType = mimeMatch[1]
            let ext = 'bin'
            if (mimeType === 'image/jpeg') ext = 'jpg'
            else if (mimeType === 'image/png') ext = 'png'
            else if (mimeType === 'video/mp4') ext = 'mp4'

            const filename = `media_${assetCounter++}.${ext}`

            // Add file to zip
            assetsFolder.file(filename, base64Data, { base64: true })

            // Return the relative path to be used in player.html
            return `./assets/${filename}`
        }

        // 1. Process Nodes and Triggers
        for (const node of nodes) {
            if (!node.data) continue

            // A) Main Node Image(s)
            if (node.data.image) {
                if (Array.isArray(node.data.image)) {
                    node.data.image = node.data.image.map(img => processBase64(img))
                } else {
                    node.data.image = processBase64(node.data.image)
                }
            }

            // B) Scroll Area Content Images
            if (node.data.triggers && Array.isArray(node.data.triggers)) {
                for (const trigger of node.data.triggers) {
                    if (trigger.type === 'scroll_area' && trigger.contentImage) {
                        trigger.contentImage = processBase64(trigger.contentImage)
                    }
                }
            }
        }

        // 2. Add the standalone player template at the root
        zip.file('index.html', playerHtml)

        // 3. Generate the optimized data payload
        const simDataJs = `window.SIM_DATA = ${JSON.stringify({ nodes, edges }, null, 2)};`
        const alldataFolder = zip.folder('alldata')
        alldataFolder.file('data.js', simDataJs)

        // 4. Generate the ZIP blob
        const blob = await zip.generateAsync({ type: 'blob' })

        // 4. Trigger download
        saveAs(blob, 'simulador.zip')

        return true
    } catch (error) {
        console.error('Error exporting simulator:', error)
        return false
    }
}
