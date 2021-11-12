'use strict';

module.exports = async function(req, res) {
    if (!req.body.key) {
        res.send("Error: missing key in request body");
        return;
    }
    // const hash = this.table.getHashCode(req.body.key);
    // const bind_index = hash % this.id_max;
    // const node_index = this.ceil_bsearch(this.nodeTable, bind_index);
    // const node_succ = (node_index + 1)%this.nodeTable.length;
    // const node_pred = (((node_index - 1)%this.nodeTable.length) + this.nodeTable.length)%this.nodeTable.length;
    const node_index = this.getNodeIndex(req.body.key);
    const node_succ = this.getSucc(node_index);
    const node_pred = this.getPred(node_index);

    const response1 = await this.Requester.delete(this.nodeTable[node_index].url + "/bind?key=" + req.body.key);
    const response2 = await this.Requester.delete(this.nodeTable[node_succ].url + "/bind?key=" + req.body.key);
    const response3 = await this.Requester.delete(this.nodeTable[node_pred].url + "/bind?key=" + req.body.key);
    if (response1.error != "none" && response2.error != "none" && response3.error != "none") {
        res.send("Failed");
    }
    else {
        res.send("Success");
    }
}