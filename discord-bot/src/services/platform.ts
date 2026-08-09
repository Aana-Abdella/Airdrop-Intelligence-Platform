import type { ApiClient } from '../api/client.js';

export interface PlatformUser {
  readonly id: number;
  readonly username: string;
  readonly created_at: string;
}

function isPlatformUser(value: unknown): value is PlatformUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    'username' in value &&
    typeof value.username === 'string' &&
    value.username.length > 0 &&
    'created_at' in value &&
    typeof value.created_at === 'string' &&
    !Number.isNaN(Date.parse(value.created_at))
  );
}

export class PlatformService {
  public constructor(private readonly api: ApiClient) {}

  /**
   * Validate a platform user token against the backend's existing `/auth/me`
   * contract. Discord account linking must obtain this token through a future
   * browser-based, one-time verification flow; the bot must never collect a
   * password in Discord.
   */
  public async currentUser(accessToken: string): Promise<PlatformUser> {
    if (accessToken.length === 0) throw new Error('Access token is required');

    const response = await this.api.request<unknown>('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
      retryable: false,
    });
    if (!isPlatformUser(response))
      throw new Error('Invalid user response from platform API');
    return response;
  }
}
