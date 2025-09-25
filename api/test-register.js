export default async function handler(req, res) {
  try {
    // Test database connection first
    const { pool } = await import('../server/db.js');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    client.release();
    
    // Test registration logic
    const { register } = await import('../server/routes/auth.js');
    
    // Mock registration request
    const mockReq = {
      body: { username: 'testuser', password: 'testpass123', email: 'test@example.com' },
      ip: '127.0.0.1'
    };
    
    const mockRes = {
      status: (code) => ({ json: (data) => ({ statusCode: code, data }) }),
      json: (data) => ({ statusCode: 200, data })
    };
    
    const registerResult = await register(mockReq, mockRes);
    
    res.status(200).json({
      dbConnection: 'OK',
      dbTime: result.rows[0].time,
      registerTest: registerResult || 'Function executed',
      env: {
        hasDbHost: !!process.env.DB_HOST,
        hasDbPassword: !!process.env.DB_PASSWORD
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}