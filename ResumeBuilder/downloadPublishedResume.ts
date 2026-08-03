const DEFAULT_FILENAME = "Riley-Beenders-Resume.pdf";

export async function downloadPublishedResumePdf(endpoint: string): Promise<void> {
  const requestUrl = new URL(endpoint, window.location.origin);
  requestUrl.searchParams.set("published", Date.now().toString());
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(requestUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/pdf"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`PDF request failed with status ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/pdf")) {
      throw new Error("The resume service returned an unexpected response.");
    }

    const pdf = await response.blob();
    if (pdf.size < 5) {
      throw new Error("The generated PDF was empty.");
    }

    const signatureBytes = new Uint8Array(await pdf.slice(0, 5).arrayBuffer());
    const signature = String.fromCharCode(...signatureBytes);
    if (signature !== "%PDF-") {
      throw new Error("The generated file was not a valid PDF.");
    }

    const objectUrl = URL.createObjectURL(pdf);
    const downloadLink = document.createElement("a");
    downloadLink.href = objectUrl;
    downloadLink.download = DEFAULT_FILENAME;
    downloadLink.hidden = true;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("The resume service took too long to respond.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
