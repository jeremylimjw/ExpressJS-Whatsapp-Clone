const COOKIE_NAME = "chocolatechip";

async function requireLogin(req, res, next) {
    // github.io does not support cookies
    // Get attached token from cookies
    // const userId = req.cookies[COOKIE_NAME];

    // Get userId from headers
    const userId = req.headers.authorization;

    if (userId == null) {
        res.status(401).send('Unauthorized, login required.');
        return;
    }

    // Assign user to variable to be used further down the pipeline
    res.locals.user = { id: userId };

    next();
}

module.exports = { COOKIE_NAME, requireLogin }