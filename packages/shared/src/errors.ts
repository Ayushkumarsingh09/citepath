export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
    public details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorBody(err: AppError | Error) {
  if (err instanceof AppError) {
    return {
      error: { code: err.code, message: err.message, details: err.details },
    };
  }
  return {
    error: { code: "INTERNAL", message: "Something went wrong", details: {} },
  };
}
