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

var http = require("http");
var https = require("https");
var fs = require("fs");
var minimist = require("minimist");
var mongodb = require("mongodb");
var Server = require("./server");

module.exports = function (argv) {
    argv = minimist(argv, {
        "default" : {
            pfx : "",
            port : process.env.PORT || "8080"
        }
    });
    var pfx = argv.pfx ? fs.readFileSync(argv.pfx) : null;
    var port = parseInt(argv.port, 10);

    var httpServer = pfx ? https.createServer({
        pfx : pfx
    }) : http.createServer();

    var server = new Server(httpServer);

    httpServer.listen(port);
    httpServer.on("listening", function () {
        var address = httpServer.address();
        console.log("Listening on %s:%d", address.address, address.port);
    });

};
