'use strict';
const HashTable = require("./src/hash_table");
const Router = require("./src/routes");

class DHT_Node {
    constructor(config) {
        var table = new HashTable(config.SIZE);
        this.router = new Router(table, config);
    }

    async start() {
        try {
            this.router.start();
        }
        catch(err) {
            console.log(err);
            throw err;
        }
    }

    async stop() {
        try {
            this.router.stop();
        }
        catch(err) {
            console.log(err);
            throw err;
        }
    }
}

module.exports = DHT_Node;
