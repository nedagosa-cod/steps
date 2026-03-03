/**
 * Client-side function to request an EXE build from the Vite dev server.
 * The actual packaging happens server-side via the exportExePlugin.
 */
export async function exportAsExe(nodes, edges) {
    try {
        const response = await fetch('/api/export-exe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes, edges }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error || 'Error al generar el EXE');
        }

        alert(`✅ EXE generado exitosamente!\n\nUbicación:\n${result.outputDir}\n\nArchivo:\n${result.outputPath}`);
        return true;
    } catch (error) {
        console.error('Error exporting as EXE:', error);
        alert(`❌ Error al generar el EXE:\n${error.message}`);
        return false;
    }
}
