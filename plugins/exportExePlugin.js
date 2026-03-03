import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/**
 * Vite plugin that adds a POST /api/export-exe endpoint.
 * Receives { nodes, edges }, writes them into the electron template,
 * runs electron-builder, and returns the output path.
 */
export default function exportExePlugin() {
    return {
        name: 'export-exe',
        configureServer(server) {
            server.middlewares.use('/api/export-exe', async (req, res) => {
                if (req.method !== 'POST') {
                    res.statusCode = 405;
                    res.end(JSON.stringify({ error: 'Method not allowed' }));
                    return;
                }

                // Read the JSON body
                let body = '';
                for await (const chunk of req) body += chunk;

                try {
                    const { nodes, edges } = JSON.parse(body);

                    // ── Paths ─────────────────────────────────────────
                    const electronDir = path.join(ROOT, 'electron');
                    const appDir = path.join(electronDir, 'app');
                    const assetsDir = path.join(appDir, 'assets');
                    const alldataDir = path.join(appDir, 'alldata');

                    // Clean and recreate app directory
                    if (fs.existsSync(appDir)) fs.rmSync(appDir, { recursive: true });
                    fs.mkdirSync(appDir, { recursive: true });
                    fs.mkdirSync(assetsDir, { recursive: true });
                    fs.mkdirSync(alldataDir, { recursive: true });

                    // ── Deep clone nodes/edges for processing ─────────
                    const clonedNodes = JSON.parse(JSON.stringify(nodes));
                    const clonedEdges = JSON.parse(JSON.stringify(edges));
                    let assetCounter = 1;

                    // Extract base64 data URLs to real files
                    const processBase64 = (dataUrl) => {
                        if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return dataUrl;
                        const [header, base64Data] = dataUrl.split(',');
                        const mimeMatch = header.match(/^data:([^;]+);/);
                        if (!mimeMatch) return dataUrl;

                        const mimeType = mimeMatch[1];
                        let ext = 'bin';
                        if (mimeType === 'image/jpeg') ext = 'jpg';
                        else if (mimeType === 'image/png') ext = 'png';
                        else if (mimeType === 'video/mp4') ext = 'mp4';

                        const filename = `media_${assetCounter++}.${ext}`;
                        fs.writeFileSync(path.join(assetsDir, filename), Buffer.from(base64Data, 'base64'));
                        return `./assets/${filename}`;
                    };

                    for (const node of clonedNodes) {
                        if (!node.data) continue;
                        if (node.data.image) {
                            if (Array.isArray(node.data.image)) {
                                node.data.image = node.data.image.map(img => processBase64(img));
                            } else {
                                node.data.image = processBase64(node.data.image);
                            }
                        }
                        if (node.data.triggers && Array.isArray(node.data.triggers)) {
                            for (const trigger of node.data.triggers) {
                                if (trigger.type === 'scroll_area' && trigger.contentImage) {
                                    trigger.contentImage = processBase64(trigger.contentImage);
                                }
                            }
                        }
                    }

                    // ── Copy export template files into app/ ──────────
                    const exportDir = path.join(ROOT, 'src', 'export');
                    fs.copyFileSync(path.join(exportDir, 'index.html'), path.join(appDir, 'index.html'));
                    fs.copyFileSync(path.join(exportDir, 'styles.css'), path.join(appDir, 'styles.css'));
                    fs.copyFileSync(path.join(exportDir, 'app.js'), path.join(appDir, 'app.js'));

                    // ── Write data.js ─────────────────────────────────
                    const simDataJs = `window.SIM_DATA = ${JSON.stringify({ nodes: clonedNodes, edges: clonedEdges }, null, 2)};`;
                    fs.writeFileSync(path.join(alldataDir, 'data.js'), simDataJs, 'utf-8');

                    // ── Run electron-builder ──────────────────────────
                    console.log('[export-exe] Running electron-builder...');
                    const electronBuilderBin = path.join(ROOT, 'node_modules', '.bin', 'electron-builder');

                    execSync(
                        `"${electronBuilderBin}" --win portable --project "${electronDir}" --config.directories.output="${path.join(electronDir, 'dist')}"`,
                        {
                            cwd: electronDir,
                            stdio: 'inherit',
                            env: { ...process.env },
                            timeout: 300000, // 5 min timeout
                        }
                    );

                    // ── Find the output .exe ──────────────────────────
                    const distDir = path.join(electronDir, 'dist');
                    const exeFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.exe'));
                    const outputPath = exeFiles.length > 0 ? path.join(distDir, exeFiles[0]) : distDir;

                    console.log('[export-exe] Build complete:', outputPath);

                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        success: true,
                        outputPath: outputPath,
                        outputDir: distDir,
                    }));

                } catch (err) {
                    console.error('[export-exe] Error:', err);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: err.message || 'Build failed' }));
                }
            });
        }
    };
}
