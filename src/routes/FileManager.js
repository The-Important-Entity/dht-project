'use strict';
const fs = require('fs');
const path = require('path');

class FileManager {
    constructor(dir){
        this.data_dir = dir;
        this.file_dir = path.join(this.data_dir, '/node_data.json');
        this.init();
    }

    init(){
        if (!fs.existsSync(this.data_dir)){
            fs.mkdirSync(this.data_dir);
        }

        if (!fs.existsSync(this.file_dir)){
            this.writeJson(this.file_dir, []);
        }
    }

    getNodes(){
        return this.readJson(this.file_dir);
    }

    writeNodes(data){
        this.writeJson(this.file_dir, data);
    }

    writeJson(filename, json_data){
        let data = JSON.stringify(json_data);
        fs.writeFileSync(filename, data);
    }

    readJson(filename) {
        let json = fs.readFileSync(filename);
        return JSON.parse(json);
    }
}

module.exports = FileManager;