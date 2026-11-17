import { describe, it, expect } from 'vitest';
import { HttpError } from '../src/core/HttpError';

describe('HttpError', () => {
  it('should be an instance of Error', () => {
    const error = new HttpError(500);

    expect(error).toBeInstanceOf(Error);
  });

  it('should store HTTP status', () => {
    const error = new HttpError(404);

    expect(error.status).toBe(404);
  });

  it('should have name HttpError', () => {
    const error = new HttpError(500);

    expect(error.name).toBe('HttpError');
  });

  it('should contain HTTP status in message', () => {
    const error = new HttpError(500);

    expect(error.message).toBe('HTTP error: 500');
  });
});
