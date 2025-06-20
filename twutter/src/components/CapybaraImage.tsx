"use client";

import { useState, useEffect } from 'react';

interface CapybaraImageProps {
  src: string;
  alt: string;
  fallback: React.ReactNode;
}

export default function CapybaraImage({ src, alt, fallback }: CapybaraImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
} 