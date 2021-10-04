'use strict';

module.exports = async function(req, res) {
    if (!req.body.nodeTable) {
        res.send("Error: missing node table in request body");
        return;
    }

    this.nodeTable = req.body.nodeTable;
    this.FileManager.writeNodes(this.nodeTable);
    res.send("Success");
}