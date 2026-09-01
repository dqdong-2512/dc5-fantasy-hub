/**
 * Same-origin FPL API for Cloudflare Pages.
 *
 * Cloudflare deploys this file automatically with the Pages project, so the
 * React application can keep using /api/fpl without a separately deployed
 * Worker, cross-origin configuration, or a production Wrangler login.
 */
import fplWorker, { type Env } from '../../../worker/src/index';

interface PagesFunctionContext<TEnv> {
  request: Request;
  env: TEnv;
}

export async function onRequest(context: PagesFunctionContext<Env>): Promise<Response> {
  return fplWorker.fetch(context.request, context.env);
}
