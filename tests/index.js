const dhtNode = require("..");

const dht_nodes = [];
for (var i = 0; i < 5; i++) {
    const new_node = new dhtNode({
        ID_MAX: 100,
        PORT: 3000 + i,
        URL: "http://localhost:300" + i.toString(),
        ID: 20 + i*20,
        DATA_DIR: "/tmp/data"
    })
}