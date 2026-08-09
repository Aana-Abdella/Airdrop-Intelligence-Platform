export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const sensitiveKey =
  /(token|secret|password|api.?key|authorization|cookie|private.?key|seed|mnemonic)/i;

function redact(value: unknown): unknown {
  if (typeof value === 'string') return value.length > 0 ? '[REDACTED]' : value;
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sensitiveKey.test(key) ? '[REDACTED]' : redact(entry),
      ]),
    );
  }
  return value;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

const levelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function createLogger(
  minimumLevel: LogLevel = 'info',
  sink: Pick<Console, 'debug' | 'info' | 'warn' | 'error'> = console,
): Logger {
  const write = (
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ) => {
    if (levelWeight[level] < levelWeight[minimumLevel]) return;
    const payload = context ? ` ${JSON.stringify(redact(context))}` : '';
    sink[level](`[${level}] ${message}${payload}`);
  };

  return {
    debug: (message, context) => write('debug', message, context),
    info: (message, context) => write('info', message, context),
    warn: (message, context) => write('warn', message, context),
    error: (message, context) => write('error', message, context),
  };
}
