
/**
 * Formats mongoose errors into proper array
 *
 * @param {Array} errors
 * @return {Array}
 * @api public
 */

exports.errors = function (errors) {
    var keys = Object.keys(errors)
    var errs = []

    // if there is no validation error, just display a generic error
    if (!keys) {
        return ['Oops! There was an error']
    }

    keys.forEach(function (key) {
        if (errors[key]) errs.push(errors[key].message)
    })

    return errs
}

/**
 * Index of object within an array
 *
 * @param {Array} arr
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.indexof = function (arr, obj) {
    var index = -1; // not found initially
    var keys = Object.keys(obj);
    // filter the collection with the given criterias
    var result = arr.filter(function (doc, idx) {
        // keep a counter of matched key/value pairs
        var matched = 0;

        // loop over criteria
        for (var i = keys.length - 1; i >= 0; i--) {
            if (doc[keys[i]] === obj[keys[i]]) {
                matched++;

                // check if all the criterias are matched
                if (matched === keys.length) {
                    index = idx;
                    return idx;
                }
            }
        };
    });
    return index;
}

/**
 * Find object in an array of objects that matches a condition
 *
 * @param {Array} arr
 * @param {Object} obj
 * @param {Function} cb - optional
 * @return {Object}
 * @api public
 */

exports.findByParam = function (arr, obj, cb) {
    var index = exports.indexof(arr, obj)
    if (~index && typeof cb === 'function') {
        return cb(undefined, arr[index])
    } else if (~index && !cb) {
        return arr[index]
    } else if (!~index && typeof cb === 'function') {
        return cb('not found')
    }
    // else undefined is returned
}

exports.generateUUID = function() {
    var self = {};
    var lut = [];
    for (var i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    self.generate = function() {
        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    };

    return self.generate();
}

exports.getExtOfMimeType = function(mime) {
    switch (mime) {
        case "image/jpeg":
            return ".jpg";
        case "image/gif":
            return ".gif";
        case "image/png":
            return ".png";
        case "image/bmp":
            return ".bmp";
        default:
            return "";
    }
}

exports.findObjInArray = function (array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (''+array[i][key] == ''+value) {
            return i;
        }
    }
    return null;
}

exports.nl2br = function(str, is_xhtml) {
    //  discuss at: http://phpjs.org/functions/nl2br/
    //   example 1: nl2br('Kevin\nvan\nZonneveld');
    //   returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
    //   example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
    //   returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
    //   example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
    //   returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'

    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

    return (str + '')
        .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

exports.regExpEscape = function(s) {
    return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
        replace(/\x08/g, '\\x08');
};

exports.isEmpty = function(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        return this.isEmpty(obj[key]);
    }

    return true;
}

exports.intersection = function(a,b){
    var rs = [], x = a.length;
    while (x--) b.indexOf(a[x])!=-1 && rs.push(a[x]);
    return rs;
}