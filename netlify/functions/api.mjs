import serverless from 'serverless-http';
import { connectLambda } from '@netlify/blobs';
import app, { ensureInitialized, syncDatabase } from '../../backend/src/server.js';

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
  if (event && event.blobs) {
    connectLambda(event);
  }
  await ensureInitialized();
  await syncDatabase();
  return serverlessHandler(event, context);
}
