'use strict';

module.exports = async function(req, res) {
    if (!req.body.key || !req.body.value) {
        res.send("Error: missing key in request query");
        return;
    }
    const response = this.table.insert(req.body.key, req.body.value);
    if (response == -1) {
        res.status(400).send("Error: Key already exists");
        return;
    }
    res.send("Success");
}