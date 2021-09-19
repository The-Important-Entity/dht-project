const dht_node = require("..");


const args = process.argv.slice(2)
const port = args[0];
const url = args[1] + ":" + args[0];
const id = args[2]

var config = {
    "PORT": port,
    "URL": url,
    "ID": id,
    "ID_MAX": 100,
    "DATA_DIR": "C:\\Users\\Joe\\Desktop\\Code\\object-storage\\data\\dht" + "\\" + id,
    "SIZE": 1000
};
var dht = new dht_node(config)

dht.listen();