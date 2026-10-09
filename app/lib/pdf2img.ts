export interface PdfConversionResult {
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        // Set the worker source to use local file
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        return lib;
    }).catch((error) => {
        loadPromise = null;
        throw error;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    let pdf: any = null;
    try {
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        // Use scale 2 instead of 4 for better performance while maintaining good quality
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (!context) throw new Error('Unable to create a canvas for the PDF preview.');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        await page.render({ canvasContext: context!, viewport }).promise;

        return await new Promise<PdfConversionResult>((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create a File from the blob with the same name as the pdf
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.jpg`, {
                            type: "image/jpeg",
                        });

                        resolve({
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/jpeg",
                0.85
            ); // Use JPEG with 85% quality for better compression
        });
    } catch (err) {
        return {
            file: null,
            error: `Failed to convert PDF: ${err}`,
        };
    } finally {
        if (pdf) {
            try { await pdf.destroy(); } catch { /* Cleanup must not prevent a successful preview or retry. */ }
        }
    }
}
