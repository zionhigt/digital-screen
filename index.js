const http = require("http");

const app = require("./app.js");
const server = http.createServer(app);

const config = require("./config.json");

const PORT = process.env.PORT || config.port || 3000;

server.on("listening", function() {
    console.log("Server listening on : " + PORT);
});

server.on("error", function(err) {
    console.error("Server Error /!\\");
    console.error(err);
});

server.listen(PORT);