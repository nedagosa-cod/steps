/**
 * Client-side function to request an EXE build from the Vite dev server.
 * The actual packaging happens server-side via the exportExePlugin.
 */
export async function exportAsExe(nodes, edges, globalConfig = {}, onProgress) {
    try {
        let fileHandle = null;

        // 1. Mostrar Save As dialog (si es compatible) antes de iniciar algo pesado
        if (window.showSaveFilePicker) {
            try {
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'Simulador.exe',
                    types: [{
                        description: 'Executable File',
                        accept: { 'application/x-msdownload': ['.exe'] }
                    }]
                });
            } catch (err) {
                if (err.name === 'AbortError') {
                    // User cancelled the save dialog
                    return false;
                }
                console.warn('showSaveFilePicker error:', err);
            }
        }

        if (onProgress) onProgress('Preparando y enviando datos al servidor...');

        // 2. Hacer la solicitud de build (streaming)
        const response = await fetch('/api/export-exe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes, edges, globalConfig }),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        // 3. Procesar el chunked stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let finalOutputPath = null;
        let finalOutputDir = null;
        
        let buffer = '';

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            
            if (value) {
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (data.status === 'progress' && onProgress) {
                                onProgress(data.message);
                            } else if (data.status === 'done') {
                                finalOutputPath = data.outputPath;
                                finalOutputDir = data.outputDir;
                                if (onProgress) onProgress('✅ Empaquetado finalizado en el servidor.');
                            } else if (data.status === 'error') {
                                throw new Error(data.message);
                            }
                        } catch (e) {
                            if (e.message.includes('JSON')) {
                                if (onProgress) onProgress(line);
                            } else {
                                throw e;
                            }
                        }
                    }
                }
            }
        }

        // 4. Escribir/Descargar el archivo .exe final
        if (finalOutputPath) {
            if (onProgress) onProgress('Descargando archivo ejecutable al equipo local...');
            
            const downloadResponse = await fetch(`/api/download-exe?path=${encodeURIComponent(finalOutputPath)}`);
            if (!downloadResponse.ok) {
                throw new Error('No se pudo descargar el archivo EXE final desde el servidor');
            }

            if (fileHandle) {
                const writable = await fileHandle.createWritable();
                await downloadResponse.body.pipeTo(writable);
                if (onProgress) onProgress(`✅ EXE guardado exitosamente en: ${fileHandle.name}`);
                setTimeout(() => alert(`✅ EXE guardado exitosamente: ${fileHandle.name}`), 500);
            } else {
                // Fallback clásico
                const blob = await downloadResponse.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = 'Simulador.exe';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(downloadUrl);
                
                if (onProgress) onProgress(`✅ EXE descargado exitosamente.`);
                setTimeout(() => alert(`✅ EXE guardado en las Descargas.\nUbicación servidor: ${finalOutputDir}`), 500);
            }
            return true;
        }

        throw new Error('El servidor no devolvió la ruta del ejecutable');

    } catch (error) {
        console.error('Error exporting as EXE:', error);
        if (onProgress) onProgress(`❌ Error: ${error.message}`);
        setTimeout(() => alert(`❌ Error al generar el EXE:\n${error.message}`), 500);
        return false;
    }
}
