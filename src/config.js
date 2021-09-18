'use strict';
var path = require("path");
require('dotenv').config()

const args = process.argv.slice(2)
module.exports = {
    "PORT": args[0] || 3000,
    "URL": args[1] + ":" + args[0],
    "ID": args[2],
    "ID_MAX": process.env.ID_MAX,
    "DATA_DIR": path.join(process.env.DATA_DIR, '/' + args[2])
}