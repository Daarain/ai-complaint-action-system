const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
  try {
    await connectDB();
    app.listen(env.port, () => console.log(`Server listening on port ${env.port}.`));
  } catch (error) {
    console.error('Server startup failed.');
    process.exit(1);
  }
}

start();
