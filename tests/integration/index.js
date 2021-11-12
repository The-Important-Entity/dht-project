

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
        const response = await axios.post(generated_nodeTable[i].url + '/join');
        var info = "Test join node " + i.toString() + " to node 0 when body is missing url"; 
        tester.assert(info, response.data, "Error: missing url in request body");
    }
    for (var i = 1; i < num_nodes; i++) {
        const response = await axios.post(generated_nodeTable[i].url + '/join', {
            'url': first.url
        });
        
        var info = "Test join node " + i.toString() + " to node 0"; 
        tester.assert(info, response.data, "Success");
    }
    for (var i = 1; i < num_nodes; i++) {
        const response = await axios.post(generated_nodeTable[i].url + '/join', {
            'url': first.url
        });
        
        var info = "Test join node " + i.toString() + " to node 0 when node id already exists"; 
        tester.assert(info, response.data, "Error: id already exists in the network");
    }
    for (var i = 0; i < num_nodes; i++) {
        const response = await axios.get(generated_nodeTable[i].url + '/node_table');
        var info = "Test node " + i.toString() + "'s node_table after all nodes have joined"; 
        tester.assert(info, JSON.stringify(response.data), JSON.stringify(generated_nodeTable));
    }


    var response;
    var info;

    response = await axios.get(generated_nodeTable[0].url + "/lookup?key=1");
    info = "Test get key when key doesn't exist";
    tester.assert(info, response.data, "Failed");

    response = await axios.get(generated_nodeTable[0].url + "/lookup");
    info = "Test get key when key is missing in query";
    tester.assert(info, response.data, "Error: missing key in request query");


    response = await axios.post(generated_nodeTable[0].url + "/insert");
    info = "Test insert data on node " + i.toString();
    tester.assert(info, response.data, "Error: missing key value pair in request body");



    for (var i = 1; i < num_nodes; i++) {
        response = await axios.get(generated_nodeTable[i].url + "/all_bindings");
        info = "Test get all bindings on node " + i.toString();
        tester.assert(info, JSON.stringify(response.data), JSON.stringify([]));
    }

    for (var i = 0; i < 50; i++) {
        const index = Math.floor(Math.random()*10);
        response = await axios.post(generated_nodeTable[index].url + "/insert", {
            "key": i.toString(),
            "lock_type": "write"
        });
        info = "Test insert data on node " + i.toString();
        tester.assert(info, response.data, "Success");
    }

    response = await axios.post(generated_nodeTable[0].url + "/insert", {
        "key": "1",
        "lock_type": "write"
    });
    info = "Test insert data when key already exists";
    tester.assert(info, response.data, "Failed");

    for (var i = 0; i < 50; i++) {
        const index = Math.floor(Math.random()*10);
        response = await axios.get(generated_nodeTable[index].url + "/lookup?key=" + i.toString());
        info = "Test getting a key on node " + i.toString();
        const bval = (response.data.lock_type == 'write') && (response.data.state == 'main')
        tester.assert(info, bval, true);
    }

    var responses = []
    for (var i = 0; i < 50; i++) {
        const index = Math.floor(Math.random()*10);
        response = await axios.get(generated_nodeTable[index].url + "/all_bindings");
        responses.push(response.data);
    }
    var temp = true;
    for (var i = 0; i < response.length - 1; i++) {
        if (JSON.stringify(responses[i]) != JSON.stringify(response[i+1])){
            temp = false;
        }
    }
    info = "Test get all bindings on all nodes";
    tester.assert(info, temp, true);

    for (var i = 0; i < 50; i++) {
        const index = Math.floor(Math.random()*10);
        response = await axios.post(generated_nodeTable[index].url + "/delete", {
            "key": i.toString()
        });
        info = "Test deleting a key on node " + i.toString();
        tester.assert(info, response.data, "Success");
    }


    tester.printResults();
}