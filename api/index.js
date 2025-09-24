const { createServer } = require('../server/index.js');

let app;

module.exports = async (req, res) => {
  if (!app) {
    app = await createServer();
  }
  return app(req, res);
};