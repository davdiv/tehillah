/*
    Tehillah: Web-based application to manage and display worship songs.
    https://github.com/davdiv/tehillah
    Copyright (C) 2014 DivDE <divde@free.fr>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var jsonStringify = JSON.stringify;
var jsonParse = JSON.parse;

// so that the value is the object in the replacer:
Date.prototype.toJSON = null;

var isServer = global.process && global.process.versions && global.process.versions.node;

// Use UTC dates on the server, local dates on the client
var createDate = isServer ? function (value) {
    var date = value.$date;
    if (value.length === 3) {
        return new Date(Date.UTC(date[0], date[1] - 1, date[2]));
    } else {
        return new Date(date);
    }
} : function (value) {
    var date = value.$date;
    if (value.length === 3) {
        return new Date(date[0], date[1] - 1, date[2]);
    } else {
        return new Date(date);
    }
};
var getDateReplacement = isServer ? function (value) {
    if (value.getUTCHours() === 0 && value.getUTCMinutes() === 0 && value.getUTCSeconds() === 0 &&
        value.getUTCMilliseconds() === 0) {
        // this is a date
        return {
            $date : [ value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate() ]
        };
    } else {
        // this is a timestamp
        return {
            $date : value.getTime()
        };
    }

}
    : function (value) {
        if (value.getHours() === 0 && value.getMinutes() === 0 && value.getSeconds() === 0 &&
            value.getMilliseconds() === 0) {
            // this is a date
            return {
                $date : [ value.getFullYear(), value.getMonth() + 1, value.getDate() ]
            };
        } else {
            // this is a timestamp
            return {
                $date : value.getTime()
            };
        }
    };

var copy = function (src, dst) {
    Object.keys(src).forEach(function (key) {
        dst[key] = src[key];
    });
};

var createError = function (value) {
    var res = new Error();
    copy(value.$error, res);
    return res;
};

var getErrorReplacement = function (error) {
    var errorCopy = {
        name : error.name,
        message : error.message
    };
    copy(error, errorCopy);
    return {
        $error : errorCopy
    };
};

var isMetaData = function (key) {
    return /^\+/.test(key);
};

var isNotMetaData = function (key) {
    return !isMetaData(key);
};

var replacer = function (key, value) {
    if (isMetaData(key)) {
        return undefined;
    }
    if (value instanceof Date) {
        return getDateReplacement(value);
    }
    if (value instanceof Error) {
        return getErrorReplacement(value);
    }
    return value;
};

var reviver = function (key, value) {
    if (value && value.$date) {
        return createDate(value);
    }
    if (value && value.$error) {
        return createError(value);
    }
    return value;
};

var stringify = function (object) {
    return jsonStringify(object, replacer);
};

var parse = function (string) {
    return jsonParse(string, reviver);
};

var clone = function (object) {
    var serialized = stringify(object);
    return parse(serialized);
};

module.exports = {
    stringify : stringify,
    parse : parse,
    replacer : replacer,
    reviver : reviver,
    clone : clone,
    isMetaData : isMetaData,
    isNotMetaData : isNotMetaData
};