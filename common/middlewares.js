const COOKIE_NAME = "chocolatechip";

async function requireLogin(req, res, next) {
    // Get attached token from cookies
    const userId = req.cookies[COOKIE_NAME];

    if (userId == null) {
        res.status(401).send('Unauthorized, login required.');
        return;
    }

    // Assign user to variable to be used further down the pipeline
    res.locals.user = { id: userId };

    next();
}

module.exports = { COOKIE_NAME, requireLogin }