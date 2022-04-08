const express = require('express');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/user',
    route: require('./user.route'),
  },
  {
    path: '/auth',
    route: require('./auth.route'),
  },
  {
    path: '/channel',
    route: require('./channel.route'),
  },
  {
    path: '/text',
    route: require('./text.route'),
  },
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;