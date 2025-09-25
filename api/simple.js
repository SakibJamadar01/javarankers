export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Simple API working',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}