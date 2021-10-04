'use strict';

module.exports = async function(req, res) {
    if (!req.query.key) {
        res.send("Error: missing key in request query");
        return;
    }
    const hash = this.table.getHashCode(req.query.key);
    const bind_index = hash % this.id_max;

    const node_index = this.ceil_bsearch(this.nodeTable, bind_index);
    const node_succ = (node_index + 1)%this.nodeTable.length;
    const node_pred = (((node_index - 1)%this.nodeTable.length) + this.nodeTable.length)%this.nodeTable.length;

    const response1 = await this.Requester.get(this.nodeTable[node_index].url + "/binding?key=" + req.query.key);
    if (response1.error == "none") {
        res.send(response1.response);
        return;
    }

    const response2 = await this.Requester.get(this.nodeTable[node_succ].url + "/binding?key=" + req.query.key);
    if (response2.error == "none") {
        res.send(response2.response);
        return;
    }

    const response3 = await this.Requester.get(this.nodeTable[node_pred].url + "/binding?key=" + req.query.key);
    if (response3.error == "none") {
        res.send(response3.response);
        return;
    }
    res.send("Failed");
}