import { useEffect, useState } from 'react';
import MetallicPaint, { parseLogoImage } from '@/components/MetallicPaint.jsx';

const vivreDefaultParams = {
  patternScale: 2,
  refraction: 0.015,
  edge: 1,
  patternBlur: 0.005,
  liquid: 0.07,
  speed: 0.3,
};

export default function VivreMetallic({
  src = '/vivre-logo.svg',
  params = vivreDefaultParams,
  width = '100%',
  height,
  className = '',
  style,
}) {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(src, { cache: 'force-cache' });
        const blob = await res.blob();
        const file = new File([blob], 'vivre.svg', { type: blob.type || 'image/svg+xml' });
        const parsed = await parseLogoImage(file);
        if (alive) {
          const img = parsed?.imageData ?? null;
          setImageData(img);
        }
      } catch (e) {
        console.error('VivreMetallic load error:', e);
      }
    })();
    return () => { alive = false; };
  }, [src]);

  const wrapperStyle = { width, display: 'grid', placeItems: 'center', ...style };
  if (height) {
    wrapperStyle.height = height;
  } else if (imageData?.width && imageData?.height) {
    wrapperStyle.aspectRatio = imageData.width / imageData.height;
  }

  return (
    <div className={className} style={wrapperStyle}>
      <MetallicPaint imageData={imageData ?? new ImageData(1, 1)} params={params} />
    </div>
  );
}
