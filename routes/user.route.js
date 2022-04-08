const express = require('express');
const { assertNotNull } = require('../common/helpers');
const { requireLogin } = require('../common/middlewares');
const { User } = require('../models');
const { broadcastToAllSubcribers } = require('../socket');

const router = express.Router();


// Update user display name
router.put('/', requireLogin, async function(req, res) {
  const { name } = req.body;

  try {
    const user = res.locals.user;
    const newUser = await User.updateName(user.id, name);

    broadcastToAllSubcribers(user.id, "update_name", { userId: user.id, name: name })

    res.send(newUser);

  } catch(err) {
    console.log(err);
    res.status(500).send(err);
  }

});


// Check if username exists
router.post('/validate', async function(req, res) {
  const { username } = req.body;

  try {
    assertNotNull({ username });
  } catch(err) {
    res.status(400).send(err);
    return;
  }

  try {
    const result = await User.isUsernameTaken(username);
    
    res.send(result);

  } catch(err) {
    console.log(err);
    res.status(500).send(err);
  }

});


module.exports = router;