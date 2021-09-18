'use strict';
const HashTable = require("./src/hash_table");
const config = require("./src/config");
const Router = require("./src/routes");
require('dotenv').config()

class DHT_Node {
    constructor(config) {
        var table = new HashTable(config.size);
        this.router = new Router(table, config);
    }

    listen() {
        this.router.listen();
    }
}

module.exports = DHT_Node;

// const TABLE_SIZE = process.env.TABLESIZE || 1000000;

// const args = process.argv.slice(2)
// const port = args[0];
// const url = args[1] + ":" + args[0];
// const id = args[2]
// const id_max = process.env.ID_MAX;
// const data_dir = process.env.DATA_DIR;

// var dht = new DHT_Node(config(port, url, id, id_max, data_dir));
// dht.listen();
