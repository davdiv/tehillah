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
var assert = require("assert");
var path = require("path");
var fs = require("fs");
var songValidator = require("../../../../src/common/validation/song");

describe("Song validation", function () {

    var assertInvalid = function (fileName) {
        if (!/\.json$/.test(fileName)) {
            return;
        }
        it(fileName + " is invalid", function () {
            var fullFilePath = path.join(__dirname, "invalid-songs", fileName);
            var fileContent = fs.readFileSync(fullFilePath, {
                encoding : "utf8"
            });
            var json = JSON.parse(fileContent);
            assert.throws(function () {
                songValidator(json.song);
            }, function (error) {
                assert.deepEqual(error.errors, json.errors);
                return true;
            });
        });
    };

    var assertValid = function (fileName) {
        if (!/\.json$/.test(fileName)) {
            return;
        }
        it(fileName + " is valid", function () {
            var fullFilePath = path.join(__dirname, "valid-songs", fileName);
            var fileContent = fs.readFileSync(fullFilePath, {
                encoding : "utf8"
            });
            var json = JSON.parse(fileContent);
            var output1 = songValidator(json);
            var output2 = songValidator(output1);
            assert.deepEqual(output1, output2);
        });
    };

    fs.readdirSync(path.join(__dirname, "invalid-songs")).forEach(assertInvalid);
    fs.readdirSync(path.join(__dirname, "valid-songs")).forEach(assertValid);

});