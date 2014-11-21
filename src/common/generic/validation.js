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
var serialization = require("./serialization");

var clone = serialization.clone;
var notMetaData = serialization.isNotMetaData;

var prependPath = function (validationFailure, path) {
    if (path != null && !Array.isArray(path)) {
        path = [ path ];
    }
    if (path == null || path.length == 0) {
        return;
    }
    validationFailure.errors.forEach(function (error) {
        error.path = path.concat(error.path);
    });
};

exports.validationFailurePrependPath = prependPath;

var validationFailureDetails = function (validationFailure) {
    var res = [ "ValidationFailure:\n" ];
    validationFailure.errors.forEach(function (error) {
        res.push(" - in ", [ "<root>" ].concat(error.path).join("."), ": ", error.id, " ", error.args, "\n");
    });
    return res.join("");
};

exports.validationFailureDetails;

var validationFailures = function (array) {
    var res = new Error();
    res.name = "ValidationFailure";
    if (array.length == 1) {
        res.errors = array[0].errors;
    } else {
        var errors = [];
        array.forEach(function (err) {
            errors.push.apply(errors, err.errors);
        });
        res.errors = errors;
    }
    res.toString = validationFailureDetails.bind(null, res);
    return res;
};

exports.validationFailures = validationFailures;

var validationFailure = function (id, args, path) {
    var res = new Error();
    res.name = "ValidationFailure";
    res.errors = [ {
        id : id,
        args : args || null,
        path : path ? path.slice(0) : []
    } ];
    res.toString = validationFailureDetails.bind(null, res);
    return res;
};

exports.validationFailure = validationFailure;

var isValidationFailure = function (error) {
    return error instanceof Error && error.name == "ValidationFailure" && error.errors;
};

exports.isValidationFailure = isValidationFailure;

var arrayToKeys = function (array) {
    var res = Object.create(null);
    array.forEach(function (key) {
        res[key] = 1;
    });
    return res;
};

var validator = function (validators) {
    if (typeof validators == "function") {
        return validators;
    } else if (Array.isArray(validators)) {
        return function (value) {
            validators.forEach(function (fn) {
                value = fn(value);
            });
            return value;
        };
    }

};

exports.validator = validator;

exports.inPath = function (path, config) {
    var itemValidator = validator(config);
    return function (value) {
        try {
            return itemValidator(value);
        } catch (e) {
            if (isValidationFailure(e)) {
                prependPath(e, path);
            }
            throw e;
        }
    };
};

exports.object = function (config) {
    var configKeys = Object.keys(config);
    return function (value) {
        if (typeof value != "object") {
            throw validationFailure("object");
        }
        var errors = [];
        var newObject = {};
        var remainingProperties = arrayToKeys(Object.keys(value).filter(notMetaData));
        configKeys.forEach(function (key) {
            try {
                var newValue = validator(config[key])(value[key]);
                if (newValue !== undefined) {
                    newObject[key] = newValue;
                }
            } catch (e) {
                if (!isValidationFailure(e)) {
                    throw e;
                }
                prependPath(e, key);
                errors.push(e);
            }
            delete remainingProperties[key];
        });
        remainingProperties = Object.keys(remainingProperties);
        if (remainingProperties.length > 0) {
            errors.push(validationFailure("object.extra-properties", [ remainingProperties ]));
        }
        if (errors.length > 0) {
            throw validationFailures(errors);
        }
        return newObject;
    };
};

exports.array = function (config) {
    var itemValidator = validator(config);
    return function (value) {
        if (!Array.isArray(value)) {
            throw validationFailure("array");
        }
        var errors = [];
        var newArray = [];
        value.forEach(function (curValue, curIndex) {
            try {
                var newValue = itemValidator(curValue);
                if (newValue !== undefined) {
                    newArray.push(newValue);
                }
            } catch (e) {
                if (!isValidationFailure(e)) {
                    throw e;
                }
                prependPath(e, curIndex);
                errors.push(e);
            }
        });
        if (errors.length > 0) {
            throw validationFailures(errors);
        }
        return newArray;
    }
};

exports.map = function (config) {
    var itemValidator = validator(config);
    return function (value) {
        if (typeof value != "object") {
            throw validationFailure("map");
        }
        var errors = [];
        var newObject = {};
        Object.keys(value).forEach(function (key) {
            try {
                var newValue = itemValidator(value[key]);
                if (newValue !== undefined) {
                    newObject[key] = newValue;
                }
            } catch (e) {
                if (!isValidationFailure(e)) {
                    throw e;
                }
                prependPath(e, key);
                errors.push(e);
            }
        });
        if (errors.length > 0) {
            throw validationFailures(errors);
        }
        return newObject;
    }
};

exports.minLength = function (minLength) {
    return function (value) {
        if (value.length < minLength) {
            throw validationFailure("minLength");
        }
        return value;
    }
};

exports.string = function (value) {
    if (typeof value !== "string") {
        throw validationFailure("string");
    }
    return value;
};

exports.number = function (value) {
    if (typeof value !== "number") {
        throw validationFailure("number");
    }
    return value;
};

exports.integer = function (value) {
    if (typeof value !== "number" && Math.floor(value) !== value) {
        throw validationFailure("integer");
    }
    return value;
}

exports.minValue = function (minValue) {
    return function (value) {
        if (value < minValue) {
            throw validationFailure("minValue");
        }
        return value;
    };
};

exports.date = function (value) {
    if (!(value instanceof Date)) {
        throw validationFailure("date");
    }
    return value;
};

exports.pastDate = function (value) {
    if (!(value instanceof Date) || value.getTime() > Date.now()) {
        throw validationFailure("pastDate");
    }
    return value;
};

exports.defaultValue = function (defValue) {
    return function (value) {
        return value == null ? clone(defValue) : value;
    };
};

exports.optional = function (config) {
    var itemValidator = validator(config);
    return function (value) {
        if (value != null) {
            return itemValidator(value);
        }
        return undefined;
    };
};

exports.enumValue = function (values) {
    if (Array.isArray(values)) {
        values = arrayToKeys(values);
    }
    return function (value) {
        if (typeof value != "string" || values[value] == null) {
            throw validationFailure("enumValue");
        }
        return value;
    }
};

var regExpValidation = function (regExp) {
    return function (value) {
        if (typeof value != "string" || !regExp.test(value)) {
            throw validationFailure("regExp", regExp + "");
        }
        return value;
    };
};

exports.regExp = regExpValidation;

exports.id = regExpValidation(/^[0-9a-f]{24}$/);
