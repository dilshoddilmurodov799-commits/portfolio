import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv } from 'vite';
import type { Plugin } from 'vite';

/**
 * Runs the api/ functions inside `vite dev`, calling the same Web Request → Response handlers
 * that Vercel calls in production, so the whole backend works locally with `npm run dev`.
 */
export function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      // Server-only settings from .env files. Only VITE_-prefixed values ever reach the browser bundle.
      const env = loadEnv(server.config.mode, server.config.root, '');
      for (const [name, value] of Object.entries(env)) process.env[name] ??= value;

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
        if (!url.pathname.startsWith('/api/')) return next();
        const file = /^\/api\/[a-z0-9/-]+$/.test(url.pathname) && join(server.config.root, `${url.pathname}.ts`);
        if (!file || !existsSync(file)) {
          res.statusCode = 404;
          return res.end();
        }
        try {
          const handler = (await server.ssrLoadModule(file))[req.method ?? 'GET'];
          if (typeof handler !== 'function') {
            res.statusCode = 405;
            return res.end();
          }
          const headers = new Headers();
          for (const [name, value] of Object.entries(req.headers)) if (value !== undefined) headers.set(name, String(value));
          // Vercel fills this in production; locally it comes from the socket.
          if (!headers.has('x-forwarded-for')) headers.set('x-forwarded-for', req.socket.remoteAddress ?? '127.0.0.1');
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const body = chunks.length ? Buffer.concat(chunks) : undefined;

          const response: Response = await handler(new Request(url, { method: req.method, headers, body }));
          res.statusCode = response.status;
          response.headers.forEach((value, name) => name !== 'set-cookie' && res.setHeader(name, value));
          const cookies = response.headers.getSetCookie();
          if (cookies.length) res.setHeader('Set-Cookie', cookies);
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}
