const express = require('express');
const cors = require('cors')
const routes = require('./routes');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors({ origin: [process.env.REACT_URL], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', routes);

module.exports = app;