'use strict';

module.exports = async function(req, res) {
    var all = []
        for (var i = 0; i < this.nodeTable.length; i++) {
            try {
                const response = await this.axios.get(this.nodeTable[i].url + "/bindings");
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