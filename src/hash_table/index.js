'use strict';
const {LinkedList} = require("./linkedlist.js");

class HashTable {
    constructor(tableSize){
        this.tableSize = tableSize;
        this.table = new Array(this.tableSize).fill(null);;
    }

    getHashCode(str) {
        var hash = 0, i, chr;
        if (str.length === 0) {
            return hash;
        }

        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return (hash >>> 0);
    };

    insert(key, value) {
        if (this.get(key) != null){
            return -1;
        }
        const hash = this.getHashCode(key);
        const index = hash % this.tableSize;
        
        if (this.table[index] == null){
            this.table[index] = new LinkedList();
        }
        this.table[index].add({
            "key": key,
            "value": value
        });

        return 0;
    }

    get(key) {
        const hash = this.getHashCode(key);
        const index = hash % this.tableSize;

        if (this.table[index] == null){
            return null;
        }

        var temp = this.table[index].head;
        while (temp != null){
            if (temp.element['key'] == key){
                return temp.element;
            }
            temp = temp.next;
        }
        return null;
    }

    delete(key) {
        const hash = this.getHashCode(key);
        const index = hash % this.tableSize;
        const element = this.get(key);

        if (this.table[index] == null){
            return -1;
        }

        const res = this.table[index].removeElement(element);

        if (res == -1){
            return res;
        }
        
        return 0;
    }

    dumpElements(){
        var res = [];
        for (var i = 0; i < this.table.length; i++) {
            if (this.table[i]) {
                var elm = this.table[i].head;
                while (elm) {
                    res.push(elm.element);
                    elm = elm.next;
                } 
            }
        }
        return res;
    }
}

module.exports = HashTable;