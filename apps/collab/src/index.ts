import { loadConfig } from './config.ts';
import { createLogger } from './logger.ts';
import { isPistonReachable } from './piston.ts';
import { createHttpServer } from './server.ts';

const config = loadConfig();
const logger = createLogger(config);

const server = createHttpServer({
  logger,
  checkPiston: () => isPistonReachable(config.PISTON_URL),
});

server.listen(config.COLLAB_PORT, config.COLLAB_HOST, () => {
  logger.info(
    { host: config.COLLAB_HOST, port: config.COLLAB_PORT, pistonUrl: config.PISTON_URL },
    'collab server listening',
  );
});

// A single bad request or failed run must never take the whole server down,
// so log unexpected async errors instead of letting Node crash the process.
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'unhandled promise rejection');
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info({ signal }, 'shutting down');
  server.close(() => process.exit(0));
  // Don't hang forever on lingering keep-alive connections.
  setTimeout(() => process.exit(0), 5000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
