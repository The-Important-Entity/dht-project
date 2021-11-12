const dhtNode = require("..");
const fs = require("fs");
const run_integration_tests = require("./integration");
const Asserter = require("./assert");

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

const run_tests = async function(){
    if (fs.existsSync("/tmp/dht")) {
        fs.rmSync("/tmp/dht", {recursive: true, force: true});
    }
    fs.mkdirSync("/tmp/dht");

    const dht_nodes = [];
    const num_nodes = 10;
    const ID_MAX = 100;
    for (var i = 0; i < num_nodes; i++) {
        const scaler1 = Math.floor(ID_MAX/num_nodes);
        const scaler2 = Math.floor(ID_MAX/num_nodes/2);
        const id = scaler2 + i * (scaler1);
        const new_node = new dhtNode({
            ID_MAX: ID_MAX,
            PORT: 3000 + i,
            URL: "http://localhost:300" + i.toString(),
            ID: id,
            DATA_DIR: "/tmp/dht/" + id.toString(),
            SIZE: 10
        })
        await new_node.start();
        dht_nodes.push(new_node);
    }
    const tester = new Asserter();
    await run_integration_tests(tester, num_nodes, ID_MAX);
    for (var i = 0; i < num_nodes; i++) {
        await dht_nodes[i].stop();
    }
    
    //fs.rmdirSync("/tmp/data", {recursive: true, force: true});
}
run_tests();