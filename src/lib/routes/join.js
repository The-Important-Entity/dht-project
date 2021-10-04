'use strict';

module.exports = async function(req, res) {
    if (!req.body.url) {
        res.send("Error: missing url in request body");
        return;
    }

    const response = await this.axios.get(req.body.url + "/node_table");
    
    for (var i = 0; i < response.data.length; i++) {
        if (response.data[i].id == this.node.id) {
            res.send("Error: id already exists in the network");
            return;
        }
    }
    
    this.nodeTable = this.nodeTable.concat(response.data);
    this.sortNodeTable();
    this.FileManager.writeNodes(this.nodeTable);
    this.notifyAll();
    res.send("Success");
}