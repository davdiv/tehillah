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

var fs = require("fs");
var util = require("util");
var events = require("events");
var path = require("path");
var express = require("express");
var SocketIO = require("socket.io");
var routes = require("../common/routes");

var indexHtml = require("dot").template(fs.readFileSync(path.join(__dirname, "index.html"), "utf8"));
var prodStaticsPath = "/v" + require("../../package.json").version;

var serveIndex = function (req, res) {
    var query = req.query;
    var dev = (query.dev == "true");
    res.send(indexHtml({
        dev : dev,
        staticsPath : (dev ? prodStaticsPath + "-dev" : prodStaticsPath),
        livereload : (query.livereload == "true")
    }));
};

var Server = function (httpServer, database) {
    var self = this;
    this.httpServer = httpServer;
    this.database = database;
    var app = this.app = express();
    var ioServer = this.ioServer = new SocketIO();

    routes.forEach(function (route) {
        app.get(route.path, serveIndex);
    });

    app.use(express.static(path.join(__dirname, "../../build/public")));
    app.use("/lib", express.static(path.join(__dirname, "../../lib")));
    app.use("/lib/noder-js", express.static(path.dirname(require.resolve("noder-js/dist/browser/noder.js"))));
    app.use("/lib/hashspace", express.static(path.dirname(require.resolve("hashspace/dist/hashspace-noder.js"))));

    var currentData = {
        song : require("./defaultSong") || {
            lyrics : []
        },
        selectedVerse : 0
    };

    ioServer.on("connect", function (socket) {
        socket.emit("change", currentData);
        socket.on("change", function (event) {
            if (event.song) {
                currentData.song = event.song;
            }
            if (event.selectedVerse !== null) {
                currentData.selectedVerse = event.selectedVerse;
            }
            ioServer.emit("change", currentData);
        });
    });

    httpServer.on("request", app);
    ioServer.attach(httpServer);
};

module.exports = Server;
