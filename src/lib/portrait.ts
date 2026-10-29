const plates = new Map<string, Promise<string>>();

/**
 * Flattens a transparent cut-out onto pure black and lifts the subject's deepest tones.
 * Black is what screen-blending erases, so the dithered portrait melts into the scene
 * while the lift keeps the black t-shirt's silhouette as a sparse field of dots.
 */
export function darkPlate(src: string, lift = 0.2) {
  let plate = plates.get(src);
  if (!plate) {
    plate = new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('2D canvas unavailable'));
        ctx.drawImage(img, 0, 0);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = `rgb(255 255 255 / ${lift})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error('Encoding failed'))), 'image/png');
      };
      img.onerror = () => reject(new Error(`Could not load ${src}`));
      img.src = src;
    });
    plate.catch(() => plates.delete(src));
    plates.set(src, plate);
  }
  return plate;
}
