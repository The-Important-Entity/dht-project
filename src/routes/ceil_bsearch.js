'use strict';

// Returns an index
function ceil_bsearch(arr, elm) {
    var low = 0;
    var high = arr.length - 1;
    var mid;

    while (high - low >= 0){
        mid = low + Math.ceil((high - low)/2);
        if (arr[mid].id == elm){
            return mid;
        }
        else if (arr[mid].id < elm) {
            low = mid + 1
        }
        else {
            high = mid - 1;
        }
    }

    if (arr[mid].id < elm) {
        return (mid + 1) % arr.length;
    }
    return mid;
}

module.exports = ceil_bsearch;