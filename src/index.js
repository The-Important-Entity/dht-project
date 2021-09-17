'use strict';
const HashTable = require("./hash_table");
const config = require("./config");
const Router = require("./routes");

require('dotenv').config()

const TABLE_SIZE = process.env.TABLESIZE || 1000000;
const table = new HashTable(TABLE_SIZE);
const router = new Router(table, config);

router.listen();