'use strict';
const { request } = require("express");
const express = require("express");
const axios = require('axios');
const ceil_bsearch = require('./ceil_bsearch.js');

class Router {
    constructor(hashTable, config) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
        
        this.table = hashTable;
        this.port = config.PORT;
        this.id_max = config.ID_MAX;
        this.tableLock = false;

        this.node = {
            url: config.URL,
            id: config.ID
        }
        this.nodeTable = [this.node];
        this.counter = 0;
        this.app.all("*", async function(req, res, next) {
            if (req.path === "/lock") {
                this.tableLock = true;
                res.send("locked");
                return;
            }
            if (req.path === "/unlock") {
                this.tableLock = false;
                res.send("unlocked");
                return;
            }
            if (this.tableLock) {
                res.send("Table is locked");
                return;
            }
            next();
        }.bind(this));

        // this.app.post("/lock", this.lock.bind(this));
        // this.app.post("unlock", this.unlock.bind(this));

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
    }

    // lock(req, res) {
    //     this.tableLock = true;
    //     res.send("locked");
    // }

    // unlock(req, res) {
    //     this.tableLock = false;
    //     res.send("unlucked");
    // }

    async delete(req, res) {
        if (!req.body.key) {
            res.send("Error: missing key in request body");
            return;
        }
        const hash = this.table.getHashCode(req.body.key);
        const bind_index = hash % this.id_max;
        const node_index = ceil_bsearch(this.nodeTable, bind_index);

        const response = await axios.delete(this.nodeTable[node_index].url + "/bind?key=" + req.body.key);
        res.send(response.data);
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

        const response = await axios.post(this.nodeTable[node_index].url + "/bind", {
            "key": req.body.key,
            "value": req.body.lock_type
        });
        res.send(response.data);
    }

    async lookup(req, res) {
        if (!req.query.key) {
            res.send("Error: missing key in request query");
            return;
        }
        const hash = this.table.getHashCode(req.query.key);
        const bind_index = hash % this.id_max;
        const node_index = ceil_bsearch(this.nodeTable, bind_index);
        const response = await axios.get(this.nodeTable[node_index].url + "/binding?key=" + req.query.key)
        res.send(response.data);
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
        this.table.insert(req.body.key, req.body.value);
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
        this.notifyAll();
        res.send("Success");
    }

    async notify(req, res) {
        if (!req.body.nodeTable) {
            res.send("Error: missing node table in request body");
            return;
        }

        this.nodeTable = req.body.nodeTable;
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

    async listen() {
        this.app.listen(this.port, function(){
            console.log("Listening on port " + this.port.toString());
        }.bind(this));
    }
}

module.exports = Router;