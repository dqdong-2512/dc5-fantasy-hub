/**
 * Cloudflare Pages Function: FPL API Proxy
 * Forwards requests to Fantasy Premier League API
 * Solves CORS issues by proxying server-to-server
 *
 * Route: /api/fpl/*
 * Forwards to: https://fantasy.premierleague.com/api/*
 */

import type { Context } from 'next';

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const { pathname } = new URL(request.url);

  // Extract the path after /api/fpl/
  const pathMatch = pathname.match(/^\/api\/fpl(\/.*)?$/);
  if (!pathMatch) {
    return new Response('Not Found', { status: 404 });
  }

  const fplPath = pathMatch[1] || '/';
  const fplUrl = `https://fantasy.premierleague.com/api${fplPath}`;

  try {
    // Forward the request to FPL API
    const response = await fetch(fplUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'DC5-Fantasy-Hub/1.0 (Cloudflare Pages)',
        Accept: 'application/json',
      },
    });

    // Check for FPL API errors
    if (response.status === 404) {
      return new Response(
        JSON.stringify({
          error: 'Invalid Entry ID',
          message: 'The FPL Team ID does not exist.',
          details: fplUrl,
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          },
        }
      );
    }

    if (response.status === 429) {
      return new Response(
        JSON.stringify({
          error: 'Rate Limited',
          message: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Retry-After': response.headers.get('Retry-After') || '60',
          },
        }
      );
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: `FPL API Error`,
          message: `Received HTTP ${response.status} from FPL API.`,
          statusText: response.statusText,
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Success - return FPL API response
    const responseBody = await response.text();
    return new Response(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('FPL API proxy error:', error);
    return new Response(
      JSON.stringify({
        error: 'Service Unavailable',
        message: 'Fantasy Premier League API is temporarily unavailable.',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};
