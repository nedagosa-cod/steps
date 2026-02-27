import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import playerHtml from '../export/player.html?raw'

/**
 * Generates and downloads a ZIP file containing the standalone simulation player
 * and the serialized nodes/edges payload.
 */
export async function exportSimulator(nodes, edges) {
    try {
        const zip = new JSZip()

        // 1. Add the standalone player template at the root
        zip.file('index.html', playerHtml)

        // 2. Generate the data payload as a JavaScript file assigning a global variable.
        // This circumvents local CORS restrictions when opening index.html via file://
        const simDataJs = `window.SIM_DATA = ${JSON.stringify({ nodes, edges }, null, 2)};`

        // Put it inside an alldata folder
        const alldataFolder = zip.folder('alldata')
        alldataFolder.file('data.js', simDataJs)

        // 3. Generate the ZIP blob
        const blob = await zip.generateAsync({ type: 'blob' })

        // 4. Trigger download
        saveAs(blob, 'simulador.zip')

        return true
    } catch (error) {
        console.error('Error exporting simulator:', error)
        return false
    }
}
