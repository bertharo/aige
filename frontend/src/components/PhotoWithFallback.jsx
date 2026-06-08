import React, { useState } from 'react';
import PhotoPlaceholder, { isLikelyBrokenPhotoUrl } from './PhotoPlaceholder';

/**
 * Keeps a real <img> for when URLs work later; shows warm placeholder on
 * known demo URLs (unsplash/picsum) or on load error (404, etc.).
 */
export default function PhotoWithFallback({
  src,
  alt = '',
  index = 0,
  height = 200,
  borderRadius = 12,
  className = '',
  imgClassName = '',
  imgStyle,
  fill = false,
}) {
  const [failed, setFailed] = useState(() => isLikelyBrokenPhotoUrl(src));
  const showPlaceholder = failed || !src;

  const wrapperStyle = fill
    ? { width: '100%', height: '100%', position: 'relative' }
    : { width: '100%', position: 'relative' };

  const placeholderHeight = fill ? '100%' : height;

  return (
    <div className={className} style={wrapperStyle}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={imgClassName}
          style={{
            ...imgStyle,
            display: showPlaceholder ? 'none' : undefined,
          }}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            setFailed(true);
          }}
        />
      ) : null}
      <div
        className="photo-placeholder-wrap"
        style={{
          display: showPlaceholder ? 'flex' : 'none',
          width: '100%',
          height: fill ? '100%' : undefined,
        }}
      >
        <PhotoPlaceholder index={index} height={placeholderHeight} borderRadius={borderRadius} />
      </div>
    </div>
  );
}
