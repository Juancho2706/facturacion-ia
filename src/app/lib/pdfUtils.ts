import * as pdfjsLib from 'pdfjs-dist';

// Configurar el worker de PDF.js
// Usamos un CDN para evitar problemas de bundling con Next.js
// Asegúrate de que la versión coincida con la instalada en package.json
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPdf(url: string): Promise<string> {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            fullText += pageText + '\n';
        }

        return fullText;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('No se pudo extraer texto del PDF.');
    }
}
