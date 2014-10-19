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
var path = require("path");
var http = require("http");
var minimist = require("minimist");
var express = require("express");
var socketIO = require("socket.io");

var defaultSong = require("./defaultSong");

module.exports = function (argv) {
    argv = minimist(argv);
    var port = parseInt(argv.port || process.env.PORT || "8080", 10);

    var app = express();
    var server = http.createServer(app);
    var io = socketIO(server);
    var currentData = {
        song : defaultSong || {
            lyrics : []
        },
        selectedVerse : 0
    };

    io.on("connect", function (socket) {
        socket.emit("change", currentData);
        socket.on("change", function (event) {
            if (event.song) {
                currentData.song = event.song;
            }
            if (event.selectedVerse !== null) {
                currentData.selectedVerse = event.selectedVerse;
            }
            io.emit("change", currentData);
        });
    });

    app.use(express.static(path.join(__dirname, "../client")));
    app.use("/lib/bootstrap", express.static(path.join(__dirname, "../../lib/bootstrap")));
    app.use("/lib/noder-js", express.static(path.dirname(require.resolve("noder-js/dist/browser/noder.js"))));
    app.use("/lib/hashspace", express.static(path.dirname(require.resolve("hashspace/dist/hashspace-noder.js"))));

    server.listen(port);
    server.on("listening", function () {
        var address = server.address();
        console.log("Listening on %s:%d", address.address, address.port);
    });
};
