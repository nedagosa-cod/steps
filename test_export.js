import { JSZip } from 'jszip' // mock
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

try {
    const htmlPath = join(process.cwd(), 'src/export/player.html')
    const htmlMap = readFileSync(htmlPath, 'utf8')
    console.log("HTML Player read successfully. Length:", htmlMap.length)
} catch (e) {
    console.error("Error reading html:", e)
}
