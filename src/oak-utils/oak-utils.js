/**
 * @license oak-utils v0.1
 * (c) 2015 Totoro-Po
 * License: MIT
 */
(function(window, document, oak) {
    if(!oak) {
        // TODO(Li Xipeng): No oak module defined.
        console.error("No namespace named oak");
    }
    oak.utils = {
        /**
         * @description
         *
         * To judge if a object has specified property.
         *
         * @param {object} obj judgement target.
         * @param {string} prop property.
         * @returns {bool}
         */
        hasOwnProperty: function(obj, prop) {
            var proto = obj.__proto__ || obj.constructor.prototype;
            return (prop in obj) &&
                (!(prop in proto) || proto[prop] !== obj[prop]);
        },
        isArray: function(arr) {
            return arr instanceof Array;
        },
        isFunction: function(obj) {
            return typeof obj === 'function';
        },
        /**
         * @description
         *
         * Get keys from a object.
         *
         * @param {object} obj
         * @returns {object} a keys array.
         */
        keys: function(obj) {
            if(typeof obj !== 'object') {
                // TODO(Li Xipeng): raise error.
                return;
            }
            if(typeof Object.keys === 'function') {
                return Object.keys(obj);
            }
            var keys = [];
            for(var index in obj) {
                keys.push(index);
            }
            return keys;
        },
        equals: function (o1, o2) {
            var isArray = oak.utils.isArray,
                isFunction = oak.utils.isFunction;
            if (o1 === o2) return true;
            if (o1 === null || o2 === null) return false;
            if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
            var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
            if (t1 == t2) {
                if (t1 == 'object') {
                    if (isArray(o1)) {
                        if (!isArray(o2)) return false;
                        if ((length = o1.length) == o2.length) {
                            for(key=0; key<length; key++) {
                                if (!oak.utils.equals(o1[key], o2[key])) return false;
                            }
                            return true;
                        }
                    } else {
                        keySet = {};
                        for(key in o1) {
                            if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
                            if (!oak.utils.equals(o1[key], o2[key])) return false;
                            keySet[key] = true;
                        }
                        for(key in o2) {
                            if (!keySet.hasOwnProperty(key) &&
                                key.charAt(0) !== '$' &&
                                o2[key] !== undefined &&
                                !isFunction(o2[key])) return false;
                        }
                        return true;
                    }
                }
            }
            return false;
        }
    }
})(window, document, oak);
