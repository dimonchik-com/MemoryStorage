var deepDiffMapper = function() {
    return {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: 'unchanged',
        map: function(obj1, obj2) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                throw 'Invalid argument. Function given, object expected.';
            }
            if (this.isValue(obj1) || this.isValue(obj2)) {
                return {
                    type: this.compareValues(obj1, obj2),
                    data: (obj1 === undefined) ? obj2 : obj1
                };
            }

            var diff = {};
            for (var key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }

                var value2 = undefined;
                if ('undefined' != typeof(obj2[key])) {
                    value2 = obj2[key];
                }

                diff[key] = this.map(obj1[key], value2);
            }
            for (var key in obj2) {
                if (this.isFunction(obj2[key]) || ('undefined' != typeof(diff[key]))) {
                    continue;
                }

                diff[key] = this.map(undefined, obj2[key]);
            }

            return diff;

        },
        compareValues: function(value1, value2) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
                return this.VALUE_UNCHANGED;
            }
            if ('undefined' == typeof(value1)) {
                console.log("VALUE_CREATED");
                return this.VALUE_CREATED;
            }
            if ('undefined' == typeof(value2)) {
                console.log("VALUE_DELETED");
                return this.VALUE_DELETED;
            }

            // console.log("VALUE_UPDATED");
            return this.VALUE_UPDATED;
        },
        isFunction: function(obj) {
            return {}.toString.apply(obj) === '[object Function]';
        },
        isArray: function(obj) {
            return {}.toString.apply(obj) === '[object Array]';
        },
        isDate: function(obj) {
            return {}.toString.apply(obj) === '[object Date]';
        },
        isObject: function(obj) {
            return {}.toString.apply(obj) === '[object Object]';
        },
        isValue: function(obj) {
            return !this.isObject(obj) && !this.isArray(obj);
        }
    }
}();

var result = deepDiffMapper.map({
    // a:'i am unchanged',
    // b:'i am deleted',
    // e:{a: 'test',lol:2},
    f: {a: 'same',b:[{a:'same'},{d: 'delete'}]},
    // g: new Date('2017.11.25')
},{
    // a:'i am unchanged',
    // c:'i am created',
    // e:{a: 'test',lol:2},
    f: {a: 'same',b:[{a:'same'},{c: 'create'}]},
    // g: new Date('2017.11.25')
});


// if(something) {
//     let keys = Object.keys(something);
//     for (var i in keys) {
//         if (something[keys[i]].hasOwnProperty("type") && something[keys[i]].hasOwnProperty("data")) {
//             path.push(keys[i]);
//             console.log([path,something[keys[i]]]);
//         } else {
//             path.push(keys[i]);
//             let first=(path.length==1)?1:0;
//             parseObject(something[keys[i]],path);
//             if(first) {
//                 path = [];
//             }
//         }
//     }
// }

function parseObject(object, path) {
    let keys = Object.keys(object);
    for(var i in keys){
        if (object[keys[i]].hasOwnProperty("type") && object[keys[i]].hasOwnProperty("data")) {
            var new_path=path.slice();
            new_path.push(keys[i]);
            var r=object[keys[i]];
            if(r.type=="created" || r.type=="deleted") {
                console.log([new_path,r]);
            }
        } else {
            var new_path=path.slice();
            new_path.push(keys[i]);
            parseObject(object[keys[i]],new_path);
        }
    }
}

// parseObject(result,[]);