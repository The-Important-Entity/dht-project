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
