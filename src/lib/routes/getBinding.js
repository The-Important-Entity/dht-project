'use strict';

module.exports = async function(req, res) {
    if (!req.query.key) {
        res.send("Error: missing key in request query");
        return;
    }
    const elm = this.table.get(req.query.key)
    if (elm) {
        res.send(elm.value);
        return;
    }
    res.status(400).send(null);
}