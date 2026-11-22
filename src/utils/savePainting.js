// Saves a canvas as a PNG file.
//
// Phones and tablets get the share sheet, whose "Save Image" puts the drawing
// in Photos; computers (and any device that cannot share files) download it.
// Everything before navigator.share runs synchronously so the call stays
// inside the visitor's tap, which the share sheet requires.
export function savePainting(canvas, filename) {
  const blob = dataUrlToBlob(canvas.toDataURL('image/png'));
  const touch = window.matchMedia('(pointer: coarse)').matches;

  if (touch && typeof File === 'function' && navigator.canShare) {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).catch((error) => {
        // Closing the sheet is a choice, not a failure.
        if (error?.name !== 'AbortError') download(blob, filename);
      });
      return;
    }
  }
  download(blob, filename);
}

function dataUrlToBlob(dataUrl) {
  const binary = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: 'image/png' });
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// "dessin-2026-11-22-1405.png": the app's name in the visitor's language, then
// the date and time, so successive drawings never overwrite each other.
export function paintingFilename(appName, date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const slug = appName.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${slug}-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}.png`;
}
