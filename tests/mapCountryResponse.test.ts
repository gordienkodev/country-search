import { describe, it, expect } from 'vitest';
import { mapCountryResponse } from '../src/core/mapCountryResponse';

describe('mapCountryResponse', () => {
  it('should map country response correctly', () => {
    const raw = {
      name: 'Germany',
      flags: {
        png: 'https://mysite.com/de.png',
        svg: 'https://mysite.com/de.svg',
      },
      capital: 'Berlin',
      region: 'Europe',
      population: 83240525,
      languages: [{ name: 'German', code: 'deu' }],
    };

    const result = mapCountryResponse(raw);

    expect(result).toEqual({
      name: 'Germany',
      flag: 'https://mysite.com/de.png',
      capital: 'Berlin',
      region: 'Europe',
      population: 83240525,
      languages: ['German'],
    });
  });

  it('should not mutate original response', () => {
    const raw = {
      name: 'France',
      flags: {
        png: 'https://example.com/fr.png',
      },
      capital: 'Paris',
      region: 'Europe',
      population: 68000000,
      languages: [{ name: 'French', code: 'fra' }],
    };

    const original = structuredClone(raw);

    mapCountryResponse(raw);

    expect(raw).toEqual(original);
  });

  it('should handle missing optional fields', () => {
    const raw = {
      name: 'LOL',
      population: 0,
    };

    const result = mapCountryResponse(raw);

    expect(result).toEqual({
      name: 'LOL',
      flag: '',
      capital: '',
      region: '',
      population: 0,
      languages: [],
    });
  });
});
