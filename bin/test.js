const axios = require("axios");


const test = async function(){
    var response = await axios.post("http://localhost:3000/insert", {
        "key": "1",
        "lock_type": "write"
    })
    console.log(response.data);

    response = await axios.post("http://localhost:3000/insert", {
        "key": "2",
        "lock_type": "write"
    })
    console.log(response.data);
}
test();