'use strict';
const FileManager = require('./utils/FileManager.js');
const Requester = require('./utils/Requester.js');

const postDelete = require("./routes/delete");
const deleteBinding = require("./routes/deletebinding");
const getAllBindings = require("./routes/getAllBindings");
const getBinding = require("./routes/getBinding");
const getBindings = require("./routes/getBindings");
const getNodeTable = require("./routes/getNodeTable");
const insert = require("./routes/insert");
const join = require("./routes/join");
const lookup = require("./routes/lookup");
const notify = require("./routes/notify");
const putbinding = require("./routes/putbinding");

class Router {
    constructor(hashTable, config) {
        this.ceil_bsearch = require('./utils/ceil_bsearch.js');
        this.express = require("express");
        this.axios = require('axios');

        this.app = this.express();
        this.app.use(this.express.json());
        this.app.use(this.express.urlencoded({extended: false}));
        
        this.table = hashTable;
        this.port = config.PORT;
        this.id_max = config.ID_MAX;
        this.FileManager = new FileManager(config.DATA_DIR);
        this.Requester = new Requester();

        this.node = {
            url: config.URL,
            id: config.ID
        }
        var temp = this.FileManager.getNodes();
        if (temp.length > 0) {
            this.nodeTable = temp;
        }
        else {
            this.nodeTable = [this.node];
            this.FileManager.writeNodes(this.nodeTable);
        }
        this.stabilize();


        // Higher level endpoints
        this.app.post("/join", join.bind(this));
        this.app.get("/lookup", lookup.bind(this));
        this.app.post("/insert", insert.bind(this));
        this.app.post("/delete", postDelete.bind(this));
        this.app.get("/all_bindings", getAllBindings.bind(this));

        // Lower level endpoints
        this.app.get("/node_table", getNodeTable.bind(this));
        this.app.get("/bindings", getBindings.bind(this));
        this.app.get("/binding", getBinding.bind(this));
        this.app.post("/bind", putbinding.bind(this));
        this.app.delete("/bind", deleteBinding.bind(this));
        this.app.post("/notify", notify.bind(this));
    }

    async notifyAll(){
        for (var i = 0; i < this.nodeTable.length; i++){
            const data = {
                "nodeTable": this.nodeTable
            };
            await this.axios.post(this.nodeTable[i].url + "/notify", data);
        }
    }

    sortNodeTable(){
        this.nodeTable.sort(function(a, b) {
            if (a.id < b.id) {
                return -1;
            }
            return 1;
        });

    }

    start() {
        try {
            this.server = this.app.listen(this.port, function(){
                console.log("DHT Node Listening on port " + this.port.toString());
            }.bind(this));
        }
        catch(err) {
            console.log(err);
            throw err;
        }
    }

    stop() {
        try {
            this.server.close();
        }
        catch(err) {
            console.log(err);
            throw err;
        }
    }

    async stabilize() {
        const node_index = this.ceil_bsearch(this.nodeTable, this.node.id);
        const node_succ = (node_index + 1)%this.nodeTable.length;
        const node_pred = (((node_index - 1)%this.nodeTable.length) + this.nodeTable.length)%this.nodeTable.length;

        const response_succ = await this.Requester.get(this.nodeTable[node_succ].url + "/bindings");
        const response_pred = await this.Requester.get(this.nodeTable[node_pred].url + "/bindings");

        if (response_succ.error == "none"){
            for (var i = 0; i < response_succ.response.length; i++) {
                const binding = response_succ.response[i];

                const hash = this.table.getHashCode(binding.key);
                const bind_index = hash % this.id_max;
                const node_index = this.ceil_bsearch(this.nodeTable, bind_index);
                const node_succ = (node_index + 1)%this.nodeTable.length;
                const node_pred = (((node_index - 1)%this.nodeTable.length) + this.nodeTable.length)%this.nodeTable.length;
                
                var insert = false;
                var replica = false;
                if (this.nodeTable[node_index].id == this.node.id) {
                    insert = true;
                }
                else if (this.nodeTable[node_succ].id == this.node.id) {
                    insert = true;
                    replica = true;
                }
                else if (this.nodeTable[node_pred].id == this.node.id) {
                    insert = true;
                    replica = true;
                }
                if (insert) {
                    if (replica) {
                        binding.value.state = 'replica'
                    }
                    else {
                        binding.value.state = 'main'
                    }
                    this.table.insert(binding.key, binding.value);
                }
            }
        }

        if (response_pred.error == "none") {
            for (var i = 0; i < response_pred.response.length; i++) {
                this.table.insert(response_pred.response[i].key, response_pred.response[i].value);
            }
        }

    }
}

module.exports = Router;