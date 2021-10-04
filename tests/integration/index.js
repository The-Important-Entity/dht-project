
const axios = require("axios");
module.exports = async function(tester, num_nodes, ID_MAX) {
    var generated_nodeTable = [];
    for (var i = 0; i < num_nodes; i++) {
        const scaler1 = Math.floor(ID_MAX/num_nodes);
        const scaler2 = Math.floor(ID_MAX/num_nodes/2);
        const id = scaler2 + i * (scaler1);
        const url = "http://localhost:300" + i.toString();
        generated_nodeTable.push({
            "url": url,
            "id": id
        });
    }
    generated_nodeTable = generated_nodeTable.sort((a, b) => {
        if (a.id < b.id) {
            return -1;
        }
        return 1;
    })
    
    const first = generated_nodeTable[0];
    for (var i = 1; i < num_nodes; i++) {
        const response = await axios.post(generated_nodeTable[i].url + '/join', {
            'url': first.url
        });
        
        var info = "Test join node " + i.toString() + " to node 0"; 
        tester.assert(info, response.data, "Success");
    }

    for (var i = 0; i < num_nodes; i++) {
        const response = await axios.get(generated_nodeTable[i].url + '/node_table');
        var info = "Test node " + i.toString() + "'s node_table after all nodes have joined"; 
        tester.assert(info, JSON.stringify(response.data), JSON.stringify(generated_nodeTable));
    }


    tester.printResults();
}