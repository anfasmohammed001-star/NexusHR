import serverless from 'serverless-http';
import app, { ensureInitialized, syncDatabase } from '../../backend/src/server.js';

const FUNCTION_BASE_PATH = '/.netlify/functions/api';
const HOP_BY_HOP_HEADERS = new Set(['connection', 'keep-alive', 'transfer-encoding', 'upgrade']);

function stripFunctionPrefix(value) {
  if (typeof value === 'string' && value.startsWith(FUNCTION_BASE_PATH)) {
    return value.slice(FUNCTION_BASE_PATH.length) || '/';
  }
  return value || '/';
}

const serverlessHandler = serverless(app);

/**
 * Convert Web Standard Request (Netlify Functions v2) to an AWS HTTP API v2.0 event for Express.
 */
function buildLambdaV2Event(req, context, bodyBuffer) {
  const url = new URL(req.url);
  const routeOverride = url.searchParams.get('__route');
  const cleanParams = new URLSearchParams(url.searchParams);
  cleanParams.delete('__route');

  let rawPath;
  if (routeOverride) {
    rawPath = routeOverride.startsWith('/') ? routeOverride : `/${routeOverride}`;
  } else {
    rawPath = stripFunctionPrefix(url.pathname);
  }

  const headers = {};
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return {
    version: '2.0',
    rawPath,
    rawQueryString: cleanParams.toString(),
    headers,
    body: bodyBuffer ? bodyBuffer.toString('base64') : '',
    isBase64Encoded: Boolean(bodyBuffer),
    requestContext: {
      http: {
        method: req.method,
        path: rawPath,
        sourceIp: context?.ip || headers['x-nf-client-connection-ip'] || '127.0.0.1',
      },
      requestId: context?.requestId || headers['x-nf-request-id'] || '',
    },
  };
}

/**
 * Convert serverless-http response payload back into a Web Standard Response.
 */
function toWebResponse(result) {
  const responseHeaders = new Headers();

  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      if (value !== undefined && value !== null && !HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, String(value));
      }
    }
  }

  if (result.multiValueHeaders) {
    for (const [key, values] of Object.entries(result.multiValueHeaders)) {
      if (Array.isArray(values) && !HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        responseHeaders.delete(key);
        for (const val of values) {
          responseHeaders.append(key, String(val));
        }
      }
    }
  }

  if (Array.isArray(result.cookies)) {
    for (const cookie of result.cookies) {
      responseHeaders.append('set-cookie', cookie);
    }
  }

  const status = result.statusCode || 200;
  if (status === 204 || status === 304) {
    return new Response(null, { status, headers: responseHeaders });
  }

  const body = result.isBase64Encoded
    ? Buffer.from(result.body || '', 'base64')
    : (result.body ?? '');

  return new Response(body, { status, headers: responseHeaders });
}

export default async function apiHandler(req, context) {
  await ensureInitialized();
  await syncDatabase();

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const arrayBuf = hasBody ? await req.arrayBuffer() : null;
  const bodyBuffer = arrayBuf && arrayBuf.byteLength > 0 ? Buffer.from(arrayBuf) : null;

  const event = buildLambdaV2Event(req, context, bodyBuffer);
  const result = await serverlessHandler(event, context);
  return toWebResponse(result);
}
