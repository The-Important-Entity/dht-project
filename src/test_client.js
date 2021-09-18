const axios = require("axios");

const test = async function(){
    try {
        // await axios.post("http://localhost:3000/join", {
        //     "url": "http://localhost:3001"
        // }).then(function(response){
        //     console.log(response.data);
        // });
    
        // await axios.post("http://localhost:3002/join", {
        //     "url": "http://localhost:3001"
        // }).then(function(response){
        //     console.log(response.data);
        // });

        await axios.post("http://localhost:3000/insert", {
            "key": "my_video.mp4",
            "lock_type": "write"
        }).then(function(response){
            console.log(response.data);
        });

        await axios.post("http://localhost:3000/insert", {
            "key": "my_video1234.mp4",
            "lock_type": "write"
        }).then(function(response){
            console.log(response.data);
        });

        await axios.post("http://localhost:3000/insert", {
            "key": "my_video5678.mp4",
            "lock_type": "write"
        }).then(function(response){
            console.log(response.data);
        });

        await axios.get("http://localhost:3000/lookup?key=my_video5678.mp4").then(function(response) {
            console.log(response.data);
        });

        await axios.get("http://localhost:3001/lookup?key=my_video5678.mp4").then(function(response) {
            console.log(response.data);
        });

        await axios.get("http://localhost:3002/lookup?key=my_video5678.mp4").then(function(response) {
            console.log(response.data);
        });

        // await axios.post("http://localhost:3000/delete", {
        //     "key": "my_video5678.mp4"
        // });

        // axios.get("http://localhost:3000/lookup?key=my_video5678.mp4").then(function(response) {
        //     console.log(response.data);
        // });

        // axios.get("http://localhost:3001/lookup?key=my_video5678.mp4").then(function(response) {
        //     console.log(response.data);
        // });

        // axios.get("http://localhost:3002/lookup?key=my_video5678.mp4").then(function(response) {
        //     console.log(response.data);
        // });

    }
    catch(e){
    
    }
}
test();

