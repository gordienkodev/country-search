export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super();
    this.status = status;
    throw new Error('Not implemented');
  }
}
