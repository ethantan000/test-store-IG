'use client';

import { useEffect, useState } from 'react';

export default function ScrollBlur() {
  const [blur, setBlur] = useState(false);

  useEffect(() => {
    const handler = () => setBlur(window.scrollY > 0);
    handler();
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 h-10 backdrop-blur-md transition-opacity duration-300 ${
        blur ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
