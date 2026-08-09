export type ApiErrorCode =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'VALIDATION'
  | 'UNAVAILABLE'
  | 'UNKNOWN';

export class ApiError extends Error {
  public readonly retryAfterMs?: number;

  public constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status?: number,
    retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    if (retryAfterMs !== undefined) this.retryAfterMs = retryAfterMs;
  }
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'AUTHENTICATION')
      return 'The platform session is not configured or has expired.';
    if (error.code === 'AUTHORIZATION')
      return 'The platform rejected this bot operation.';
    if (error.code === 'NOT_FOUND') return 'That platform resource was not found.';
    if (error.code === 'RATE_LIMITED')
      return 'The platform is rate limiting requests. Please try again shortly.';
    if (error.code === 'UNAVAILABLE')
      return 'The platform API is temporarily unavailable.';
    if (error.code === 'VALIDATION') return 'The platform rejected the supplied data.';
  }
  return 'A platform error occurred. Please try again later.';
}
