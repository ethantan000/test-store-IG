import nextConfig from '../next.config';
import { describe, it, expect } from 'vitest';

describe('next.config', () => {
  it('enables react strict mode', () => {
    expect(nextConfig.reactStrictMode).toBe(true);
  });

  it('allows Unsplash images', () => {
    expect(nextConfig.images?.domains).toContain('images.unsplash.com');
  });
});
