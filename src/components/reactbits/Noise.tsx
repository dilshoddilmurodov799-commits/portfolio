// Adapted from ReactBits — Noise (https://reactbits.dev, MIT + Commons Clause).
// Film grain over the whole page. One random tile is drawn once; the layer then just jumps
// its background position a few times a second, so it costs almost nothing per frame.
import { useState } from 'react';

function grainTile(size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = Math.random() * 255;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

interface NoiseProps {
  opacity?: number;
  size?: number;
  /** Fades the grain out entirely, e.g. over a photograph that should stay clean. */
  hidden?: boolean;
}

export default function Noise({ opacity = 0.045, size = 160, hidden = false }: NoiseProps) {
  const [tile] = useState(() => grainTile(size));
  return (
    <div
      aria-hidden="true"
      className="noise transition-opacity duration-700"
      style={{ backgroundImage: `url(${tile})`, opacity: hidden ? 0 : opacity }}
    />
  );
}
