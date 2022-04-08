require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');

const server = http.createServer(app);

mongoose.connect(process.env.MONGODB_URL).then(async() => {
  console.log('Connected to MongoDB');

  const { init } = require('./socket');
  await init(server);
  console.log("Web socket initialized");
  
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Listening to port ${port}`);
  });
})

