'use strict';

module.exports = async function(req, res) {
    res.send(this.table.dumpElements());
}