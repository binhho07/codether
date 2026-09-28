import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.ts';

describe('loadConfig', () => {
  it('applies defaults', () => {
    const config = loadConfig({});
    expect(config.COLLAB_PORT).toBe(4000);
    expect(config.ALLOWED_ORIGINS).toEqual(['http://localhost:5173']);
  });

  it('parses a comma-separated origin list', () => {
    const config = loadConfig({ ALLOWED_ORIGINS: 'https://a.dev, https://b.dev ,' });
    expect(config.ALLOWED_ORIGINS).toEqual(['https://a.dev', 'https://b.dev']);
  });

  it('throws a readable error on invalid values', () => {
    expect(() => loadConfig({ COLLAB_PORT: 'abc' })).toThrow(/COLLAB_PORT/);
  });
});
