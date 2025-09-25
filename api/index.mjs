import { createServer } from '../server/index.js';

let app;

export default async function handler(req, res) {
  try {
    if (!app) {
      app = await createServer();
    }
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Function crashed', details: error.message });
  }
}