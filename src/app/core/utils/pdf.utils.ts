export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export function openPdfInNewTab(blob: Blob): Window | null {
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');

  // Si el navegador bloquea popups
  if (!win) {
    URL.revokeObjectURL(url);
    return null;
  }

  // Cuando se cierre la pestaña, liberamos el URL
  const timer = setInterval(() => {
    if (win.closed) {
      clearInterval(timer);
      URL.revokeObjectURL(url);
    }
  }, 1000);

  return win;
}
