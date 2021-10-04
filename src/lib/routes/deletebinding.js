'use strict';

module.exports = async function(req, res) {
    if (!req.query.key) {
        res.send("Error: missing key in request query");
        return;
    }
    this.table.delete(req.query.key);
    res.send("Success");
}