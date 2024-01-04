const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).send('Internal Server Error');
});

// Static file serving
app.use(express.static('.'));

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// SSL credentials
const privateKey = fs.readFileSync('/etc/letsencrypt/live/theintersecto.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/theintersecto.com/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Creating HTTPS server
const httpsServer = https.createServer(credentials, app);

// Listening on port 3000
httpsServer.listen(3000, '127.0.0.1', () => {
  console.log('HTTPS Server running on port 3000');
});

