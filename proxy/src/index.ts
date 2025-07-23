import * as dotenv from 'dotenv';
import { createSessionAuthVerifier } from '@commercetools-backend/express';
import { createServer } from 'http';
import { createApplicationLogger } from '@commercetools-backend/loggers';

dotenv.config();
const logger = createApplicationLogger();
const sessionAuthVerifier = (audience: string) =>
  createSessionAuthVerifier({
    audience,
    issuer: process.env.CLOUD_IDENTIFIER as string,
  });

//if you use express there is a middleware available for validating the token:
//  https://docs.commercetools.com/merchant-center-customizations/concepts/integrate-with-your-own-api#usage-for-expressjs
const server = createServer((req, res) => {
  (async () => {
    // Collect the request body
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      let parsedBody;
      try {
        parsedBody = body ? JSON.parse(body) : undefined;
      } catch (e) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
        return;
      }

      const host = req.headers.host;
      const baseUrl = `https://${host}`;
      logger.info(`Processing request ${baseUrl}`);
      try {
        await sessionAuthVerifier(baseUrl)(req);
      } catch (error) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Unauthorized' }));
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          message: 'Hello, world!',
          path: req.url,
          method: req.method,
          body: parsedBody, // <-- Here is the parsed request body
          session: (req as unknown as { session?: string }).session,
          securedConfig: process.env.SECURE,
        })
      );
    });
  })();
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  logger.info(`⚡️ Proxy application listening on port ${PORT}`);
});
