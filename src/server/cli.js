var path = require("path");
var http = require("http");
var minimist = require("minimist");
var express = require("express");
var socketIO = require("socket.io");

module.exports = function(argv) {
   argv = minimist(argv);
   var port = parseInt(argv.port || process.env.PORT || "8080", 10);

   var app = express();
   var server = http.createServer(app);
   var io = socketIO(server);

   app.use(express.static(path.join(__dirname,"../client")));
   app.use("/lib/bootstrap", express.static(path.join(__dirname,"../../lib/bootstrap")));
   app.use("/lib/noder-js", express.static(path.dirname(require.resolve("noder-js/dist/browser/noder.js"))));
   app.use("/lib/hashspace", express.static(path.dirname(require.resolve("hashspace/dist/hashspace-noder.js"))));

   server.listen(port);
   server.on("listening",function() {
      var address = server.address();
      console.log("Listening on %s:%d", address.address, address.port);
   });
};
