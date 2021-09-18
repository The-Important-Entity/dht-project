const axios = require('axios');

class Requester {
    constructor(){

    }

    async get(url){
        try {
            const response = await axios.get(url);
            return {
                "error": "none",
                "response": response.data
            }
        }
        catch(e) {
            return {
                "error": "Request Error",
                "response": "Failed"
            }
        }
    }

    async post(url, data) {
        try {
            const response = await axios.post(url, data);
            return {
                "error": "none",
                "response": response
            }
        }
        catch(e) {
            return {
                "error": "Request Error",
                "response": "Failed"
            }
        }
    }

    async delete(url){
        try {
            const response = await axios.delete(url);
            return {
                "error": "none",
                "response": response
            }
        }
        catch(e) {
            return {
                "error": "Request Error",
                "response": "Failed"
            }
        }
    }
}

module.exports = Requester;