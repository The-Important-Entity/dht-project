'use strict';

module.exports = async function(req, res) {
    if (!req.body.key || !req.body.lock_type) {
        res.send("Error: missing key value pair in request body");
        return;
    }
    const hash = this.table.getHashCode(req.body.key);
    const bind_index = hash % this.id_max;

    const node_index = this.ceil_bsearch(this.nodeTable, bind_index);
    const node_succ = (node_index + 1)%this.nodeTable.length;
    const node_pred = (((node_index - 1)%this.nodeTable.length) + this.nodeTable.length)%this.nodeTable.length;

    const response1 = await this.Requester.post(this.nodeTable[node_index].url + "/bind", {
        "key": req.body.key,
        "url": this.node.url,
        "value": {
            "lock_type": req.body.lock_type,
            "state": "main",
            "url": this.node.url,
            "time": Date.now()
        }
    });

    const response2 = await this.Requester.post(this.nodeTable[node_succ].url + "/bind", {
        "key": req.body.key,
        "value": {
            "lock_type": req.body.lock_type,
            "state": "replica",
            "url": this.node.url,
            "time": Date.now()
        }
    });

    const response3 = await this.Requester.post(this.nodeTable[node_pred].url + "/bind", {
        "key": req.body.key,
        "url": this.node.url,
        "value": {
            "lock_type": req.body.lock_type,
            "state": "replica",
            "url": this.node.url,
            "time": Date.now()
        }
    });
    if (response1.error != "none" && response2.error != "none" && response3.error != "none") {
        res.send("Failed");
    }
    else {
        res.send("Success");
    }
}