const express = require('express');
const app = express();
const port = 9000;

// Middleware to log details of each request
app.use((req, res, next) => {
    const now = new Date().toISOString();
    console.log(`${now} - ${req.method} request to ${req.url}`);
    next(); // Continue to the next middleware or route handler
});


// Serve static content from the 'public' directory
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

