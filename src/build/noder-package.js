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

var findRequires = require('noder-js/findRequires');
var newLines = /[\r\n]+/g;
var moduleFunction = String(require('noder-js/context').prototype.jsModuleEval("$CONTENT$")).replace(newLines, "");

module.exports = function (content, fileName, options) {
    var requires = findRequires(content, true);
    return [ "define(", JSON.stringify(fileName), ",", JSON.stringify(requires), ",",
        moduleFunction.replace("$CONTENT$", function () {
            // Using a function avoids interpreting special replacement patterns
            // in the content, such as $' (which is used in page.js)
            return content;
        }), ");\n" ].join("");
};