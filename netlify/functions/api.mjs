import serverless from 'serverless-http';
import app, { ensureInitialized } from '../../backend/src/server.js';

const FUNCTION_BASE_PATH = '/.netlify/functions/api';

function stripFunctionPrefix(value) {
  if (typeof value === 'string' && value.startsWith(FUNCTION_BASE_PATH)) {
    return value.slice(FUNCTION_BASE_PATH.length) || '/';
  }
  return value;
}

const serverlessHandler = serverless(app, {
  request(req) {
    req.url = stripFunctionPrefix(req.url);
    req.originalUrl = stripFunctionPrefix(req.originalUrl);
  },
});

export async function handler(event, context) {
  await ensureInitialized();
  return serverlessHandler(event, context);
}
