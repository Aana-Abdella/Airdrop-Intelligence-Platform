export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type NodeEnvironment = 'development' | 'test' | 'production';

export interface Environment {
  readonly DISCORD_TOKEN: string;
  readonly DISCORD_CLIENT_ID: string;
  readonly DISCORD_GUILD_ID?: string;
  readonly API_BASE_URL: string;
  readonly API_KEY?: string;
  readonly LOG_LEVEL: LogLevel;
  readonly NODE_ENV: NodeEnvironment;
  readonly ALLOW_INSECURE_LOCAL_API: boolean;
}

function required(values: NodeJS.ProcessEnv, name: string): string {
  const value = values[name]?.trim();
  if (!value) throw new Error(`Invalid bot configuration: ${name}`);
  return value;
}

function optional(values: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = values[name]?.trim();
  return value || undefined;
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
  name: string,
): T {
  if (value === undefined) return fallback;
  if (!allowed.includes(value as T))
    throw new Error(`Invalid bot configuration: ${name}`);
  return value as T;
}

function isDiscordId(value: string): boolean {
  return /^\d{17,20}$/.test(value);
}

export function loadEnvironment(values: NodeJS.ProcessEnv = process.env): Environment {
  const token = required(values, 'DISCORD_TOKEN');
  const clientId = required(values, 'DISCORD_CLIENT_ID');
  const guildId = optional(values, 'DISCORD_GUILD_ID');
  const apiBaseUrl = required(values, 'API_BASE_URL');
  const parsedUrl = new URL(apiBaseUrl);
  const nodeEnvironment = oneOf(
    values.NODE_ENV,
    ['development', 'test', 'production'],
    'development',
    'NODE_ENV',
  );
  const allowInsecureLocalApi = values.ALLOW_INSECURE_LOCAL_API === 'true';
  const apiKey = optional(values, 'API_KEY');

  if (!isDiscordId(clientId) || (guildId !== undefined && !isDiscordId(guildId))) {
    throw new Error(
      'Invalid bot configuration: Discord IDs must be numeric snowflake IDs',
    );
  }
  const localHttp = apiBaseUrl.startsWith('http://localhost');
  if (parsedUrl.protocol !== 'https:' && !(localHttp && allowInsecureLocalApi)) {
    throw new Error(
      'Invalid bot configuration: API_BASE_URL must use HTTPS unless insecure localhost access is explicitly enabled',
    );
  }
  if (allowInsecureLocalApi && !localHttp) {
    throw new Error(
      'Invalid bot configuration: insecure API access is only allowed for localhost',
    );
  }

  const environment = {
    DISCORD_TOKEN: token,
    DISCORD_CLIENT_ID: clientId,
    API_BASE_URL: apiBaseUrl,
    LOG_LEVEL: oneOf(
      values.LOG_LEVEL,
      ['debug', 'info', 'warn', 'error'],
      'info',
      'LOG_LEVEL',
    ),
    NODE_ENV: nodeEnvironment,
    ALLOW_INSECURE_LOCAL_API: allowInsecureLocalApi,
    ...(guildId === undefined ? {} : { DISCORD_GUILD_ID: guildId }),
    ...(apiKey === undefined ? {} : { API_KEY: apiKey }),
  } satisfies Environment;
  if (environment.NODE_ENV === 'production' && environment.ALLOW_INSECURE_LOCAL_API) {
    throw new Error('ALLOW_INSECURE_LOCAL_API cannot be enabled in production');
  }

  return environment;
}
