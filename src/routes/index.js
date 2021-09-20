'use strict';
const { request } = require("express");
const express = require("express");
const axios = require('axios');
const ceil_bsearch = require('./ceil_bsearch.js');
const FileManager = require('./FileManager.js');
const Requester = require('./Requester.js');

class Router {
    constructor(hashTable, config) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
        
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
        this.app.post("/join", this.join.bind(this));
        this.app.get("/node_table", this.node_table.bind(this));

        this.app.post("/notify", this.notify.bind(this));

        this.app.post("/insert", this.insert.bind(this));

        this.app.post("/bind", this.bind.bind(this));
        this.app.delete("/bind", this.delete_bind.bind(this));

        this.app.get("/bindings", this.bindings.bind(this));

        this.app.get("/lookup", this.lookup.bind(this));
        this.app.get("/binding", this.get_binding.bind(this));

        this.app.post("/delete", this.delete.bind(this));


        this.app.get("/all_bindings", this.getAllBindings.bind(this));
    }

    async delete(req, res) {
        if (!req.body.key) {
            res.send("Error: missing key in request body");
            return;
        }
        const hash = this.table.getHashCode(req.body.key);
        const bind_index = hash % this.id_max;

        const node_index = ceil_bsearch(this.nodeTable, bind_index);
        const node_succ = (node_index + 1)%this.nodeTable.length;
        const node_pred = (((node_index - 1)%this.nodeTable.length) + this.nodeTable.length)%this.nodeTable.length;

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

    async delete_bind(req, res) {
        if (!req.query.key) {
            res.send("Error: missing key in request query");
            return;
        }
        this.table.delete(req.query.key);
        res.send("Success");
    }

    async insert(req, res) {
        if (!req.body.key || !req.body.lock_type) {
            res.send("Error: missing key value pair in request body");
            return;
        }
        const hash = this.table.getHashCode(req.body.key);
        const bind_index = hash % this.id_max;

        const node_index = ceil_bsearch(this.nodeTable, bind_index);
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

    async lookup(req, res) {
        if (!req.query.key) {
            res.send("Error: missing key in request query");
            return;
        }
        const hash = this.table.getHashCode(req.query.key);
        const bind_index = hash % this.id_max;

        const node_index = ceil_bsearch(this.nodeTable, bind_index);
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

    async get_binding(req, res) {
        if (!req.query.key) {
            res.send("Error: missing key in request query");
            return;
        }
        const elm = this.table.get(req.query.key)
        if (elm) {
            res.send(elm.value);
            return;
        }
        res.send(null);
    }

    async bind(req, res) {
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

    async bindings(req, res) {
        res.send(this.table.dumpElements());
    }

    async node_table(req, res){
        res.send(this.nodeTable);
    }

    async join(req, res) {
        if (!req.body.url) {
            res.send("Error: missing url in request body");
            return;
        }

        const response = await axios.get(req.body.url + "/node_table");
        
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

    async notify(req, res) {
        if (!req.body.nodeTable) {
            res.send("Error: missing node table in request body");
            return;
        }

        this.nodeTable = req.body.nodeTable;
        this.FileManager.writeNodes(this.nodeTable);
        res.send("Success");
    }

    async notifyAll(){
        for (var i = 0; i < this.nodeTable.length; i++){
            const data = {
                "nodeTable": this.nodeTable
            };
            axios.post(this.nodeTable[i].url + "/notify", data);
        }
    }

    async sortNodeTable(){
        this.nodeTable.sort(function(a, b) {
            if (a.id < b.id) {
                return -1;
            }
            return 1;
        });

    }

    async getAllBindings(req, res) {
        var all = []
        for (var i = 0; i < this.nodeTable.length; i++) {
            try {
                const response = await axios.get(this.nodeTable[i].url + "/bindings");
                for (var j = 0; j < response.data.length; j++) {
                    if (response.data[j].value.state == "main"){
                        all.push(response.data[j]);
                    }
                }
            }
            catch {

            }
        }
        res.send(all);
    }

    async start() {
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

    async stop() {
        try {
            this.server.close();
        }
        catch(err) {
            console.log(err);
            throw err;
        }
    }

    async stabilize() {
        const node_index = ceil_bsearch(this.nodeTable, this.node.id);
        const node_succ = (node_index + 1)%this.nodeTable.length;
        const node_pred = (((node_index - 1)%this.nodeTable.length) + this.nodeTable.length)%this.nodeTable.length;

        const response_succ = await this.Requester.get(this.nodeTable[node_succ].url + "/bindings");
        const response_pred = await this.Requester.get(this.nodeTable[node_pred].url + "/bindings");

        if (response_succ.error == "none"){
            for (var i = 0; i < response_succ.response.length; i++) {
                const binding = response_succ.response[i];

                const hash = this.table.getHashCode(binding.key);
                const bind_index = hash % this.id_max;
                const node_index = ceil_bsearch(this.nodeTable, bind_index);
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