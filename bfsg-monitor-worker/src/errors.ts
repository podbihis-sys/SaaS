export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class BadRequest extends HttpError {
  constructor(message: string) {
    super(400, message);
    this.name = "BadRequest";
  }
}
