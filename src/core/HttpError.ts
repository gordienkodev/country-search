export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP error: ${status}`);

    this.name = 'HttpError';
    this.status = status;
  }
}
