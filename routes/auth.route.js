const express = require('express');
const { assertNotNull } = require('../common/helpers');
const { COOKIE_NAME, requireLogin } = require('../common/middlewares');
const { User } = require('../models');
const router = express.Router();

// Login or register with username
router.post('/', async function(req, res) {
    const { username } = req.body;

    const trimmed = username.replace(/\s/g, "");

    try {
        assertNotNull({ username });
    } catch(err) {
        res.status(400).send(err);
        return;
    }
  
    try {
        let user = await User.findOne({ username: trimmed.toLowerCase() }).lean();

        if (!user) {
            user = await User.create({ username: trimmed.toLowerCase() });
        }
        
        // github.io does not support cookies
        // res.cookie(COOKIE_NAME, user._id);

        res.send(user);
  
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }

});


// Logout - Delete cookie
router.post('/logout', requireLogin, async function(req, res) {
    const user = res.locals.user;

    // github.io does not support cookies
    // res.cookie(COOKIE_NAME, user.id, { maxAge: 0 });

    res.send({});

});


module.exports = router;