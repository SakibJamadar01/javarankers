export default async function handler(req, res) {
  try {
    // Simple test first
    if (req.url === '/api/ping') {
      return res.status(200).json({ message: 'ping pong', timestamp: new Date().toISOString() });
    }
    
    // Handle test-register specifically
    if (req.url === '/api/test-register') {
      const testRegisterHandler = await import('../api/test-register.js');
      return testRegisterHandler.default(req, res);
    }
    
    // Try to load the server
    const { createServer } = await import('../server/index.js');
    const app = await createServer();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Function crashed', 
      details: error.message,
      stack: error.stack,
      url: req.url
    });
  }
}