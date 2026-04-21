import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath, URL } from 'url';

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
            // ---- NUEVO ENDPOINT PARA DESCARGAR EL EXE ----
            server.middlewares.use('/api/download-exe', (req, res) => {
                if (req.method !== 'GET') return;
                const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                const filePath = url.searchParams.get('path');
                
                if (!filePath || !fs.existsSync(filePath)) {
                    res.statusCode = 404;
                    res.end('Archivo no encontrado');
                    return;
                }
                
                res.setHeader('Content-Disposition', 'attachment; filename="Simulador.exe"');
                res.setHeader('Content-Type', 'application/octet-stream');
                
                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
            });

            server.middlewares.use('/api/export-exe', async (req, res) => {
                if (req.method !== 'POST') {
                    res.statusCode = 405;
                    res.end(JSON.stringify({ error: 'Method not allowed' }));
                    return;
                }

                // Streaming context
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Transfer-Encoding', 'chunked');

                const writeProgress = (message) => {
                    res.write(JSON.stringify({ status: 'progress', message }) + '\n');
                };

                // Read the JSON body
                let body = '';
                for await (const chunk of req) body += chunk;

                try {
                    const { nodes, edges } = JSON.parse(body);
                    writeProgress('Iniciando proceso de exportación a EXE...');

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
                    writeProgress('Ejecutando proceso de empaquetado (esto puede tardar unos minutos)...');
                    const electronBuilderBin = path.join(ROOT, 'node_modules', '.bin', 'electron-builder');

                    const child = spawn(electronBuilderBin, [
                        '--win', 'portable',
                        '--project', electronDir,
                        `--config.directories.output=${path.join(electronDir, 'dist')}`
                    ], {
                        cwd: electronDir,
                        env: { ...process.env },
                        shell: process.platform === 'win32' // Required to run node modules bins on Windows
                    });

                    child.stdout.on('data', (data) => {
                        const str = data.toString();
                        str.split('\n').forEach(line => {
                            if (line.trim()) writeProgress(line.trim());
                        });
                    });

                    child.stderr.on('data', (data) => {
                        const str = data.toString();
                        str.split('\n').forEach(line => {
                            if (line.trim()) writeProgress(line.trim());
                        });
                    });

                    child.on('close', (code) => {
                        if (code !== 0) {
                            res.write(JSON.stringify({ status: 'error', message: `El proceso falló con código ${code}` }) + '\n');
                            res.end();
                            return;
                        }

                        // ── Find the output .exe ──────────────────────────
                        const distDir = path.join(electronDir, 'dist');
                        const exeFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.exe'));
                        const outputPath = exeFiles.length > 0 ? path.join(distDir, exeFiles[0]) : distDir;

                        writeProgress('¡Proceso de empaquetado finalizado con éxito!');

                        res.write(JSON.stringify({
                            status: 'done',
                            outputPath: outputPath,
                            outputDir: distDir,
                        }) + '\n');
                        res.end();
                    });

                } catch (err) {
                    console.error('[export-exe] Error:', err);
                    if (!res.headersSent) {
                        res.statusCode = 500;
                    }
                    res.write(JSON.stringify({ status: 'error', message: err.message || 'Error en el proceso de empaquetado' }) + '\n');
                    res.end();
                }
            });
        }
    };
}
