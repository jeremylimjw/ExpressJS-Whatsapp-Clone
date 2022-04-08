function assertNotNull(obj) {
    let str = '';

    for (let key of Object.keys(obj)) {
        if (obj[key] == null) {
            str += `'${key}'`;
        }
    }

    if (str !== '') {
        throw `${str} is required`;
    }
}

module.exports = { assertNotNull }