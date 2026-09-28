import { pino, type Logger } from 'pino';
import type { Config } from './config.ts';

export type { Logger };

export function createLogger(config: Pick<Config, 'LOG_LEVEL'>): Logger {
  return pino({
    level: config.LOG_LEVEL,
    base: { service: 'collab' },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
